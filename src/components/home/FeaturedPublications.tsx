import { siteConfig } from "@/config/site.config";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PublicationCard } from "@/components/publications/PublicationCard";

export function FeaturedPublications() {
  if (!siteConfig.services.ebooks || !siteConfig.content.publications.length) return null;
  return (
    <section className="section bg-ivory">
      <div className="container-page">
        <Reveal>
          <SectionHeading eyebrow="Publications" title={<>Words to <em className="text-brown">return to.</em></>} />
        </Reveal>
        <div className="mt-16 grid gap-16 lg:grid-cols-2">
          {siteConfig.content.publications.slice(0, 2).map((p) => (
            <Reveal key={p.slug}>
              <PublicationCard p={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
