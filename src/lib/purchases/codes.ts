import crypto from "node:crypto";
import { siteConfig } from "@/config/site.config";

// No 0/O/1/I/L to keep codes easy to read out loud at a door.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomChars(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return out;
}

/** e.g. GKA-2026-X7K2QM. Uniqueness is enforced by a unique DB index; callers retry on collision. */
export function generatePurchaseCode(): string {
  return `${siteConfig.booking.codePrefix}-${new Date().getFullYear()}-${randomChars(6)}`;
}

/** Unguessable payment reference sent to the provider (also the customer's confirmation-page key). */
export function generateReference(): string {
  return `SB-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(9).toString("hex").toUpperCase()}`;
}

export function ticketCode(purchaseCode: string, index: number): string {
  return `${purchaseCode}-${String(index).padStart(2, "0")}`;
}
