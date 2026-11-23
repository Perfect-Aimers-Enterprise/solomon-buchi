import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Portrait } from "@/components/ui/Portrait";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { ContactInvite } from "@/components/home/ContactInvite";
import { biographyParagraphs, enabledServices, facebookUrl, personTitle, philosophyParagraphs, shortIntro } from "@/lib/utils/site-helpers";

const { person } = siteConfig;

export const metadata: Metadata = {
  title: `About ${person.fullName}`,
  description: shortIntro(),
  openGraph: { title: `About ${person.fullName}`, description: shortIntro() },
};

export default function AboutPage() {
  const bio = biographyParagraphs();
  const philosophy = philosophyParagraphs();
  const fb = facebookUrl();
  const areas = enabledServices();

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-20 md:pb-28">
        <div className="container-page grid items-end gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="label mb-8">About</p>
            <h1 className="text-6xl font-light leading-[0.95] md:text-8xl lg:text-[9rem]">
              {person.firstName} <em className="text-brown">{person.lastName}</em>
            </h1>
            <p className="label mt-8">{personTitle()}</p>
            <p className="mt-10 max-w-xl font-display text-2xl font-light leading-snug md:text-3xl">{shortIntro()}</p>
            <div className="mt-12">
              <ButtonLink href="/services">Explore Services</ButtonLink>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            <div className="absolute -bottom-5 -left-5 h-full w-full border border-milk" aria-hidden />
            <Portrait priority className="relative" />
          </div>
        </div>
      </section>

      {/* Biography */}
      <section className="section bg-ivory">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="label mb-6">Biography</p>
            <h2 className="text-4xl md:text-5xl">The story so far.</h2>
          </Reveal>
          <Reveal className="space-y-6 text-base leading-[1.9] text-charcoal/90 md:text-lg lg:col-span-7 lg:col-start-6" delay={100}>
            {bio.map((p, i) => (
              <p key={i} className={i === 0 ? "font-display text-2xl leading-snug md:text-3xl" : ""}>
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Achievements & milestones — rendered only when verified content is supplied */}
      {(person.achievements.length > 0 || person.milestones.length > 0) && (
        <section className="section">
          <div className="container-page grid gap-16 lg:grid-cols-2">
            {person.achievements.length > 0 && (
              <Reveal>
                <p className="label mb-6">Experience &amp; achievements</p>
                <ul className="divide-y divide-milk/60 border-y border-milk/60">
                  {person.achievements.map((a, i) => (
                    <li key={i} className="py-5 font-display text-2xl">{a}</li>
                  ))}
                </ul>
              </Reveal>
            )}
            {person.milestones.length > 0 && (
              <Reveal delay={100}>
                <p className="label mb-6">Milestones</p>
                <ul className="divide-y divide-milk/60 border-y border-milk/60">
                  {person.milestones.map((m, i) => (
                    <li key={i} className="grid grid-cols-[6rem_1fr] gap-4 py-5">
                      <span className="label pt-1">{m.year}</span>
                      <span>{m.text}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* Influence & community */}
      <section className="section border-y border-milk/70">
        <Reveal className="container-page text-center">
          <p className="label mb-8">Influence &amp; Community</p>
          {person.socialProof.facebookFollowers && (
            <p className="font-display text-[6rem] font-light leading-none md:text-[11rem]">{person.socialProof.facebookFollowers}</p>
          )}
          <p className="label mt-4">Followers on Facebook</p>
          <p className="mx-auto mt-10 max-w-xl text-stone md:text-lg">
            A growing community that follows {person.firstName}&apos;s voice on personal growth, influence and purposeful living.
          </p>
          {fb && (
            <div className="mt-10">
              <ButtonLink href={fb} external variant="outline">
                Follow on Facebook
              </ButtonLink>
            </div>
          )}
        </Reveal>
      </section>

      {/* Philosophy & values */}
      <section className="section bg-milk-soft/50">
        <div className="container-page">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="label mb-8">Philosophy &amp; Values</p>
            <p className="font-accent text-3xl italic leading-snug md:text-5xl">{philosophy[0] ?? person.positioning}</p>
            {philosophy.length > 1 && (
              <div className="mx-auto mt-10 max-w-2xl space-y-5 text-stone md:text-lg">
                {philosophy.slice(1).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
          </Reveal>
          {person.values.length > 0 && (
            <div className="mt-20 grid gap-12 md:grid-cols-3">
              {person.values.map((v, i) => (
                <Reveal key={v.title} delay={i * 80}>
                  <p className="label mb-3">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="text-3xl">{v.title}</h3>
                  <p className="mt-3 text-stone">{v.text}</p>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Areas of work */}
      <section className="section">
        <div className="container-page">
          <Reveal>
            <p className="label mb-6">Areas of work</p>
            <h2 className="max-w-3xl text-4xl md:text-6xl">Where {person.firstName} <em className="text-brown">serves.</em></h2>
          </Reveal>
          <ul className="mt-16 grid gap-x-16 border-t border-milk/70 md:grid-cols-2">
            {areas.map((s) => (
              <li key={s.id} className="border-b border-milk/70 py-6">
                <p className="font-display text-3xl">{s.name}</p>
                <p className="mt-2 text-stone">{s.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactInvite
        heading={`Work with ${person.fullName}.`}
        copy="Explore the services on offer, or send an enquiry and the team will be in touch."
      />
    </>
  );
}
