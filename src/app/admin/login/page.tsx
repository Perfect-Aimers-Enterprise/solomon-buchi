import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { adminConfigured, isAdmin } from "@/lib/auth/admin";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="container-page max-w-md py-16">
      <p className="label mb-6">Administrator</p>
      <h1 className="mb-12 text-5xl">Sign in</h1>
      {adminConfigured() ? <LoginForm /> : <p className="text-stone">Admin access is disabled. Set ADMIN_PASSWORD and a 32+ character ADMIN_SESSION_SECRET in the environment.</p>}
    </div>
  );
}
