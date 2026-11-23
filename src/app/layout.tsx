import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { siteConfig } from "@/config/site.config";
import { siteUrl } from "@/lib/utils/features";
import { Header, type NavItem } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-sans", display: "swap" });
const accent = Playfair_Display({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-accent", display: "swap" });

const { brand, person } = siteConfig;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${person.fullName} — Personal Development, Coaching & Mentorship`, template: `%s — ${person.fullName}` },
  description: brand.description,
  applicationName: person.fullName,
  authors: [{ name: person.fullName }],
  icons: { icon: brand.favicon },
  openGraph: {
    type: "website",
    siteName: person.fullName,
    title: `${person.fullName} — Official Website`,
    description: brand.tagline,
    url: siteUrl(),
    images: [{ url: person.portrait, alt: person.fullName }],
  },
  twitter: { card: "summary_large_image", title: `${person.fullName} — Official Website`, description: brand.tagline },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", width: "device-width", initialScale: 1 };

function navItems(): NavItem[] {
  const s = siteConfig.services;
  const items: NavItem[] = [
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
  ];
  if (s.ebooks) items.push({ label: "Publications", href: "/publications" });
  if (s.events) items.push({ label: "Events", href: "/events" });
  items.push({ label: "Contact", href: "/contact" });
  return items;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const items = navItems();
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${accent.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        <Header brandName={person.fullName} items={items} />
        <main id="main">{children}</main>
        <Footer items={items} />
      </body>
    </html>
  );
}
