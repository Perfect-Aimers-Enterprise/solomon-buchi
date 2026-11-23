import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { connectDb } from "@/lib/database/connect";
import { databaseConfigured } from "@/lib/utils/features";
import { ServiceRequest } from "@/models/ServiceRequest";
import { ContactSubmission } from "@/models/ContactSubmission";
import { REQUEST_CATEGORIES } from "@/config/request-categories";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

type Row = { _id: unknown; type: string; fullName: string; email: string; phone: string; country: string; subject: string; message: string; additionalInfo?: string; eventName?: string; ticketTier?: string; tickets?: number; createdAt: Date; delivered?: boolean };

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!databaseConfigured()) return <p className="container-page text-stone">MONGODB_URI is not set.</p>;
  const { type } = await searchParams;
  await connectDb();

  const [reqs, contacts] = await Promise.all([
    ServiceRequest.find(type && type !== "general" && type !== "all" ? { category: type } : type === "general" ? { _id: null } : {}).sort({ createdAt: -1 }).limit(100).lean(),
    type && type !== "general" && type !== "all" ? [] : ContactSubmission.find().sort({ createdAt: -1 }).limit(100).lean(),
  ]);

  const rows: Row[] = [
    ...reqs.map((r) => ({ ...r, type: r.category, delivered: r.notification?.delivered })),
    ...contacts.map((c) => ({ ...c, type: "general", delivered: c.notification?.delivered })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)) as Row[];

  return (
    <div className="container-page">
      <h1 className="text-5xl">Requests &amp; enquiries</h1>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
        <Link href="/admin" className="label underline-link">All</Link>
        {REQUEST_CATEGORIES.map((c) => <Link key={c.id} href={`/admin?type=${c.id}`} className="label underline-link">{c.label}</Link>)}
      </div>

      <ul className="mt-12 border-t border-milk/70">
        {rows.length === 0 && <li className="py-10 text-stone">Nothing here yet.</li>}
        {rows.map((r) => (
          <li key={String(r._id)} className="border-b border-milk/70">
            <details className="group py-5">
              <summary className="grid cursor-pointer list-none gap-2 md:grid-cols-12 md:items-baseline">
                <span className="label md:col-span-2">{REQUEST_CATEGORIES.find((c) => c.id === r.type)?.label ?? r.type}</span>
                <span className="font-display text-2xl md:col-span-3">{r.fullName}</span>
                <span className="truncate text-stone md:col-span-4">{r.subject}</span>
                <span className="text-sm text-stone md:col-span-3 md:text-right">{formatDate(r.createdAt, true)}{r.delivered === false ? " · not notified" : ""}</span>
              </summary>
              <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
                <div><dt className="label">Email</dt><dd><a className="underline-link" href={`mailto:${r.email}`}>{r.email}</a></dd></div>
                <div><dt className="label">Phone</dt><dd>{r.phone}</dd></div>
                <div><dt className="label">Country</dt><dd>{r.country}</dd></div>
                {r.eventName && <div><dt className="label">Event</dt><dd>{r.eventName} · {r.ticketTier} × {r.tickets}</dd></div>}
                <div className="md:col-span-2"><dt className="label">Message</dt><dd className="whitespace-pre-wrap">{r.message}</dd></div>
                {r.additionalInfo && <div className="md:col-span-2"><dt className="label">Additional</dt><dd className="whitespace-pre-wrap">{r.additionalInfo}</dd></div>}
              </dl>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
