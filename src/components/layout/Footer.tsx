import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { facebookUrl, socialLinks } from "@/lib/utils/site-helpers";
import type { NavItem } from "@/components/navigation/Header";

export function Footer({ items }: { items: NavItem[] }) {
  const { brand, person, locations } = siteConfig;
  const socials = socialLinks();
  return (
    <footer className="border-t border-milk/70 bg-ivory">
      <div className="container-page grid gap-16 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-3xl uppercase tracking-wordmark">{brand.name}</p>
          <p className="mt-6 max-w-sm text-stone">{brand.tagline}</p>
          {facebookUrl() && person.socialProof.facebookFollowers && (
            <p className="label mt-8">
              {person.socialProof.facebookFollowers} followers on Facebook
            </p>
          )}
        </div>

        <nav className="md:col-span-3" aria-label="Footer">
          <p className="label mb-6">Explore</p>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="underline-link text-charcoal">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="label mb-6">Offices</p>
          <ul className="space-y-4">
            {locations.map((l) => (
              <li key={l.countryCode} className="text-charcoal">
                <span className="mr-2" aria-hidden>{l.flag}</span>
                {l.country}
                {l.city && <span className="text-stone"> · {l.city}</span>}
                {l.phone && <span className="block pl-7 text-sm text-stone">{l.phone}</span>}
              </li>
            ))}
          </ul>
          {(brand.email || brand.phone) && (
            <p className="mt-6 space-y-1 text-sm text-stone">
              {brand.email && <a className="underline-link block" href={`mailto:${brand.email}`}>{brand.email}</a>}
              {brand.phone && <a className="underline-link block" href={`tel:${brand.phone}`}>{brand.phone}</a>}
            </p>
          )}
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="label underline-link">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-milk/70">
        <div className="container-page flex flex-col justify-between gap-2 py-6 text-xs text-stone md:flex-row">
          <p>© {new Date().getFullYear()} {person.fullName}. All rights reserved.</p>
          <p>Official website of {person.fullName}</p>
        </div>
      </div>
    </footer>
  );
}
