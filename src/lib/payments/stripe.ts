import Stripe from "stripe";

let client: Stripe | null = null;

export function stripe(): Stripe {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(k);
  return client;
}

export async function createStripeCheckout(p: {
  email: string;
  reference: string;
  name: string;
  unitAmountMinor: number;
  quantity: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ checkoutUrl: string; sessionId: string }> {
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: p.email,
    client_reference_id: p.reference,
    metadata: { reference: p.reference },
    payment_intent_data: { metadata: { reference: p.reference } },
    line_items: [
      {
        quantity: p.quantity,
        price_data: { currency: p.currency.toLowerCase(), unit_amount: p.unitAmountMinor, product_data: { name: p.name } },
      },
    ],
    success_url: p.successUrl,
    cancel_url: p.cancelUrl,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return { checkoutUrl: session.url, sessionId: session.id };
}

/** Throws unless the signature on the RAW body is valid. */
export function constructStripeEvent(rawBody: string, signature: string | null): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) throw new Error("Missing Stripe webhook secret or signature");
  return stripe().webhooks.constructEvent(rawBody, signature, secret);
}
