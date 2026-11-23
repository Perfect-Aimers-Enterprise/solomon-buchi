import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, children, align = "left" }: { eyebrow?: string; title: ReactNode; children?: ReactNode; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className="label mb-6">{eyebrow}</p>}
      <h2 className="text-4xl leading-[1.08] md:text-6xl">{title}</h2>
      {children && <div className="mt-8 text-base leading-relaxed text-stone md:text-lg">{children}</div>}
    </div>
  );
}
