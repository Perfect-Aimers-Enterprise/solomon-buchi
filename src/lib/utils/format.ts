import { siteConfig } from "@/config/site.config";

export function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat(siteConfig.site.locale, { style: "currency", currency }).format(amountMinor / 100);
}

export function formatMajor(amount: number, currency: string): string {
  return formatMoney(Math.round(amount * 100), currency);
}

export function formatDate(iso: string | Date, withTime = false): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(siteConfig.site.locale, {
    dateStyle: "full",
    ...(withTime ? { timeStyle: "short" } : {}),
    timeZone: siteConfig.site.timezone,
  }).format(d);
}
