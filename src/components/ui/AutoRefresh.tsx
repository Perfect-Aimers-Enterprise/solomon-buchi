"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-runs the server component every few seconds (used while waiting for a webhook-confirmed payment). */
export function AutoRefresh({ everyMs = 5000, maxTries = 24 }: { everyMs?: number; maxTries?: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      if (++n > maxTries) return clearInterval(id);
      router.refresh();
    }, everyMs);
    return () => clearInterval(id);
  }, [router, everyMs, maxTries]);
  return null;
}
