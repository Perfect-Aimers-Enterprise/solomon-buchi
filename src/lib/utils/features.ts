import { siteConfig } from "@/config/site.config";

/**
 * A feature is ACTIVE only when it is switched on in site.config.ts AND its
 * required environment variables exist. Nothing half-configured ever runs.
 */

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.brand.website || "http://localhost:3000").replace(/\/$/, "");
}

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export function adminRecipient(): string {
  return siteConfig.notifications.email.recipient || process.env.NOTIFICATION_EMAIL || "";
}

export function emailActive(): boolean {
  return siteConfig.notifications.email.enabled && isSmtpConfigured() && Boolean(adminRecipient());
}

export function whatsappActive(): boolean {
  const n = siteConfig.notifications.whatsapp;
  return n.enabled && Boolean(n.number) && Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export function paymentsActive(): boolean {
  const p = siteConfig.payments;
  if (!p.enabled) return false;
  if (p.provider === "paystack") return Boolean(process.env.PAYSTACK_SECRET_KEY);
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export function databaseConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

/** Human-readable problems with enabled-but-incomplete features (logged at startup of relevant routes). */
export function configWarnings(): string[] {
  const w: string[] = [];
  const n = siteConfig.notifications;
  if (n.email.enabled && !emailActive()) w.push("Email is enabled in site.config.ts but SMTP settings or a recipient are missing — email notifications are OFF.");
  if (n.whatsapp.enabled && !whatsappActive()) w.push("WhatsApp is enabled in site.config.ts but the number or WHATSAPP_* variables are missing — WhatsApp is OFF.");
  if (siteConfig.payments.enabled && !paymentsActive()) w.push(`Payments are enabled (${siteConfig.payments.provider}) but required keys are missing — online payments are OFF.`);
  return w;
}
