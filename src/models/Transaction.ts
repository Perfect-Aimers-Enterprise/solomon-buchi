import mongoose, { Schema, type InferSchemaType } from "mongoose";

const schema = new Schema(
  {
    provider: { type: String, enum: ["paystack", "stripe"], required: true },
    /** Provider's own transaction / session id. Unique per provider => duplicate webhooks cannot create a second record. */
    providerTransactionId: { type: String, required: true },
    reference: { type: String, required: true, unique: true },
    purchaseCode: { type: String, required: true },
    amountMinor: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true },
    status: { type: String, required: true },
    verifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
schema.index({ provider: 1, providerTransactionId: 1 }, { unique: true });

export type TransactionDoc = InferSchemaType<typeof schema>;
export const Transaction = (mongoose.models.Transaction as mongoose.Model<TransactionDoc>) || mongoose.model<TransactionDoc>("Transaction", schema);
