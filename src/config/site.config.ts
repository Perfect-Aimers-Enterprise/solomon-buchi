import type { SiteConfig } from "@/types/site";

/**
 * CENTRAL CONFIGURATION
 * ---------------------------------------------------------------------------
 * Everything about identity, contact details, locations, which services exist,
 * notification channels, payment activation and external redirects lives here.
 *
 * This file holds feature toggles and NON-SECRET settings only. Secrets
 * (SMTP password, Paystack/Stripe secret keys, WhatsApp token) belong in
 * environment variables — see .env.example.
 *
 * Empty strings are intentional: the UI hides anything that is not filled in,
 * and nothing in this file is a claim about Solomon Buchi beyond what he has
 * supplied. Fill in the blank fields as the real content becomes available.
 */
export const siteConfig: SiteConfig = {
  site: { locale: "en-GB", timezone: "Africa/Lagos" },

  brand: {
    name: "Solomon Buchi",
    // Placeholder positioning copy — not a quotation from Solomon Buchi.
    tagline: "An intentional approach to personal growth, meaningful influence, and purposeful living.",
    description:
      "The official home of Solomon Buchi — personal development, coaching, mentorship, speaking and publications.",
    logo: "/images/logo.svg",
    favicon: "/favicon.ico",
    email: "",
    phone: "",
    website: "", // e.g. "https://www.solomonbuchi.com" (falls back to NEXT_PUBLIC_SITE_URL)
    socialLinks: { instagram: "", linkedin: "", facebook: "", youtube: "", x: "" },
  },

  person: {
    fullName: "Solomon Buchi",
    firstName: "Solomon",
    lastName: "Buchi",
    title: "", // e.g. "Coach, Mentor & Speaker" — shown under his name when set
    positioning: "An intentional approach to personal growth, meaningful influence, and purposeful living.",
    shortBio: "",
    // Separate paragraphs with a blank line.
    fullBiography: "",
    philosophy: "",
    portrait: "/images/solomon-buchi.jpg",
    // Optional principles shown on the About page. Leave empty until supplied.
    values: [],
    // Optional. Only add verified achievements — nothing is shown when empty.
    achievements: [],
    milestones: [],
    socialProof: {
      facebookFollowers: "1M+",
      facebookProfile: "", // full Facebook profile URL
    },
  },

  locations: [
    {
      country: "Nigeria",
      countryCode: "NG",
      flag: "🇳🇬",
      city: "",
      address: "",
      phone: "",
      isPrimary: true,
    },
    {
      country: "United Kingdom",
      countryCode: "GB",
      flag: "🇬🇧",
      city: "",
      address: "",
      phone: "",
      isPrimary: false,
    },
  ],

  // Turn whole service lines on or off.
  services: {
    coaching: true,
    mentorship: true,
    consulting: true,
    speaking: true,
    training: true,
    ebooks: true,
    events: true,
  },

  // If a value is set, that service's CTA redirects there. If empty, visitors use the on-site enquiry form.
  externalLinks: {
    coaching: "",
    mentorship: "",
    consulting: "",
    ebooks: "https://selfany.com/becomearticulate",
    becomeArticulate: "https://selfany.com/becomearticulate",
  },

  notifications: {
    // A channel is only ACTIVE when enabled here AND its environment variables are present.
    email: { enabled: true, recipient: "", provider: "nodemailer" }, // recipient falls back to NOTIFICATION_EMAIL
    whatsapp: { enabled: false, number: "", provider: "whatsapp" }, // international format, digits only, e.g. "2348012345678"
    // WhatsApp takes priority when both are active ("auto"). Neither active => stored in the database only.
    defaultChannel: "auto",
  },

  payments: {
    enabled: false,
    provider: "paystack", // "paystack" | "stripe"
    currency: "NGN",
    paystack: { publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "" },
    stripe: { publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "" },
    methods: ["Card", "Bank transfer"],
  },

  booking: {
    requireApproval: true,
    generatePurchaseCode: true,
    currency: "NGN",
    codePrefix: "GKA", // purchase codes look like GKA-2026-XXXXXX
  },

  content: {
    // Descriptive service copy. Edit freely — it is positioning copy, not biography.
    services: [
      {
        id: "personal-coaching",
        toggle: "coaching",
        name: "Personal Coaching",
        summary: "One-to-one guidance for people ready to live and lead with greater intention.",
        benefits: ["Clarity on what matters most", "A structured path for growth", "Accountability and steady momentum"],
        ctaLabel: "Request Coaching",
        category: "coaching",
        linkKey: "coaching",
      },
      {
        id: "executive-coaching",
        toggle: "coaching",
        name: "Executive Coaching",
        summary: "Focused support for leaders shaping teams, organisations and their own influence.",
        benefits: ["Sharper decision-making", "Confident, purposeful communication", "A considered leadership presence"],
        ctaLabel: "Enquire About Executive Coaching",
        category: "coaching",
        linkKey: "coaching",
      },
      {
        id: "mentorship",
        toggle: "mentorship",
        name: "Mentorship",
        summary: "Sustained, personal mentorship for those building a life and career of substance.",
        benefits: ["Perspective from lived experience", "Honest, constructive feedback", "A trusted sounding board"],
        ctaLabel: "Request Mentorship",
        category: "mentorship",
        linkKey: "mentorship",
      },
      {
        id: "consulting",
        toggle: "consulting",
        name: "Professional Consulting",
        summary: "Advisory engagements for individuals and organisations seeking considered direction.",
        benefits: ["Tailored, practical recommendations", "Clear priorities and next steps", "Discreet, professional engagement"],
        ctaLabel: "Request Consulting",
        category: "consulting",
        linkKey: "consulting",
      },
      {
        id: "speaking",
        toggle: "speaking",
        name: "Speaking Engagements",
        summary: "Keynotes and talks for conferences, institutions, communities and corporate audiences.",
        benefits: ["Messages tailored to your audience", "Engaging, purposeful delivery", "Smooth, professional coordination"],
        ctaLabel: "Invite Solomon to Speak",
        category: "speaking",
      },
      {
        id: "training",
        toggle: "training",
        name: "Training & Workshops",
        summary: "Immersive sessions for teams and groups focused on growth, communication and purpose.",
        benefits: ["Practical, participatory formats", "Customised to your group", "Takeaways that last beyond the room"],
        ctaLabel: "Request a Workshop",
        category: "training",
      },
      {
        id: "ebooks",
        toggle: "ebooks",
        name: "Ebooks & Publications",
        summary: "Written resources to read, reflect on and return to in your own time.",
        benefits: ["Learn at your own pace", "Accessible digital formats", "Ideas you can apply immediately"],
        ctaLabel: "Browse Publications",
        category: "general",
        linkKey: "ebooks",
      },
      {
        id: "events",
        toggle: "events",
        name: "Events",
        summary: "Join Solomon Buchi in person for gatherings, conversations and experiences.",
        benefits: ["Be part of a like-minded community", "Direct access to the experience", "Secure, verified ticketing"],
        ctaLabel: "View Events",
        category: "event-ticket",
      },
    ],

    publications: [
      {
        slug: "become-articulate",
        title: "Become Articulate",
        description: "Available through the official Become Articulate page.",
        author: "Solomon Buchi", // confirm/adjust the author line
        cover: "", // e.g. "/images/become-articulate.jpg"
        purchase: "external",
        ctaLabel: "Get It Now",
      },
    ],

    // Example event (uncomment and edit). Events with a past date are hidden automatically.
    // Tier price is in major units; omit price for "request only".
    events: [
      // {
      //   slug: "purposeful-living-2027",
      //   name: "Event name",
      //   description: "Event description.",
      //   date: "2027-03-14T10:00:00+01:00",
      //   venue: "Venue name",
      //   city: "Lagos",
      //   country: "Nigeria",
      //   tiers: [
      //     { id: "standard", name: "Standard", price: 10000, currency: "NGN" },
      //     { id: "vip", name: "VIP", price: 25000, currency: "NGN" },
      //   ],
      // },
    ],

    // Only real testimonials. The homepage section is hidden while this is empty.
    testimonials: [],
  },
};

export type { SiteConfig };
