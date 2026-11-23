import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructStripeEvent } from "@/lib/payments/stripe";
import { fulfilPurchase } from "@/lib/purchases/fulfil";
import { paymentsActive } from "@/lib/utils/features";
import { siteConfig } from "@/config/site.config";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!paymentsActive() || siteConfig.payments.provider !== "stripe") return new NextResponse("Not enabled", { status: 404 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = constructStripeEvent(raw, req.headers.get("stripe-signature"));
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const s = event.data.object as Stripe.Checkout.Session;
    const reference = s.client_reference_id ?? s.metadata?.reference;
    if (reference) {
      try {
        await fulfilPurchase(reference, {
          paid: s.payment_status === "paid",
          reference,
          providerTransactionId: typeof s.payment_intent === "string" ? s.payment_intent : s.id,
          amountMinor: s.amount_total ?? 0,
          currency: (s.currency ?? "").toUpperCase(),
          status: s.payment_status,
        });
      } catch (e) {
        console.error("[stripe webhook] failed", e);
        return new NextResponse("Retry", { status: 500 });
      }
    }
  }
  return NextResponse.json({ received: true });
}
