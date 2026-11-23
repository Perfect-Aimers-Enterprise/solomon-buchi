import mongoose, { Schema, type InferSchemaType } from "mongoose";

const schema = new Schema(
  {
    ticketCode: { type: String, required: true, unique: true },
    purchaseCode: { type: String, required: true, index: true },
    holderName: { type: String, required: true },
    holderEmail: { type: String, required: true, lowercase: true, index: true },
    eventSlug: { type: String, required: true },
    eventName: { type: String, required: true },
    tierName: { type: String, default: "" },
    redeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date },
  },
  { timestamps: true },
);

export type TicketDoc = InferSchemaType<typeof schema>;
export const Ticket = (mongoose.models.Ticket as mongoose.Model<TicketDoc>) || mongoose.model<TicketDoc>("Ticket", schema);
