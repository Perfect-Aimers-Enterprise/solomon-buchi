export type ServiceKey =
  | "coaching"
  | "mentorship"
  | "consulting"
  | "speaking"
  | "training"
  | "ebooks"
  | "events";

export type RequestCategory =
  | "coaching"
  | "mentorship"
  | "consulting"
  | "speaking"
  | "training"
  | "event-ticket"
  | "general";

export type ExternalLinkKey = "coaching" | "mentorship" | "consulting" | "ebooks" | "becomeArticulate";

export interface SiteLocation {
  country: string;
  countryCode: string;
  flag: string;
  city: string;
  address: string;
  phone: string;
  isPrimary: boolean;
}

export interface ServiceDef {
  id: string;
  toggle: ServiceKey;
  name: string;
  summary: string;
  benefits: string[];
  /** Optional image under /public. A refined typographic panel is used when empty. */
  image?: string;
  ctaLabel: string;
  category: RequestCategory;
  /** If set and the matching externalLinks entry is non-empty, the CTA goes there. */
  linkKey?: ExternalLinkKey;
}

export interface TicketTier {
  id: string;
  name: string;
  description?: string;
  /** Major units (e.g. 5000 = ₦5,000). 0 or omitted = request only, not purchasable online. */
  price?: number;
  currency?: string;
}

export interface EventDef {
  slug: string;
  name: string;
  description: string;
  /** ISO date-time, e.g. "2027-03-14T10:00:00+01:00" */
  date: string;
  venue: string;
  city: string;
  country: string;
  image?: string;
  tiers: TicketTier[];
}

export interface PublicationDef {
  slug: string;
  title: string;
  description: string;
  author: string;
  cover?: string;
  /** Major units. Omit when sold on an external page. */
  price?: number;
  currency?: string;
  /** "external" -> uses externalLinks.ebooks / becomeArticulate. "internal" -> on-site checkout (needs payments active). */
  purchase: "external" | "internal";
  ctaLabel: string;
}

export interface TestimonialDef {
  quote: string;
  name: string;
  role?: string;
}

export interface SiteConfig {
  site: { locale: string; timezone: string };
  brand: {
    name: string;
    tagline: string;
    description: string;
    logo: string;
    favicon: string;
    email: string;
    phone: string;
    website: string;
    socialLinks: { instagram: string; linkedin: string; facebook: string; youtube: string; x: string };
  };
  person: {
    fullName: string;
    firstName: string;
    lastName: string;
    title: string;
    positioning: string;
    shortBio: string;
    fullBiography: string;
    philosophy: string;
    portrait: string;
    values: { title: string; text: string }[];
    achievements: string[];
    milestones: { year: string; text: string }[];
    socialProof: { facebookFollowers: string; facebookProfile: string };
  };
  locations: SiteLocation[];
  services: Record<ServiceKey, boolean>;
  externalLinks: Record<ExternalLinkKey, string>;
  notifications: {
    email: { enabled: boolean; recipient: string; provider: "nodemailer" };
    whatsapp: { enabled: boolean; number: string; provider: "whatsapp" };
    defaultChannel: "auto" | "whatsapp" | "email";
  };
  payments: {
    enabled: boolean;
    provider: "paystack" | "stripe";
    currency: string;
    paystack: { publicKey: string };
    stripe: { publishableKey: string };
    methods: string[];
  };
  booking: { requireApproval: boolean; generatePurchaseCode: boolean; currency: string; codePrefix: string };
  content: {
    services: ServiceDef[];
    publications: PublicationDef[];
    events: EventDef[];
    testimonials: TestimonialDef[];
  };
}
