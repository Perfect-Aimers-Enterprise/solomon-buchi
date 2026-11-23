import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { upcomingEvents } from "@/lib/utils/site-helpers";
import { formatDate } from "@/lib/utils/format";

export function UpcomingEvents() {
  if (!siteConfig.services.events) return null;
  const events = upcomingEvents().slice(0, 3);
  return (
    <section className="section">
      <div className="container-page">
        <Reveal>
          <SectionHeading eyebrow="Events" title={<>Gather <em className="text-brown">in person.</em></>} />
        </Reveal>
        {events.length ? (
          <ul className="mt-16 border-t border-milk/70">
            {events.map((e) => (
              <li key={e.slug} className="border-b border-milk/70">
                <Link href="/events" className="group grid gap-3 py-8 md:grid-cols-12 md:items-baseline">
                  <span className="label md:col-span-3">{formatDate(e.date)}</span>
                  <span className="font-display text-3xl transition-transform duration-500 group-hover:translate-x-2 md:col-span-6 md:text-4xl">{e.name}</span>
                  <span className="text-stone md:col-span-3 md:text-right">{[e.city, e.country].filter(Boolean).join(", ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-12 max-w-xl text-stone">New events will be announced here. Get in touch to be informed first.</p>
        )}
        <div className="mt-12 flex gap-4">
          <ButtonLink href="/events" variant="outline">All Events</ButtonLink>
        </div>
      </div>
    </section>
  );
}
