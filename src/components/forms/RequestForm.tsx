"use client";

import { createContext, useContext, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { RequestCategoryDef } from "@/config/request-categories";
import type { RequestCategory } from "@/types/site";

export interface FormEventOption {
  slug: string;
  name: string;
  tiers: { id: string; name: string }[];
}

interface Props {
  categories: RequestCategoryDef[];
  events: FormEventOption[];
  countries: string[];
  paymentMethods: string[];
  initial: { category?: string; event?: string; tier?: string };
}

// Defined at module level so inputs are never remounted (which would wipe typed values) when errors change.
const ErrorsContext = createContext<Record<string, string>>({});

function Field({ name, label, children }: { name: string; label: string; children: ReactNode }) {
  const errors = useContext(ErrorsContext);
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      {children}
      {errors[name] && <p id={`${name}-error`} className="mt-1 text-xs text-[#9a3b2e]" role="alert">{errors[name]}</p>}
    </div>
  );
}

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "success"; message: string } | { kind: "error"; message: string };

export function RequestForm({ categories, events, countries, paymentMethods, initial }: Props) {
  const firstCat = categories.find((c) => c.id === initial.category)?.id ?? categories[0]?.id ?? "general";
  const [category, setCategory] = useState<RequestCategory>(firstCat);
  const [eventSlug, setEventSlug] = useState(initial.event ?? "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const def = useMemo(() => categories.find((c) => c.id === category)!, [categories, category]);
  const tiers = events.find((e) => e.slug === eventSlug)?.tiers ?? [];
  const isEvent = category === "event-ticket";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "loading") return;
    setStatus({ kind: "loading" });
    setErrors({});
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, category }) });
      const json = (await res.json()) as { ok: boolean; message?: string; error?: string; fields?: Record<string, string> };
      if (json.ok) {
        setStatus({ kind: "success", message: json.message ?? "Thank you." });
        (e.target as HTMLFormElement).reset();
      } else {
        setErrors(json.fields ?? {});
        setStatus({ kind: "error", message: json.error ?? "Something went wrong." });
      }
    } catch {
      setStatus({ kind: "error", message: "Network error. Please check your connection and try again." });
    }
  }

  if (status.kind === "success") {
    return (
      <div className="border border-milk p-10 text-center md:p-16" role="status">
        <p className="label mb-6">Received</p>
        <p className="font-display text-4xl">Thank you.</p>
        <p className="mx-auto mt-6 max-w-md text-stone">{status.message}</p>
        <button type="button" className="btn-outline mt-10" onClick={() => setStatus({ kind: "idle" })}>
          Send another request
        </button>
      </div>
    );
  }

  const aria = (n: string) => ({ "aria-invalid": errors[n] ? true : undefined, "aria-describedby": errors[n] ? `${n}-error` : undefined });

  return (
    <ErrorsContext.Provider value={errors}>
    <form onSubmit={onSubmit} noValidate className="space-y-8" aria-busy={status.kind === "loading"}>
      <Field name="category" label="I would like to">
        <select id="category" className="field" value={category} onChange={(e) => setCategory(e.target.value as RequestCategory)}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </Field>

      <div className="grid gap-8 md:grid-cols-2">
        <Field name="fullName" label="Full name"><input id="fullName" name="fullName" className="field" autoComplete="name" required {...aria("fullName")} /></Field>
        <Field name="email" label="Email address"><input id="email" name="email" type="email" className="field" autoComplete="email" required {...aria("email")} /></Field>
        <Field name="phone" label="Phone number"><input id="phone" name="phone" type="tel" className="field" autoComplete="tel" placeholder="+234…" required {...aria("phone")} /></Field>
        <Field name="country" label="Country">
          <input id="country" name="country" list="countries" className="field" autoComplete="country-name" required {...aria("country")} />
          <datalist id="countries">{countries.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
      </div>

      {isEvent && (
        <div className="grid gap-8 md:grid-cols-2">
          <Field name="eventSlug" label="Event">
            <select id="eventSlug" name="eventSlug" className="field" value={eventSlug} onChange={(e) => setEventSlug(e.target.value)} required {...aria("eventSlug")}>
              <option value="">Select an event</option>
              {events.map((ev) => <option key={ev.slug} value={ev.slug}>{ev.name}</option>)}
            </select>
          </Field>
          <Field name="ticketTier" label="Ticket category">
            <select id="ticketTier" name="ticketTier" className="field" defaultValue={initial.tier ?? ""} key={eventSlug} required {...aria("ticketTier")}>
              <option value="">Select a category</option>
              {tiers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field name="tickets" label="Number of tickets"><input id="tickets" name="tickets" type="number" min={1} max={20} defaultValue={1} className="field" required {...aria("tickets")} /></Field>
          {paymentMethods.length > 0 && (
            <Field name="paymentMethod" label="Preferred payment method">
              <select id="paymentMethod" name="paymentMethod" className="field" defaultValue="">
                <option value="">No preference</option>
                {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          )}
        </div>
      )}

      <Field name="subject" label="Subject">
        <input id="subject" name="subject" className="field" placeholder={def.subjectPlaceholder} required {...aria("subject")} />
      </Field>
      <Field name="message" label="Message">
        <textarea id="message" name="message" rows={5} className="field resize-y" required {...aria("message")} />
      </Field>
      <Field name="additionalInfo" label={def.extraLabel}>
        <textarea id="additionalInfo" name="additionalInfo" rows={2} className="field resize-y" placeholder={def.extraPlaceholder} {...aria("additionalInfo")} />
      </Field>

      {/* Honeypot — hidden from people, irresistible to bots */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {status.kind === "error" && <p className="border border-[#9a3b2e]/40 bg-[#9a3b2e]/5 px-5 py-4 text-sm text-[#9a3b2e]" role="alert">{status.message}</p>}

      <button type="submit" className="btn-solid w-full md:w-auto" disabled={status.kind === "loading"}>
        {status.kind === "loading" ? "Sending…" : "Send Request"}
      </button>
    </form>
    </ErrorsContext.Provider>
  );
}
