import { connectDb } from "@/lib/database/connect";
import { Purchase, type PurchaseDoc } from "@/models/Purchase";
import { Transaction } from "@/models/Transaction";
import { Ticket } from "@/models/Ticket";
import { generatePurchaseCode, ticketCode } from "./codes";
import { notifyAdminOfPurchase, notifyCustomer } from "@/lib/notifications/notification.service";
import { formatMoney, formatDate } from "@/lib/utils/format";
import { siteConfig } from "@/config/site.config";
import type { VerifiedPayment } from "@/lib/payments/types";
import { isVerified } from "@/lib/payments/types";

type PurchaseLean = PurchaseDoc & { _id: unknown };

export interface FulfilResult {
  purchase: PurchaseLean | null;
  /** True only for the single call that actually issued the code. */
  firstTime: boolean;
}

/**
 * Turns a VERIFIED provider payment into a paid purchase. Idempotent and race-safe:
 *  1. amount + currency must match what we stored when the checkout was created;
 *  2. the pending -> paid transition is one atomic update, so only one caller can win it —
 *     the code is generated, tickets created and notifications sent exactly once,
 *     however many webhooks / page loads arrive;
 *  3. unique indexes on purchaseCode, Transaction.reference and (provider, providerTransactionId)
 *     make reuse of any reference impossible.
 * A purchase code is never issued unless `verified.paid` is true.
 */
export async function fulfilPurchase(
  reference: string,
  verified: VerifiedPayment,
): Promise<FulfilResult> {
  await connectDb();
  const existing = await Purchase.findOne({ reference }).lean<PurchaseLean>();
  if (!existing) return { purchase: null, firstTime: false };
  if (existing.status === "paid") return { purchase: existing, firstTime: false };
  if (!isVerified(verified) || !verified.paid) return { purchase: existing, firstTime: false };

  if (
    verified.amountMinor !== existing.amountMinor ||
    verified.currency.toUpperCase() !== existing.currency.toUpperCase()
  ) {
    await Purchase.updateOne({ reference, status: "pending" }, { $set: { status: "mismatch" } });
    console.error(`[payments] amount/currency mismatch for ${reference}`);
    return {
      purchase: await Purchase.findOne({ reference }).lean<PurchaseLean>(),
      firstTime: false,
    };
  }

  let claimed: PurchaseLean | null = null;
  for (let attempt = 0; attempt < 6 && !claimed; attempt++) {
    try {
      claimed = await Purchase.findOneAndUpdate(
        { reference, status: "pending" },
        {
          $set: {
            status: "paid",
            purchaseCode: generatePurchaseCode(),
            paidAt: new Date(),
            providerReference: verified.providerTransactionId,
          },
        },
        { new: true },
      ).lean<PurchaseLean>();
      if (!claimed) {
        // Someone else already completed it.
        return {
          purchase: await Purchase.findOne({ reference }).lean<PurchaseLean>(),
          firstTime: false,
        };
      }
    } catch (e: unknown) {
      if ((e as { code?: number }).code !== 11000) throw e; // retry only on purchaseCode collision
    }
  }
  // if (!claimed || !claimed.purchaseCode)
  //   throw new Error("Could not allocate a unique purchase code");
  if (!claimed || !claimed.purchaseCode) {
    throw new Error("Could not allocate a unique purchase code");
  }

  if (!claimed.customer?.fullName?.trim() || !claimed.customer?.email?.trim()) {
    throw new Error(`Paid purchase ${reference} is missing required customer details.`);
  }

  try {
    await Transaction.create({
      provider: claimed.provider,
      providerTransactionId: verified.providerTransactionId,
      reference,
      purchaseCode: claimed.purchaseCode,
      amountMinor: verified.amountMinor,
      currency: verified.currency,
      status: verified.status,
    });
  } catch (e: unknown) {
    if ((e as { code?: number }).code !== 11000) throw e;
  }

  if (claimed.itemType === "event") {
    const docs = Array.from({ length: claimed.quantity }, (_, i) => ({
      ticketCode: ticketCode(claimed!.purchaseCode!, i + 1),
      purchaseCode: claimed!.purchaseCode!,
      holderName: claimed!.customer?.fullName || "Unknown Customer",
      holderEmail: claimed!.customer?.email || "",
      eventSlug: claimed!.eventSlug,
      eventName: claimed!.eventName,
      tierName: claimed!.ticketTierName,
    }));

    await Ticket.insertMany(docs, { ordered: false }).catch((error) => {
      console.error("[tickets] Ticket creation failed:", error);
      throw error;
    });
  }
  // if (claimed.itemType === "event") {
  //   const docs = Array.from({ length: claimed.quantity }, (_, i) => ({
  //     ticketCode: ticketCode(claimed!.purchaseCode!, i + 1),
  //     purchaseCode: claimed!.purchaseCode!,
  //     holderName: claimed!.customer?.fullName || "Unknown Customer",
  //     holderEmail: claimed!.customer?.email || "",
  //     eventSlug: claimed!.eventSlug,
  //     eventName: claimed!.eventName,
  //     tierName: claimed!.ticketTierName,
  //   }));
  //   await Ticket.insertMany(docs, { ordered: false }).catch(() => undefined);
  // }

  await sendPurchaseNotifications(claimed);
  await Purchase.updateOne({ reference }, { $set: { notifiedAt: new Date() } });
  return { purchase: claimed, firstTime: true };
}

async function sendPurchaseNotifications(p: PurchaseLean) {
  const customer = p.customer;

  if (!customer?.fullName?.trim() || !customer?.email?.trim()) {
    console.error(`[notifications] Missing customer details for ${p.reference}`);
    return;
  }

  const amount = formatMoney(p.amountMinor, p.currency);
  const when = formatDate(p.paidAt ?? new Date(), true);

  const customerName = customer.fullName.trim();
  const customerEmail = customer.email.trim();

  // Administrator notification
  try {
    await notifyAdminOfPurchase({
      subject: `Verified payment — ${p.purchaseCode} — ${p.itemName}`,
      replyTo: customerEmail,
      rows: [
        ["Customer", customerName],
        ["Email", customerEmail],
        ["Phone", customer.phone || "Not provided"],
        ["Country", customer.country || "Not provided"],
        ["Purchase code", p.purchaseCode ?? ""],
        ["Item", p.itemName],
        ...(p.eventName
          ? ([
              ["Event", p.eventName],
              ["Ticket category", p.ticketTierName || "Not specified"],
              ["Tickets", String(p.quantity)],
            ] as [string, string][])
          : ([["Quantity", String(p.quantity)]] as [string, string][])),
        ["Amount paid", amount],
        ["Payment provider", p.provider],
        ["Transaction reference", p.reference],
        ["Payment status", "Paid (verified server-side)"],
        ["Date & time", when],
      ],
    });

    console.info(`[notifications] Admin notified for ${p.reference}`);
  } catch (error) {
    console.error(`[notifications] Admin notification failed for ${p.reference}:`, error);
  }

  // Customer notification
  try {
    await notifyCustomer(customerEmail, {
      subject: `Your purchase confirmation — ${siteConfig.brand.name}`,
      rows: [
        ["Thank you", customerName],
        ["Purchase code", p.purchaseCode ?? ""],
        ["Item", p.itemName],
        ["Quantity", String(p.quantity)],
        ["Amount paid", amount],
        [
          "How to use your code",
          p.itemType === "event"
            ? "Present this purchase code and a valid ID at the event entrance."
            : "Keep this code and quote it if you need support with your purchase.",
        ],
      ],
    });

    console.info(`[notifications] Customer notified for ${p.reference}`);
  } catch (error) {
    console.error(`[notifications] Customer notification failed for ${p.reference}:`, error);
  }
}

// async function sendPurchaseNotifications(p: PurchaseLean) {
//   const amount = formatMoney(p.amountMinor, p.currency);
//   const when = formatDate(p.paidAt ?? new Date(), true);
//   try {
//     await notifyAdminOfPurchase({
//       subject: `Verified payment — ${p.purchaseCode} — ${p.itemName}`,
//       replyTo: customerEmail,
//       rows: [
//         ["Customer", customerName],
// ["Email", customerEmail],
// ["Phone", customer.phone || "Not provided"],
// ["Country", customer.country || "Not provided"],
//         ["Purchase code", p.purchaseCode ?? ""],
//         ["Item", p.itemName],
//         ...(p.eventName
//           ? ([
//               ["Event", p.eventName],
//               ["Ticket category", p.ticketTierName],
//               ["Tickets", String(p.quantity)],
//             ] as [string, string][])
//           : ([["Quantity", String(p.quantity)]] as [string, string][])),
//         ["Amount paid", amount],
//         ["Payment provider", p.provider],
//         ["Transaction reference", p.reference],
//         ["Payment status", "Paid (verified server-side)"],
//         ["Date & time", when],
//       ],
//     });
//     await notifyCustomer(p.customer.email, {
//       subject: `Your purchase confirmation — ${siteConfig.brand.name}`,
//       rows: [
//         ["Thank you", p.customer.fullName],
//         ["Purchase code", p.purchaseCode ?? ""],
//         ["Item", p.itemName],
//         ["Quantity", String(p.quantity)],
//         ["Amount paid", amount],
//         [
//           "How to use your code",
//           p.itemType === "event"
//             ? "Present this purchase code (and a valid ID) at the event entrance."
//             : "Keep this code. Quote it if you need support with your purchase.",
//         ],
//       ],
//     });
//   } catch (e) {
//     console.error("[notifications] purchase notification failed", e);
//   }
// }
