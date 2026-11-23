import mongoose, { Schema, type InferSchemaType } from "mongoose";

const notificationSub = new Schema(
  {
    channel: { type: String, enum: ["whatsapp", "email", "none"], default: "none" },
    delivered: { type: Boolean, default: false },
    error: { type: String, default: "" },
  },
  { _id: false },
);

const schema = new Schema(
  {
    category: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, index: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    additionalInfo: { type: String, default: "" },
    eventSlug: { type: String, default: "" },
    eventName: { type: String, default: "" },
    ticketTier: { type: String, default: "" },
    tickets: { type: Number, default: 0 },
    paymentMethod: { type: String, default: "" },
    status: { type: String, enum: ["new", "reviewed", "approved", "declined"], default: "new" },
    fingerprint: { type: String, index: true },
    ipHash: { type: String, default: "" },
    notification: { type: notificationSub, default: () => ({}) },
  },
  { timestamps: true },
);

export type ServiceRequestDoc = InferSchemaType<typeof schema>;
export const ServiceRequest = (mongoose.models.ServiceRequest as mongoose.Model<ServiceRequestDoc>) || mongoose.model<ServiceRequestDoc>("ServiceRequest", schema);
