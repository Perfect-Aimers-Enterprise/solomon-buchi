import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig } from "@/config/site.config";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { ContactInvite } from "@/components/home/ContactInvite";
import { enabledServices, serviceHref } from "@/lib/utils/site-helpers";

export const metadata: Metadata = {
  title: "Services",
  description: `Coaching, mentorship, consulting, speaking, training, publications and events with ${siteConfig.person.fullName}.`,
};

export default function ServicesPage() {
  const services = enabledServices();
  return (
    <>
      <section className="pt-40 pb-16 md:pb-24">
        <div className="container-page">
          <p className="label mb-8">Services</p>
          <h1 className="max-w-5xl text-6xl font-light leading-[0.98] md:text-8xl">
            Guidance, <em className="text-brown">crafted</em> around you.
          </h1>
        </div>
      </section>

      <div className="container-page">
        {services.map((s, i) => {
          const link = serviceHref(s);
          const flip = i % 2 === 1;
          return (
            <Reveal key={s.id}>
              <article className="grid items-center gap-10 border-t border-milk/70 py-16 md:py-24 lg:grid-cols-12 lg:gap-20">
                <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                    {s.image ? (
                      <Image src={s.image} alt={s.name} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ivory to-milk-soft/70">
                        <span className="font-display text-[10rem] font-light leading-none text-brown/60 md:text-[14rem]">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
                  <p className="label mb-5">{String(i + 1).padStart(2, "0")}</p>
                  <h2 className="text-4xl md:text-6xl">{s.name}</h2>
                  <p className="mt-6 max-w-xl text-lg text-stone">{s.summary}</p>
                  <ul className="mt-10 max-w-xl divide-y divide-milk/60 border-y border-milk/60">
                    {s.benefits.map((b) => (
                      <li key={b} className="flex gap-4 py-4">
                        <span className="mt-[0.7em] h-px w-5 shrink-0 bg-brown" aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                    <ButtonLink href={link.href} external={link.external}>{s.ctaLabel}</ButtonLink>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
      <ContactInvite />
    </>
  );
}
