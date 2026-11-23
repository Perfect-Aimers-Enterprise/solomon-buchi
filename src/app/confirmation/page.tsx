import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDb } from "@/lib/database/connect";
import { databaseConfigured, paymentsActive } from "@/lib/utils/features";
import { Purchase } from "@/models/Purchase";
import { verifyPaystack } from "@/lib/payments/paystack";
import { fulfilPurchase } from "@/lib/purchases/fulfil";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { AutoRefresh } from "@/components/ui/AutoRefresh";

export const metadata: Metadata = {
  title: "Purchase confirmation",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const sp = await searchParams;
  const reference = sp.reference ?? sp.trxref;
  if (!reference || !databaseConfigured() || !/^[A-Za-z0-9\-]{10,80}$/.test(reference)) notFound();

  await connectDb();
  let purchase = await Purchase.findOne({ reference }).lean();
  if (!purchase) notFound();

  // The browser landing here proves nothing. For Paystack we ask Paystack directly; for Stripe we wait for the signed webhook.
  if (purchase.status === "pending" && purchase.provider === "paystack" && paymentsActive()) {
    const verified = await verifyPaystack(reference).catch(() => null);
    if (verified) {
      const r = await fulfilPurchase(reference, verified);
      if (r.purchase) purchase = r.purchase as typeof purchase;
    }
  }

  const paid = purchase.status === "paid" && purchase.purchaseCode;

  return (
    <section className="pt-40 pb-28">
      {purchase.status === "pending" && <AutoRefresh />}
      <div className="container-page max-w-3xl text-center">
        {paid ? (
          <>
            <p className="label mb-8">Payment verified</p>
            <h1 className="text-5xl font-light leading-tight md:text-7xl">
              Thank you,{" "}
              <em className="text-brown">
                {purchase.customer?.fullName?.trim().split(/\s+/)[0] || "there"}.
              </em>
            </h1>
            <div className="mx-auto mt-14 max-w-xl border border-milk p-10">
              <p className="label">Your purchase code</p>
              <p className="mt-4 select-all font-display text-4xl tracking-[0.12em] md:text-5xl">
                {purchase.purchaseCode}
              </p>
            </div>
            <dl className="mx-auto mt-12 grid max-w-xl gap-x-8 gap-y-5 text-left sm:grid-cols-2">
              <div>
                <dt className="label">Item</dt>
                <dd>{purchase.itemName}</dd>
              </div>
              <div>
                <dt className="label">Quantity</dt>
                <dd>{purchase.quantity}</dd>
              </div>
              <div>
                <dt className="label">Amount paid</dt>
                <dd>{formatMoney(purchase.amountMinor, purchase.currency)}</dd>
              </div>
              <div>
                <dt className="label">Date</dt>
                <dd>{purchase.paidAt ? formatDate(purchase.paidAt, true) : "—"}</dd>
              </div>
            </dl>
            <p className="mx-auto mt-12 max-w-lg text-stone">
              {purchase.itemType === "event"
                ? "Please keep this code safe and present it, with a valid ID, at the event entrance. Each ticket is validated once."
                : "Please keep this code safe and quote it if you need any support with your purchase."}{" "}
              {purchase.customer?.email
                ? `A confirmation has been emailed to ${purchase.customer.email} where email delivery is available.`
                : "Your purchase confirmation is available above."}
            </p>
            <div className="mt-12">
              <ButtonLink href="/" variant="outline">
                Return Home
              </ButtonLink>
            </div>
          </>
        ) : purchase.status === "pending" ? (
          <>
            <p className="label mb-8">Confirming payment</p>
            <h1 className="text-5xl font-light leading-tight md:text-6xl">One moment…</h1>
            <p className="mx-auto mt-8 max-w-md text-stone">
              We are waiting for your payment provider to confirm the transaction. This page
              refreshes automatically; no code is issued until the payment is verified.
            </p>
          </>
        ) : (
          <>
            <p className="label mb-8">Payment not completed</p>
            <h1 className="text-5xl font-light leading-tight md:text-6xl">
              We couldn&apos;t verify this payment.
            </h1>
            <p className="mx-auto mt-8 max-w-md text-stone">
              If you were charged, please contact us with reference{" "}
              <span className="font-medium text-charcoal">{purchase.reference}</span> and we will
              resolve it promptly.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <ButtonLink href="/contact">Contact Us</ButtonLink>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
