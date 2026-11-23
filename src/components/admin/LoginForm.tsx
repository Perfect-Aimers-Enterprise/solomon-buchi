"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }).catch(() => null);
    const json = res ? ((await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }) : { error: "Network error." };
    if (json.ok) {
      router.replace("/admin");
      router.refresh();
      return;
    }
    setError(json.error ?? "Could not sign in.");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" className="field" autoComplete="current-password" required />
      </div>
      {error && <p className="text-sm text-[#9a3b2e]" role="alert">{error}</p>}
      <button className="btn-solid w-full" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
    </form>
  );
}
