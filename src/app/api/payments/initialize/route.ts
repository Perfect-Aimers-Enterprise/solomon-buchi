import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation/schemas";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";
import { connectDb } from "@/lib/database/connect";
import { databaseConfigured, paymentsActive, siteUrl } from "@/lib/utils/features";
import { getCatalogItem } from "@/lib/purchases/catalog";
import { generateReference } from "@/lib/purchases/codes";
import { Purchase } from "@/models/Purchase";
import { siteConfig } from "@/config/site.config";
import { initializePaystack } from "@/lib/payments/paystack";
import { createStripeCheckout } from "@/lib/payments/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!paymentsActive()) return NextResponse.json({ ok: false, error: "Online payments are not available." }, { status: 503 });
  if (!databaseConfigured()) return NextResponse.json({ ok: false, error: "Checkout is temporarily unavailable." }, { status: 503 });

  const rl = rateLimit(`checkout:${clientIp(req)}`, 8, 10 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: "Too many attempts. Please wait a moment." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  const json = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path.at(-1) ?? "form")] = i.message;
    return NextResponse.json({ ok: false, error: "Please correct the highlighted fields.", fields }, { status: 422 });
  }
  const { customer, itemId, quantity } = parsed.data;

  const item = getCatalogItem(itemId);
  if (!item) return NextResponse.json({ ok: false, error: "This item is no longer available." }, { status: 404 });

  const provider = siteConfig.payments.provider;
  const reference = generateReference();
  const amountMinor = item.unitAmountMinor * quantity;

  try {
    await connectDb();
    await Purchase.create({
      reference, status: "pending", customer,
      itemId: item.id, itemType: item.type, itemName: item.name,
      eventSlug: item.eventSlug ?? "", eventName: item.eventName ?? "",
      ticketTier: item.tierId ?? "", ticketTierName: item.tierName ?? "",
      quantity, unitAmountMinor: item.unitAmountMinor, amountMinor, currency: item.currency, provider,
    });

    const confirmUrl = `${siteUrl()}/confirmation?reference=${encodeURIComponent(reference)}`;
    if (provider === "paystack") {
      const { checkoutUrl } = await initializePaystack({
        email: customer.email, amountMinor, currency: item.currency, reference, callbackUrl: confirmUrl,
        metadata: { itemId: item.id, quantity: String(quantity), customer: customer.fullName },
      });
      return NextResponse.json({ ok: true, checkoutUrl });
    }
    const { checkoutUrl, sessionId } = await createStripeCheckout({
      email: customer.email, reference, name: item.name, unitAmountMinor: item.unitAmountMinor, quantity,
      currency: item.currency, successUrl: confirmUrl, cancelUrl: `${siteUrl()}/purchase?item=${encodeURIComponent(item.id)}&cancelled=1`,
    });
    await Purchase.updateOne({ reference }, { $set: { providerReference: sessionId } });
    return NextResponse.json({ ok: true, checkoutUrl });
  } catch (e) {
    console.error("[payments] initialise failed", e);
    await Purchase.updateOne({ reference, status: "pending" }, { $set: { status: "failed" } }).catch(() => undefined);
    return NextResponse.json({ ok: false, error: "We could not start your payment. Please try again." }, { status: 502 });
  }
}
