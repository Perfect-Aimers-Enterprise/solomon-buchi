import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { connectDb } from "@/lib/database/connect";
import { databaseConfigured } from "@/lib/utils/features";
import { Purchase } from "@/models/Purchase";
import { Ticket } from "@/models/Ticket";
import { Transaction } from "@/models/Transaction";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { RedeemButton } from "@/components/admin/AdminActions";

export default async function AdminPurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!databaseConfigured())
    return <p className="container-page text-stone">MONGODB_URI is not set.</p>;
  const { q: rawQ } = await searchParams;
  const q = typeof rawQ === "string" ? rawQ.trim().slice(0, 120) : "";
  await connectDb();

  // q is always a string (never an object), so it cannot inject query operators.
  const filter = q
    ? {
        $or: [
          { purchaseCode: q.toUpperCase() },
          { "customer.email": q.toLowerCase() },
          { reference: q },
        ],
      }
    : {};
  const purchases = await Purchase.find(filter)
    .sort({ createdAt: -1 })
    .limit(q ? 50 : 25)
    .lean();
  const codes = purchases.map((p) => p.purchaseCode).filter((c): c is string => Boolean(c));
  const [tickets, txs] = await Promise.all([
    Ticket.find({ purchaseCode: { $in: codes } })
      .sort({ ticketCode: 1 })
      .lean(),
    Transaction.find({ purchaseCode: { $in: codes } }).lean(),
  ]);

  return (
    <div className="container-page">
      <h1 className="text-5xl">Purchases &amp; tickets</h1>
      <form className="mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row" role="search">
        <input
          name="q"
          defaultValue={q}
          className="field"
          placeholder="Purchase code, customer email or reference"
          aria-label="Search purchases"
        />
        <button className="btn-solid shrink-0">Search</button>
      </form>

      <ul className="mt-14 space-y-10">
        {purchases.length === 0 && (
          <li className="text-stone">
            {q ? "No purchase matches that search." : "No purchases yet."}
          </li>
        )}
        {purchases.map((p) => {
          const pt = tickets.filter((t) => t.purchaseCode === p.purchaseCode);
          const tx = txs.find((t) => t.purchaseCode === p.purchaseCode);
          return (
            <li key={p.reference} className="border border-milk/70 p-6 md:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <p className="font-display text-3xl tracking-wider">
                  {p.purchaseCode ?? "— no code (unpaid) —"}
                </p>
                <span className={`label ${p.status === "paid" ? "!text-charcoal" : ""}`}>
                  {p.status === "paid" ? "Paid · verified" : p.status}
                </span>
              </div>
              <dl className="mt-6 grid gap-4 text-sm md:grid-cols-3">
                <div>
                  <dt className="label">Customer</dt>
                  <dd>
                    {p.customer?.fullName || "Unknown customer"}
                    <br />
                    {p.customer?.email || "No email provided"}
                    <br />
                    {p.customer?.phone || "No phone provided"}
                    {" · "}
                    {p.customer?.country || "Country unavailable"}
                  </dd>
                </div>
                <div>
                  <dt className="label">Item</dt>
                  <dd>
                    {p.itemName}
                    <br />
                    Qty {p.quantity}
                    {p.eventName ? ` · ${p.ticketTierName}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="label">Payment</dt>
                  <dd>
                    {formatMoney(p.amountMinor, p.currency)} via {p.provider}
                    <br />
                    {p.paidAt ? formatDate(p.paidAt, true) : "Not paid"}
                  </dd>
                </div>
                <div className="md:col-span-3">
                  <dt className="label">References</dt>
                  <dd className="break-all text-stone">
                    Ours: {p.reference}
                    {tx ? ` · Provider: ${tx.providerTransactionId}` : ""}
                  </dd>
                </div>
              </dl>
              {pt.length > 0 && (
                <ul className="mt-6 divide-y divide-milk/60 border-t border-milk/60">
                  {pt.map((t) => (
                    <li key={t.ticketCode} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="font-display text-xl tracking-wider">{t.ticketCode}</p>
                        <p className="text-sm text-stone">
                          {t.holderName} · {t.eventName}
                          {t.tierName ? ` · ${t.tierName}` : ""}
                        </p>
                      </div>
                      {t.redeemed ? (
                        <span className="label">
                          Used{t.redeemedAt ? ` · ${formatDate(t.redeemedAt, true)}` : ""}
                        </span>
                      ) : (
                        <RedeemButton ticketCode={t.ticketCode} />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
