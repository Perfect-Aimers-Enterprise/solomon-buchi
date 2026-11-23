import { NextResponse } from "next/server";
import { requestSchema } from "@/lib/validation/schemas";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";
import { sha256 } from "@/lib/utils/sanitize";
import { connectDb } from "@/lib/database/connect";
import { databaseConfigured } from "@/lib/utils/features";
import { notifyAdmin, resolveChannel } from "@/lib/notifications/notification.service";
import { ServiceRequest } from "@/models/ServiceRequest";
import { ContactSubmission } from "@/models/ContactSubmission";
import { getCategory } from "@/config/request-categories";
import { siteConfig } from "@/config/site.config";
import { upcomingEvents } from "@/lib/utils/site-helpers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`requests:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: "Too many submissions. Please try again shortly." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field. Pretend success so bots learn nothing.
  if (typeof raw.website === "string" && raw.website.length > 0) return NextResponse.json({ ok: true, message: "Thank you." });

  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0] ?? "form")] = i.message;
    return NextResponse.json({ ok: false, error: "Please correct the highlighted fields.", fields }, { status: 422 });
  }
  const d = parsed.data;

  const cat = getCategory(d.category);
  if (!cat || (cat.toggle && !siteConfig.services[cat.toggle])) return NextResponse.json({ ok: false, error: "This request type is not currently available." }, { status: 400 });

  let eventName = "";
  let tierName = "";
  if (d.category === "event-ticket") {
    const ev = upcomingEvents().find((e) => e.slug === d.eventSlug);
    const tier = ev?.tiers.find((t) => t.id === d.ticketTier);
    if (!ev || !tier) return NextResponse.json({ ok: false, error: "That event or ticket category is no longer available." }, { status: 422 });
    eventName = ev.name;
    tierName = tier.name;
  }

  if (!databaseConfigured()) return NextResponse.json({ ok: false, error: "Submissions are temporarily unavailable. Please try again later." }, { status: 503 });

  try {
    await connectDb();
    // Duplicate-submission protection: identical content from the same email within 10 minutes.
    const fingerprint = sha256([d.category, d.email, d.subject, d.message, d.eventSlug, d.ticketTier].join("|"));
    // Both models share the fields used below; the cast keeps one code path for the two collections.
    const Model = (d.category === "general" ? ContactSubmission : ServiceRequest) as unknown as typeof ServiceRequest;
    const dupe = await Model.findOne({ fingerprint, createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } }).lean();
    if (dupe) return NextResponse.json({ ok: true, message: "We already have this request. Thank you." });

    const base = {
      fullName: d.fullName, email: d.email, phone: d.phone, country: d.country, subject: d.subject,
      message: d.message, additionalInfo: d.additionalInfo, fingerprint, ipHash: sha256(ip),
    };
    const doc =
      d.category === "general"
        ? await ContactSubmission.create(base)
        : await ServiceRequest.create({ ...base, category: d.category, eventSlug: d.eventSlug, eventName, ticketTier: tierName || d.ticketTier, tickets: d.tickets ?? 0, paymentMethod: d.paymentMethod });

    const result = await notifyAdmin({
      subject: `New ${cat.label} — ${d.fullName}`,
      replyTo: d.email,
      rows: [
        ["Request type", cat.label], ["Full name", d.fullName], ["Email", d.email], ["Phone", d.phone], ["Country", d.country],
        ["Subject", d.subject], ["Message", d.message],
        ...(d.additionalInfo ? ([[cat.extraLabel, d.additionalInfo]] as [string, string][]) : []),
        ...(d.category === "event-ticket" ? ([["Event", eventName], ["Ticket category", tierName], ["Tickets", String(d.tickets)], ["Payment method", d.paymentMethod || "—"]] as [string, string][]) : []),
      ],
    });
    await Model.updateOne({ _id: doc._id }, { $set: { notification: { channel: result.channel, delivered: result.delivered, error: result.error } } });

    const message =
      resolveChannel() === "none" || !result.delivered
        ? "Thank you — your request has been received and recorded. We will be in touch."
        : "Thank you — your request has been sent. We will be in touch shortly.";
    return NextResponse.json({ ok: true, message });
  } catch (e) {
    console.error("[requests] failed", e);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
