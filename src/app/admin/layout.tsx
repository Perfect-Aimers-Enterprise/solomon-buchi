import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/auth/admin";
import { LogoutButton } from "@/components/admin/AdminActions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();
  return (
    <div className="pt-28 pb-24">
      {authed && (
        <div className="container-page mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-milk/70 pb-5">
          <nav className="flex gap-8" aria-label="Admin">
            <Link href="/admin" className="label underline-link">Requests</Link>
            <Link href="/admin/purchases" className="label underline-link">Purchases &amp; tickets</Link>
          </nav>
          <LogoutButton />
        </div>
      )}
      {children}
    </div>
  );
}
