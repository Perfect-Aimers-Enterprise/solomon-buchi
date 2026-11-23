import { siteConfig } from "@/config/site.config";
import { Reveal } from "@/components/ui/Reveal";
import { philosophyParagraphs } from "@/lib/utils/site-helpers";

export function PhilosophyBand() {
  const { person } = siteConfig;
  const paras = philosophyParagraphs();
  return (
    <section className="section bg-milk-soft/50">
      <div className="container-page">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="label mb-8">Philosophy &amp; Approach</p>
          {/* Positioning statement — placeholder copy, deliberately not set as a quotation. */}
          <p className="font-accent text-3xl italic leading-snug md:text-5xl">{paras[0] ?? person.positioning}</p>
          {paras.length > 1 && <p className="mx-auto mt-10 max-w-2xl text-stone md:text-lg">{paras.slice(1).join(" ")}</p>}
        </Reveal>
      </div>
    </section>
  );
}
