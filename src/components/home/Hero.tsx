import { siteConfig } from "@/config/site.config";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Portrait } from "@/components/ui/Portrait";
import { personTitle } from "@/lib/utils/site-helpers";

export function Hero() {
  const { person } = siteConfig;
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16">
      <div className="container-page grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label mb-8">{personTitle()}</p>
          <h1 className="text-[3.4rem] font-light leading-[0.95] sm:text-7xl lg:text-[8.5rem]">
            {person.firstName}
            <span className="block italic text-brown">{person.lastName}</span>
          </h1>
          <div className="mt-10 h-px w-24 bg-milk" />
          <p className="mt-10 max-w-xl font-display text-2xl font-light leading-snug text-charcoal md:text-3xl">{person.positioning}</p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/services">Explore My Services</ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Get In Touch
            </ButtonLink>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <div className="absolute -bottom-5 -right-5 h-full w-full border border-milk" aria-hidden />
          <Portrait priority className="relative" />
          {person.socialProof.facebookFollowers && (
            <div className="absolute -left-4 bottom-10 hidden bg-white px-6 py-5 shadow-[0_0_0_1px_#D8C3A5] md:block">
              <p className="font-display text-4xl leading-none">{person.socialProof.facebookFollowers}</p>
              <p className="label mt-2">on Facebook</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
