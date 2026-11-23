import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sb_admin";
const TTL_MS = 8 * 60 * 60 * 1000;

const secret = () => process.env.ADMIN_SESSION_SECRET ?? "";
const sha = (s: string) => crypto.createHash("sha256").update(s).digest();
const hmac = (s: string) => crypto.createHmac("sha256", secret()).update(s).digest("hex");

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && secret().length >= 32;
}

export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !adminConfigured()) return false;
  return crypto.timingSafeEqual(sha(input), sha(expected));
}

export function createSessionToken(): { value: string; maxAge: number } {
  const exp = Date.now() + TTL_MS;
  return { value: `${exp}.${hmac(String(exp))}`, maxAge: TTL_MS / 1000 };
}

function verifyToken(token: string | undefined): boolean {
  if (!token || !adminConfigured()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = hmac(exp);
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export async function isAdmin(): Promise<boolean> {
  return verifyToken((await cookies()).get(ADMIN_COOKIE)?.value);
}
