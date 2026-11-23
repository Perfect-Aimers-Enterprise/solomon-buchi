import Image from "next/image";
import { siteConfig } from "@/config/site.config";
import type { PublicationDef } from "@/types/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { formatMajor } from "@/lib/utils/format";
import { getCatalogItem } from "@/lib/purchases/catalog";
import { paymentsActive } from "@/lib/utils/features";

export function PublicationCard({ p }: { p: PublicationDef }) {
  const ext = siteConfig.externalLinks.ebooks || siteConfig.externalLinks.becomeArticulate;
  const internal = p.purchase === "internal" && paymentsActive() && getCatalogItem(`publication:${p.slug}`);
  const cta = internal
    ? { href: `/purchase?item=${encodeURIComponent(`publication:${p.slug}`)}`, external: false }
    : p.purchase === "external" && ext
      ? { href: ext, external: true }
      : { href: "/contact?category=general", external: false };

  return (
    <article className="group grid gap-8 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center">
      <div className="relative aspect-[3/4] w-full overflow-hidden border border-milk bg-ivory">
        {p.cover ? (
          <Image src={p.cover} alt={`Cover of ${p.title}`} fill sizes="220px" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <span className="font-display text-3xl leading-tight">{p.title}</span>
            <span className="label mt-4">{p.author}</span>
          </div>
        )}
      </div>
      <div>
        <p className="label mb-3">{p.author}</p>
        <h3 className="text-3xl md:text-4xl">{p.title}</h3>
        <p className="mt-4 text-stone">{p.description}</p>
        {p.price ? <p className="mt-4 font-display text-2xl">{formatMajor(p.price, p.currency || siteConfig.payments.currency)}</p> : null}
        <div className="mt-8">
          <ButtonLink href={cta.href} external={cta.external}>{p.ctaLabel}</ButtonLink>
        </div>
      </div>
    </article>
  );
}
