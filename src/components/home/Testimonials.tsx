import { siteConfig } from "@/config/site.config";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Renders only real testimonials supplied in site.config.ts. Hidden while the list is empty. */
export function Testimonials() {
  const items = siteConfig.content.testimonials;
  if (!items.length) return null;
  return (
    <section className="section bg-ivory">
      <div className="container-page">
        <Reveal>
          <SectionHeading eyebrow="Testimonials" title={<>In their <em className="text-brown">words.</em></>} />
        </Reveal>
        <div className="mt-16 grid gap-14 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={`${t.name}-${i}`} delay={i * 80}>
              <figure>
                <blockquote className="font-accent text-2xl italic leading-snug">“{t.quote}”</blockquote>
                <figcaption className="mt-6">
                  <span className="label">{t.name}</span>
                  {t.role && <span className="block text-sm text-stone">{t.role}</span>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
