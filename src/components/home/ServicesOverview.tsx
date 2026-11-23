import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { enabledServices } from "@/lib/utils/site-helpers";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function ServicesOverview() {
  const services = enabledServices();
  if (!services.length) return null;
  return (
    <section className="section">
      <div className="container-page">
        <Reveal>
          <SectionHeading eyebrow="Services" title={<>Work with <em className="text-brown">intention.</em></>}>
            <p>Considered, personal engagements designed around your goals.</p>
          </SectionHeading>
        </Reveal>
        <ul className="mt-20 border-t border-milk/70">
          {services.map((s, i) => (
            <li key={s.id} className="border-b border-milk/70">
              <Reveal>
                <Link href="/services" className="group grid items-baseline gap-4 py-8 md:grid-cols-12 md:py-10">
                  <span className="label md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-3xl transition-transform duration-500 group-hover:translate-x-2 md:col-span-5 md:text-4xl">{s.name}</span>
                  <span className="text-stone md:col-span-5">{s.summary}</span>
                  <span className="label text-right transition-colors group-hover:text-charcoal md:col-span-1" aria-hidden>→</span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
        <div className="mt-14">
          <ButtonLink href="/services" variant="outline">View All Services</ButtonLink>
        </div>
      </div>
    </section>
  );
}
