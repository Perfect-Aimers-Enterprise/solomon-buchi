"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="label underline-link"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}

export function RedeemButton({ ticketCode }: { ticketCode: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function redeem() {
    if (!confirm(`Mark ticket ${ticketCode} as used? This cannot be undone.`)) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/tickets/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticketCode }) }).catch(() => null);
    const json = res ? ((await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }) : { error: "Network error" };
    setLoading(false);
    if (json.ok) router.refresh();
    else setError(json.error ?? "Failed");
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button onClick={redeem} disabled={loading} className="btn-outline !px-4 !py-2">{loading ? "…" : "Mark used"}</button>
      {error && <span className="text-xs text-[#9a3b2e]">{error}</span>}
    </span>
  );
}
