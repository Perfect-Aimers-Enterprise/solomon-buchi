import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PurchaseForm } from "@/components/forms/PurchaseForm";
import { siteConfig } from "@/config/site.config";
import { getCatalogItem } from "@/lib/purchases/catalog";
import { paymentsActive } from "@/lib/utils/features";
import { formatMoney } from "@/lib/utils/format";
import { COUNTRIES } from "@/lib/utils/countries";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PurchasePage({ searchParams }: { searchParams: Promise<{ item?: string; cancelled?: string }> }) {
  const sp = await searchParams;
  if (!paymentsActive() || !sp.item) notFound();
  const item = getCatalogItem(sp.item);
  if (!item) notFound();

  return (
    <section className="pt-40 pb-28">
      <div className="container-page max-w-3xl">
        <p className="label mb-8">Checkout</p>
        <h1 className="text-5xl font-light leading-tight md:text-7xl">Secure your <em className="text-brown">place.</em></h1>
        {sp.cancelled && <p className="mt-8 border border-milk px-5 py-4 text-sm text-stone">Your payment was not completed. You have not been charged — you may try again below.</p>}
        <div className="mt-14">
          <PurchaseForm
            itemId={item.id}
            itemName={item.name}
            unitLabel={formatMoney(item.unitAmountMinor, item.currency)}
            unitMinor={item.unitAmountMinor}
            currency={item.currency}
            countries={COUNTRIES}
            allowQuantity={item.type === "event"}
            locale={siteConfig.site.locale}
          />
        </div>
      </div>
    </section>
  );
}
