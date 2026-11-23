import { NextResponse } from "next/server";
import { verifyPaystack, verifyPaystackSignature } from "@/lib/payments/paystack";
import { fulfilPurchase } from "@/lib/purchases/fulfil";
import { paymentsActive } from "@/lib/utils/features";
import { siteConfig } from "@/config/site.config";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!paymentsActive() || siteConfig.payments.provider !== "paystack") return new NextResponse("Not enabled", { status: 404 });

  const raw = await req.text(); // signature is computed over the exact raw body
  if (!verifyPaystackSignature(raw, req.headers.get("x-paystack-signature"))) return new NextResponse("Invalid signature", { status: 401 });

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad payload", { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      // Never trust the webhook body alone: re-verify with Paystack before issuing anything.
      const verified = await verifyPaystack(event.data.reference);
      await fulfilPurchase(event.data.reference, verified);
    } catch (e) {
      console.error("[paystack webhook] failed", e);
      return new NextResponse("Retry", { status: 500 }); // let Paystack retry
    }
  }
  return NextResponse.json({ received: true });
}
