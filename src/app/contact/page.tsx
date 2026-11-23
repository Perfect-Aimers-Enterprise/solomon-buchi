import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { REQUEST_CATEGORIES } from "@/config/request-categories";
import { RequestForm } from "@/components/forms/RequestForm";
import { COUNTRIES } from "@/lib/utils/countries";
import { socialLinks, upcomingEvents } from "@/lib/utils/site-helpers";
import { paymentsActive } from "@/lib/utils/features";

export const metadata: Metadata = { title: "Contact", description: `Contact ${siteConfig.person.fullName} for coaching, mentorship, speaking, consulting, training and events.` };
export const dynamic = "force-dynamic";

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ category?: string; event?: string; tier?: string }> }) {
  const sp = await searchParams;
  const { brand, locations } = siteConfig;
  const categories = REQUEST_CATEGORIES.filter((c) => !c.toggle || siteConfig.services[c.toggle]);
  const events = upcomingEvents().map((e) => ({ slug: e.slug, name: e.name, tiers: e.tiers.map((t) => ({ id: t.id, name: t.name })) }));
  const availableCategories = categories.filter((c) => c.id !== "event-ticket" || events.length > 0);
  const socials = socialLinks();

  return (
    <>
      <section className="pt-40 pb-16 md:pb-20">
        <div className="container-page">
          <p className="label mb-8">Contact</p>
          <h1 className="max-w-5xl text-6xl font-light leading-[0.98] md:text-8xl">
            Let&apos;s <em className="text-brown">begin.</em>
          </h1>
        </div>
      </section>

      <section className="container-page grid gap-20 pb-28 lg:grid-cols-12">
        <aside className="space-y-12 lg:col-span-4">
          {locations.map((l) => (
            <div key={l.countryCode} className="border-t border-milk/70 pt-6">
              <p className="font-display text-3xl">
                <span className="mr-3" aria-hidden>{l.flag}</span>
                {l.country}
              </p>
              <div className="mt-3 space-y-1 text-stone">
                {l.city && <p>{l.city}</p>}
                {l.address && <p>{l.address}</p>}
                {l.phone && <p><a className="underline-link" href={`tel:${l.phone}`}>{l.phone}</a></p>}
                {l.isPrimary && <p className="label mt-3">Primary office</p>}
              </div>
            </div>
          ))}
          {(brand.email || brand.phone) && (
            <div className="border-t border-milk/70 pt-6">
              <p className="label mb-3">Direct</p>
              {brand.email && <p><a className="underline-link" href={`mailto:${brand.email}`}>{brand.email}</a></p>}
              {brand.phone && <p><a className="underline-link" href={`tel:${brand.phone}`}>{brand.phone}</a></p>}
            </div>
          )}
          {socials.length > 0 && (
            <div className="border-t border-milk/70 pt-6">
              <p className="label mb-4">Follow</p>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {socials.map((s) => (
                  <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="underline-link">{s.label}</a></li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="lg:col-span-8">
          <RequestForm
            categories={availableCategories}
            events={events}
            countries={COUNTRIES}
            paymentMethods={paymentsActive() ? siteConfig.payments.methods : []}
            initial={sp}
          />
        </div>
      </section>
    </>
  );
}
