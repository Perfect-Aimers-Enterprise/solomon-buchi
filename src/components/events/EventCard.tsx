import Image from "next/image";
import type { EventDef } from "@/types/site";
import { siteConfig } from "@/config/site.config";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { formatDate, formatMajor } from "@/lib/utils/format";
import { getCatalogItem } from "@/lib/purchases/catalog";
import { paymentsActive } from "@/lib/utils/features";

export function EventCard({ e }: { e: EventDef }) {
  const payOn = paymentsActive();
  return (
    <article className="grid gap-10 border-t border-milk/70 py-14 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <p className="label mb-3">{formatDate(e.date)}</p>
        <p className="text-stone">
          {e.venue}
          <br />
          {[e.city, e.country].filter(Boolean).join(", ")}
        </p>
        {e.image && (
          <div className="relative mt-8 aspect-[4/3] overflow-hidden">
            <Image src={e.image} alt={e.name} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" />
          </div>
        )}
      </div>
      <div className="lg:col-span-8">
        <h3 className="text-4xl md:text-5xl">{e.name}</h3>
        <p className="mt-5 max-w-2xl text-stone">{e.description}</p>

        <ul className="mt-10 divide-y divide-milk/60 border-y border-milk/60">
          {e.tiers.map((t) => {
            const buyable = payOn && t.price && t.price > 0 && getCatalogItem(`event:${e.slug}:${t.id}`);
            return (
              <li key={t.id} className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
                <div>
                  <p className="font-display text-2xl">{t.name}</p>
                  {t.description && <p className="text-sm text-stone">{t.description}</p>}
                </div>
                <div className="flex items-center gap-6">
                  {t.price ? <span className="font-display text-xl">{formatMajor(t.price, t.currency || siteConfig.payments.currency)}</span> : null}
                  {buyable ? (
                    <ButtonLink href={`/purchase?item=${encodeURIComponent(`event:${e.slug}:${t.id}`)}`}>Purchase</ButtonLink>
                  ) : (
                    <ButtonLink href={`/contact?category=event-ticket&event=${e.slug}&tier=${t.id}`} variant="outline">
                      Request Ticket
                    </ButtonLink>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
