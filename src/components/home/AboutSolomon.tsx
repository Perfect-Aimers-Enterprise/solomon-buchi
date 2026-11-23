import { siteConfig } from "@/config/site.config";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Portrait } from "@/components/ui/Portrait";
import { Reveal } from "@/components/ui/Reveal";
import { shortIntro } from "@/lib/utils/site-helpers";

export function AboutSolomon() {
  const { person } = siteConfig;
  return (
    <section className="section bg-ivory">
      <div className="container-page grid items-center gap-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <Portrait />
        </Reveal>
        <Reveal className="lg:col-span-7 lg:pl-10" delay={120}>
          <p className="label mb-6">About {person.fullName}</p>
          <h2 className="text-4xl leading-[1.08] md:text-6xl">
            The person behind <em className="text-brown">the work.</em>
          </h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-stone md:text-lg">{shortIntro()}</p>
          {person.socialProof.facebookFollowers && (
            <div className="mt-10 flex items-baseline gap-4 border-t border-milk pt-8">
              <span className="font-display text-5xl">{person.socialProof.facebookFollowers}</span>
              <span className="label">Followers on Facebook</span>
            </div>
          )}
          <div className="mt-10">
            <ButtonLink href="/about" variant="outline">
              About {person.fullName}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
