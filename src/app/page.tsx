import { Hero } from "@/components/home/Hero";
import { AboutSolomon } from "@/components/home/AboutSolomon";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { PhilosophyBand } from "@/components/home/PhilosophyBand";
import { FeaturedPublications } from "@/components/home/FeaturedPublications";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { Testimonials } from "@/components/home/Testimonials";
import { ContactInvite } from "@/components/home/ContactInvite";
import { siteConfig } from "@/config/site.config";

export default function HomePage() {
  const { person } = siteConfig;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.fullName,
    description: siteConfig.brand.description,
    ...(person.socialProof.facebookProfile ? { sameAs: [person.socialProof.facebookProfile] } : {}),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <AboutSolomon />
      <ServicesOverview />
      <PhilosophyBand />
      <FeaturedPublications />
      <UpcomingEvents />
      <Testimonials />
      <ContactInvite />
    </>
  );
}
