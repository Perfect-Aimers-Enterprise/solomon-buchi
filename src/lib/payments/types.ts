export type VerifiedPayment =
  | {
      paid: boolean;
      reference: string;
      providerTransactionId: string;
      amountMinor: number;
      currency: string;
      status: string;
    }
  | { paid: false; reason: string };

export function isVerified(v: VerifiedPayment): v is Extract<VerifiedPayment, { reference: string }> {
  return "reference" in v;
}
