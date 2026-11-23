import crypto from "node:crypto";
import type { VerifiedPayment } from "./types";

const BASE = "https://api.paystack.co";

function key(): string {
  const k = process.env.PAYSTACK_SECRET_KEY;
  if (!k) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return k;
}

export async function initializePaystack(p: {
  email: string;
  amountMinor: number;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, string>;
}): Promise<{ checkoutUrl: string }> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: p.email,
      amount: p.amountMinor,
      currency: p.currency,
      reference: p.reference,
      callback_url: p.callbackUrl,
      metadata: p.metadata,
    }),
  });
  const json = (await res.json()) as { status: boolean; message?: string; data?: { authorization_url: string } };
  if (!res.ok || !json.status || !json.data?.authorization_url) throw new Error(`Paystack initialise failed: ${json.message ?? res.status}`);
  return { checkoutUrl: json.data.authorization_url };
}

/** Server-to-server verification against Paystack. This — not any browser callback — is proof of payment. */
export async function verifyPaystack(reference: string): Promise<VerifiedPayment> {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${key()}` },
    cache: "no-store",
  });
  const json = (await res.json()) as {
    status: boolean;
    data?: { id: number; status: string; amount: number; currency: string; reference: string };
  };
  if (!res.ok || !json.status || !json.data) return { paid: false, reason: "verification_failed" };
  const d = json.data;
  return {
    paid: d.status === "success",
    reference: d.reference,
    providerTransactionId: String(d.id),
    amountMinor: d.amount,
    currency: d.currency.toUpperCase(),
    status: d.status,
  };
}

export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha512", key()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
