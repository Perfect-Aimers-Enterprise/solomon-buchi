"use client";

import { useState, type FormEvent } from "react";

interface Props {
  itemId: string;
  itemName: string;
  unitLabel: string;
  unitMinor: number;
  currency: string;
  countries: string[];
  allowQuantity: boolean;
  locale: string;
}

export function PurchaseForm({ itemId, itemName, unitLabel, unitMinor, currency, countries, allowQuantity, locale }: Props) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = new Intl.NumberFormat(locale, { style: "currency", currency }).format((unitMinor * qty) / 100);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setErrors({});
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          quantity: qty,
          customer: { fullName: f.get("fullName"), email: f.get("email"), phone: f.get("phone"), country: f.get("country") },
        }),
      });
      const json = (await res.json()) as { ok: boolean; checkoutUrl?: string; error?: string; fields?: Record<string, string> };
      if (json.ok && json.checkoutUrl) {
        window.location.assign(json.checkoutUrl);
        return; // keep the loading state while the browser navigates
      }
      setErrors(json.fields ?? {});
      setError(json.error ?? "Something went wrong.");
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  const err = (n: string) => errors[n] && <p className="mt-1 text-xs text-[#9a3b2e]" role="alert">{errors[n]}</p>;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8" aria-busy={loading}>
      <div className="border-y border-milk/70 py-6">
        <p className="label">You are purchasing</p>
        <p className="mt-2 font-display text-3xl">{itemName}</p>
        <p className="text-stone">{unitLabel} each</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div><label htmlFor="fullName" className="label">Full name</label><input id="fullName" name="fullName" className="field" autoComplete="name" required />{err("fullName")}</div>
        <div><label htmlFor="email" className="label">Email address</label><input id="email" name="email" type="email" className="field" autoComplete="email" required />{err("email")}</div>
        <div><label htmlFor="phone" className="label">Phone number</label><input id="phone" name="phone" type="tel" className="field" autoComplete="tel" required />{err("phone")}</div>
        <div>
          <label htmlFor="country" className="label">Country</label>
          <input id="country" name="country" list="countries" className="field" autoComplete="country-name" required />
          <datalist id="countries">{countries.map((c) => <option key={c} value={c} />)}</datalist>
          {err("country")}
        </div>
        {allowQuantity && (
          <div>
            <label htmlFor="quantity" className="label">Number of tickets</label>
            <input id="quantity" type="number" min={1} max={20} value={qty} onChange={(e) => setQty(Math.min(20, Math.max(1, Number(e.target.value) || 1)))} className="field" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between border-t border-milk/70 pt-6">
        <span className="label">Total</span>
        <span className="font-display text-4xl">{total}</span>
      </div>

      {error && <p className="border border-[#9a3b2e]/40 bg-[#9a3b2e]/5 px-5 py-4 text-sm text-[#9a3b2e]" role="alert">{error}</p>}

      <button type="submit" className="btn-solid w-full" disabled={loading}>
        {loading ? "Redirecting to secure checkout…" : "Continue to Secure Payment"}
      </button>
      <p className="text-center text-xs text-stone">You will be taken to the payment provider to complete your purchase. Your purchase code is issued only after payment is verified.</p>
    </form>
  );
}
