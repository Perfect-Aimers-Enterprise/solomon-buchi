import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  href: string;
  external?: boolean;
  variant?: "solid" | "outline" | "text";
  children: ReactNode;
  className?: string;
}

export function ButtonLink({ href, external, variant = "solid", children, className = "" }: Props) {
  const cls =
    variant === "solid" ? "btn-solid" : variant === "outline" ? "btn-outline" : "label underline-link tracking-label";
  const full = `${cls} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={full}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={full}>
      {children}
    </Link>
  );
}
