import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { siteConfig } from "@/config/site.config";

/**
 * Renders the configured portrait. If the file is not in /public yet, an elegant
 * monogram panel is shown instead — so the page never displays a broken image.
 */
export function Portrait({ priority = false, className = "", sizes = "(min-width: 1024px) 40vw, 90vw" }: { priority?: boolean; className?: string; sizes?: string }) {
  const { portrait, fullName, firstName, lastName } = siteConfig.person;
  const exists = portrait && fs.existsSync(path.join(process.cwd(), "public", portrait.replace(/^\//, "")));

  return (
    <div className={`relative aspect-[4/5] w-full overflow-hidden bg-ivory ${className}`}>
      {exists ? (
        <Image src={portrait} alt={`Portrait of ${fullName}`} fill priority={priority} sizes={sizes} className="object-cover object-top" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-ivory to-milk-soft/60" role="img" aria-label={`Portrait placeholder for ${fullName}`}>
          <span className="font-display text-[7rem] font-light leading-none tracking-wide text-brown/70 md:text-[9rem]">
            {firstName[0]}
            {lastName[0]}
          </span>
          {process.env.NODE_ENV !== "production" && (
            <span className="mt-6 px-6 text-center text-[11px] uppercase tracking-label text-stone">Add portrait at /public{portrait}</span>
          )}
        </div>
      )}
    </div>
  );
}
