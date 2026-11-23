import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, checkAdminPassword, createSessionToken } from "@/lib/auth/admin";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ ok: false, error: "Admin is not configured." }, { status: 503 });
  const rl = rateLimit(`admin-login:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: "Too many attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  if (typeof body.password !== "string" || !checkAdminPassword(body.password)) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }
  const { value, maxAge } = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge });
  return res;
}
