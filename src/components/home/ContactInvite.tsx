import { siteConfig } from "@/config/site.config";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";

export function ContactInvite({ heading, copy }: { heading?: string; copy?: string }) {
  const { person } = siteConfig;
  return (
    <section className="section border-t border-milk/70">
      <Reveal className="container-page text-center">
        <p className="label mb-8">Work with {person.fullName}</p>
        <h2 className="mx-auto max-w-4xl text-5xl leading-[1.04] md:text-7xl">
          {heading ?? (<>Begin a <em className="text-brown">meaningful</em> conversation.</>)}
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-stone md:text-lg">
          {copy ?? "Whether you are seeking coaching, mentorship, a speaker or a publication, you are welcome to reach out."}
        </p>
        <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
          <ButtonLink href="/contact">Make an Enquiry</ButtonLink>
          <ButtonLink href="/services" variant="outline">Explore Services</ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
