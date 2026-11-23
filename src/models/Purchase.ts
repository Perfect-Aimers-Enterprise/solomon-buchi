import mongoose, { Schema, type InferSchemaType } from "mongoose";

const schema = new Schema(
  {
    /** Our own unguessable reference, sent to the provider. Unique — can never be reused. */
    reference: { type: String, required: true, unique: true },
    /** Issued ONLY after server-side payment verification. */
    purchaseCode: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ["pending", "paid", "failed", "mismatch"], default: "pending", index: true },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, index: true },
      phone: { type: String, required: true },
      country: { type: String, required: true },
    },
    itemId: { type: String, required: true },
    itemType: { type: String, enum: ["event", "publication"], required: true },
    itemName: { type: String, required: true },
    eventSlug: { type: String, default: "" },
    eventName: { type: String, default: "" },
    ticketTier: { type: String, default: "" },
    ticketTierName: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitAmountMinor: { type: Number, required: true },
    amountMinor: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true },
    provider: { type: String, enum: ["paystack", "stripe"], required: true },
    providerReference: { type: String, default: "" },
    paidAt: { type: Date },
    notifiedAt: { type: Date },
  },
  { timestamps: true },
);

export type PurchaseDoc = InferSchemaType<typeof schema>;
export const Purchase = (mongoose.models.Purchase as mongoose.Model<PurchaseDoc>) || mongoose.model<PurchaseDoc>("Purchase", schema);
