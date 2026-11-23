import nodemailer from "nodemailer";
import { isSmtpConfigured } from "@/lib/utils/features";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!isSmtpConfigured()) throw new Error("SMTP is not configured");
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  return transporter;
}

export async function sendEmail(opts: { to: string; subject: string; text: string; html: string; replyTo?: string }) {
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo,
  });
}
