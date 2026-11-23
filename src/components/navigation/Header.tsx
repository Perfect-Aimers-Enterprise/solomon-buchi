"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface NavItem {
  label: string;
  href: string;
}

export function Header({ brandName, items }: { brandName: string; items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-milk/60 bg-white/95 shadow-sm backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg font-medium uppercase tracking-wordmark text-charcoal md:text-xl"
          aria-label={`${brandName} — home`}
        >
          {brandName}
        </Link>

        <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`label underline-link ${pathname === i.href ? "text-charcoal" : ""}`}
            >
              {i.label}
            </Link>
          ))}
          <Link href="/contact" className="btn-outline !px-6 !py-3">
            Enquire
          </Link>
        </nav>

        <button
          type="button"
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[7px] lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`h-px w-7 bg-charcoal transition-transform duration-300 ${
              open ? "translate-y-[4px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-7 bg-charcoal transition-transform duration-300 ${
              open ? "-translate-y-[4px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div
          className="absolute inset-x-0 top-20 z-40 flex h-[calc(100dvh-5rem)] flex-col overflow-y-auto border-t border-milk/60 bg-white px-8 pb-12 pt-10 shadow-[0_20px_60px_rgba(34,34,34,0.16)] lg:hidden"
          role="dialog"
          aria-label="Menu"
        >
          <nav className="flex flex-1 flex-col gap-6" aria-label="Mobile">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="font-display text-4xl font-light text-charcoal"
              >
                {i.label}
              </Link>
            ))}
          </nav>

          <Link href="/contact" className="btn-solid mt-10 w-full">
            Get In Touch
          </Link>
        </div>
      )}
      {/* {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-20 z-40 flex flex-col border-t border-white/80 bg-white/95 px-8 pb-12 pt-10 shadow-[0_20px_60px_rgba(34,34,34,0.16)] backdrop-blur-2xl lg:hidden"
          role="dialog"
          aria-label="Menu"
        >
          <nav className="flex flex-1 flex-col gap-6" aria-label="Mobile">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="font-display text-4xl font-light text-charcoal"
              >
                {i.label}
              </Link>
            ))}
          </nav>

          <Link href="/contact" className="btn-solid w-full">
            Get In Touch
          </Link>
        </div>
      )} */}
    </header>
  );
}
