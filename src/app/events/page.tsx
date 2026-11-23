import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import { EventCard } from "@/components/events/EventCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ContactInvite } from "@/components/home/ContactInvite";
import { upcomingEvents } from "@/lib/utils/site-helpers";

export const metadata: Metadata = { title: "Events", description: `Upcoming events with ${siteConfig.person.fullName}.` };
// Events hide themselves once their date passes, so render on request.
export const dynamic = "force-dynamic";

export default function EventsPage() {
  if (!siteConfig.services.events) notFound();
  const events = upcomingEvents();
  return (
    <>
      <section className="pt-40 pb-16 md:pb-24">
        <div className="container-page">
          <p className="label mb-8">Events</p>
          <h1 className="max-w-5xl text-6xl font-light leading-[0.98] md:text-8xl">
            Be in <em className="text-brown">the room.</em>
          </h1>
        </div>
      </section>
      <section className="container-page pb-24">
        {events.length ? (
          events.map((e) => <EventCard key={e.slug} e={e} />)
        ) : (
          <div className="border-t border-milk/70 pt-16">
            <p className="max-w-xl text-lg text-stone">There are no upcoming events at the moment. Send an enquiry and we will let you know when the next one is announced.</p>
            <div className="mt-8">
              <ButtonLink href="/contact?category=general" variant="outline">Get In Touch</ButtonLink>
            </div>
          </div>
        )}
      </section>
      <ContactInvite />
    </>
  );
}
