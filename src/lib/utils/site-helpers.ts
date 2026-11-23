import { siteConfig } from "@/config/site.config";
import type { ServiceDef } from "@/types/site";

const { person, brand } = siteConfig;

export function enabledServices(): ServiceDef[] {
  return siteConfig.content.services.filter((s) => siteConfig.services[s.toggle]);
}

/** Where a service CTA should go: configured external URL, or the on-site enquiry form. */
export function serviceHref(s: ServiceDef): { href: string; external: boolean } {
  const ext = s.linkKey ? siteConfig.externalLinks[s.linkKey] : "";
  if (ext) return { href: ext, external: true };
  if (s.toggle === "ebooks") return { href: "/publications", external: false };
  if (s.toggle === "events") return { href: "/events", external: false };
  return { href: `/contact?category=${s.category}`, external: false };
}

export function facebookUrl(): string {
  return person.socialProof.facebookProfile || brand.socialLinks.facebook || "";
}

export function personTitle(): string {
  return person.title || "Personal Development · Coaching · Mentorship";
}

function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

/** Biography paragraphs from config; a neutral, factual fallback (built only from supplied facts) when empty. */
export function biographyParagraphs(): string[] {
  const full = paragraphs(person.fullBiography);
  if (full.length) return full;
  const short = paragraphs(person.shortBio);
  if (short.length) return short;
  return [
    `${person.fullName} is a public-facing personal development voice, supporting people through coaching, mentorship, speaking, training and publications, with a Facebook community of over one million followers.`,
  ];
}

export function shortIntro(): string {
  return person.shortBio || biographyParagraphs()[0];
}

export function philosophyParagraphs(): string[] {
  return paragraphs(person.philosophy);
}

export function socialLinks(): { label: string; href: string }[] {
  const s = brand.socialLinks;
  const fb = facebookUrl();
  return [
    { label: "Facebook", href: fb },
    { label: "Instagram", href: s.instagram },
    { label: "LinkedIn", href: s.linkedin },
    { label: "YouTube", href: s.youtube },
    { label: "X", href: s.x },
  ].filter((l) => l.href);
}

export function upcomingEvents() {
  const now = Date.now();
  return siteConfig.content.events
    .filter((e) => new Date(e.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
