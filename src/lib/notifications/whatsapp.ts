import { siteConfig } from "@/config/site.config";

/**
 * Official WhatsApp Business Cloud API (Meta Graph API).
 * A message is only reported as delivered when the API accepts it (HTTP 2xx with a message id).
 *
 * Meta rule: free-form text can only be sent inside the 24-hour customer-service window.
 * For business-initiated alerts, create an approved template with ONE body variable and set
 * WHATSAPP_TEMPLATE_NAME. We then send the template with the alert text as that variable.
 */
export async function sendWhatsApp(text: string): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = siteConfig.notifications.whatsapp.number.replace(/\D/g, "");
  if (!token || !phoneId || !to) throw new Error("WhatsApp is not configured");

  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const body = template
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
          // Template variables cannot contain newlines/tabs.
          components: [{ type: "body", parameters: [{ type: "text", text: text.replace(/\s*\n+\s*/g, " | ").slice(0, 1000) }] }],
        },
      }
    : { messaging_product: "whatsapp", to, type: "text", text: { body: text.slice(0, 4000), preview_url: false } };

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { messages?: { id: string }[]; error?: { message?: string } };
  if (!res.ok || !json.messages?.[0]?.id) {
    throw new Error(`WhatsApp API error: ${json.error?.message ?? res.status}`);
  }
}
