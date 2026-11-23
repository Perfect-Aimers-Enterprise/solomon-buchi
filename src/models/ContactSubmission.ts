import mongoose, { Schema, type InferSchemaType } from "mongoose";

const schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, index: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    additionalInfo: { type: String, default: "" },
    fingerprint: { type: String, index: true },
    ipHash: { type: String, default: "" },
    notification: {
      channel: { type: String, default: "none" },
      delivered: { type: Boolean, default: false },
      error: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export type ContactSubmissionDoc = InferSchemaType<typeof schema>;
export const ContactSubmission = (mongoose.models.ContactSubmission as mongoose.Model<ContactSubmissionDoc>) || mongoose.model<ContactSubmissionDoc>("ContactSubmission", schema);
