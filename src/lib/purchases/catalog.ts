import { siteConfig } from "@/config/site.config";
import { upcomingEvents } from "@/lib/utils/site-helpers";

/**
 * Server-side catalogue of purchasable items. Prices ALWAYS come from site.config.ts —
 * the client only ever sends an item id and a quantity, never an amount.
 */
export interface CatalogItem {
  id: string;
  type: "event" | "publication";
  name: string;
  unitAmountMinor: number;
  currency: string;
  eventSlug?: string;
  eventName?: string;
  tierId?: string;
  tierName?: string;
}

const toMinor = (major: number) => Math.round(major * 100);

export function buildCatalog(): CatalogItem[] {
  const items: CatalogItem[] = [];
  const defaultCurrency = siteConfig.payments.currency;

  if (siteConfig.services.events) {
    for (const e of upcomingEvents()) {
      for (const t of e.tiers) {
        if (!t.price || t.price <= 0) continue;
        items.push({
          id: `event:${e.slug}:${t.id}`,
          type: "event",
          name: `${e.name} — ${t.name}`,
          unitAmountMinor: toMinor(t.price),
          currency: (t.currency || defaultCurrency).toUpperCase(),
          eventSlug: e.slug,
          eventName: e.name,
          tierId: t.id,
          tierName: t.name,
        });
      }
    }
  }

  if (siteConfig.services.ebooks) {
    for (const p of siteConfig.content.publications) {
      if (p.purchase !== "internal" || !p.price || p.price <= 0) continue;
      items.push({
        id: `publication:${p.slug}`,
        type: "publication",
        name: p.title,
        unitAmountMinor: toMinor(p.price),
        currency: (p.currency || defaultCurrency).toUpperCase(),
      });
    }
  }
  return items;
}

export function getCatalogItem(id: string): CatalogItem | undefined {
  return buildCatalog().find((i) => i.id === id);
}
