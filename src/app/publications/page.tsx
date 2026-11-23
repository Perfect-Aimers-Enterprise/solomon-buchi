import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { Reveal } from "@/components/ui/Reveal";
import { ContactInvite } from "@/components/home/ContactInvite";

export const metadata: Metadata = { title: "Publications & Resources", description: `Ebooks and publications by ${siteConfig.person.fullName}.` };

export default function PublicationsPage() {
  if (!siteConfig.services.ebooks) notFound();
  const pubs = siteConfig.content.publications;
  return (
    <>
      <section className="pt-40 pb-16 md:pb-24">
        <div className="container-page">
          <p className="label mb-8">Publications &amp; Resources</p>
          <h1 className="max-w-5xl text-6xl font-light leading-[0.98] md:text-8xl">
            Ideas <em className="text-brown">to keep.</em>
          </h1>
        </div>
      </section>
      <section className="container-page pb-24">
        {pubs.length ? (
          <div className="grid gap-20 border-t border-milk/70 pt-20 lg:grid-cols-2">
            {pubs.map((p) => (
              <Reveal key={p.slug}>
                <PublicationCard p={p} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="border-t border-milk/70 pt-16 text-stone">New publications will be listed here soon.</p>
        )}
      </section>
      <ContactInvite />
    </>
  );
}
