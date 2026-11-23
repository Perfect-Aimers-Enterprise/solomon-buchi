import { siteConfig } from "@/config/site.config";
import { adminRecipient, emailActive, isSmtpConfigured, whatsappActive } from "@/lib/utils/features";
import { escapeHtml } from "@/lib/utils/sanitize";
import { sendEmail } from "./email";
import { sendWhatsApp } from "./whatsapp";

/**
 * CENTRALISED NOTIFICATION SERVICE — the only place channel rules live.
 *
 *  • WhatsApp active (alone or with email) -> WhatsApp is the channel (priority).
 *    If WhatsApp delivery fails and email is active, email is used as a fallback.
 *  • Only email active                     -> Nodemailer.
 *  • Neither active                        -> nothing is sent; callers store the submission in the DB.
 *
 * Purchases are different: the administrator ALWAYS gets the detailed email when SMTP is configured
 * (payment verification needs a written record), plus WhatsApp when it is active.
 */

export type Channel = "whatsapp" | "email" | "none";

export interface NotificationMessage {
  subject: string;
  /** Ordered label/value rows rendered in both plain text and HTML. */
  rows: [string, string][];
  replyTo?: string;
}

export interface NotifyResult {
  channel: Channel;
  delivered: boolean;
  error: string;
}

export function resolveChannel(): Channel {
  const pref = siteConfig.notifications.defaultChannel;
  if (pref === "email" && emailActive()) return "email";
  if (pref === "whatsapp" && whatsappActive()) return "whatsapp";
  if (whatsappActive()) return "whatsapp";
  if (emailActive()) return "email";
  return "none";
}

function toText(m: NotificationMessage): string {
  return `${m.subject}\n\n${m.rows.map(([k, v]) => `${k}: ${v}`).join("\n")}`;
}

function toHtml(m: NotificationMessage): string {
  const rows = m.rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 16px 10px 0;color:#9B8065;font-size:12px;letter-spacing:.12em;text-transform:uppercase;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:10px 0;color:#222;font-size:15px;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;padding:32px;border:1px solid #D8C3A5;background:#fff"><h2 style="font-weight:500;color:#222;margin:0 0 4px">${escapeHtml(m.subject)}</h2><div style="height:1px;background:#D8C3A5;margin:16px 0"></div><table style="border-collapse:collapse;width:100%">${rows}</table></div>`;
}

export async function notifyAdmin(m: NotificationMessage): Promise<NotifyResult> {
  const channel = resolveChannel();
  if (channel === "none") return { channel, delivered: false, error: "" };

  if (channel === "whatsapp") {
    try {
      await sendWhatsApp(toText(m));
      return { channel, delivered: true, error: "" };
    } catch (e) {
      const err = e instanceof Error ? e.message : "WhatsApp failed";
      if (emailActive()) return viaEmail(m, `WhatsApp failed (${err}); used email fallback`);
      return { channel, delivered: false, error: err };
    }
  }
  return viaEmail(m);
}

async function viaEmail(m: NotificationMessage, note = ""): Promise<NotifyResult> {
  try {
    await sendEmail({ to: adminRecipient(), subject: m.subject, text: toText(m), html: toHtml(m), replyTo: m.replyTo });
    return { channel: "email", delivered: true, error: note };
  } catch (e) {
    return { channel: "email", delivered: false, error: e instanceof Error ? e.message : "Email failed" };
  }
}

/** Purchase alerts: detailed email to the administrator whenever SMTP exists, plus WhatsApp if active. */
export async function notifyAdminOfPurchase(m: NotificationMessage): Promise<NotifyResult> {
  const results: NotifyResult[] = [];
  if (isSmtpConfigured() && adminRecipient()) results.push(await viaEmail(m));
  if (whatsappActive()) {
    try {
      await sendWhatsApp(toText(m));
      results.push({ channel: "whatsapp", delivered: true, error: "" });
    } catch (e) {
      results.push({ channel: "whatsapp", delivered: false, error: e instanceof Error ? e.message : "WhatsApp failed" });
    }
  }
  if (!results.length) return { channel: "none", delivered: false, error: "" };
  return results.find((r) => r.delivered) ?? results[0];
}

/** Customer confirmation — only where outbound email is configured. */
export async function notifyCustomer(to: string, m: NotificationMessage): Promise<NotifyResult> {
  if (!isSmtpConfigured()) return { channel: "none", delivered: false, error: "" };
  try {
    await sendEmail({ to, subject: m.subject, text: toText(m), html: toHtml(m) });
    return { channel: "email", delivered: true, error: "" };
  } catch (e) {
    return { channel: "email", delivered: false, error: e instanceof Error ? e.message : "Email failed" };
  }
}
