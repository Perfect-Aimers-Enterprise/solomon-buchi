import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/admin";
import { connectDb } from "@/lib/database/connect";
import { Ticket } from "@/models/Ticket";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Unauthorised" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { ticketCode?: unknown };
  if (typeof body.ticketCode !== "string" || body.ticketCode.length > 60) return NextResponse.json({ ok: false, error: "Invalid ticket." }, { status: 400 });

  await connectDb();
  // Atomic: only matches a ticket that has NOT been redeemed, so double redemption is impossible even under races.
  const t = await Ticket.findOneAndUpdate({ ticketCode: body.ticketCode, redeemed: false }, { $set: { redeemed: true, redeemedAt: new Date() } }, { new: true }).lean();
  if (!t) {
    const existing = await Ticket.findOne({ ticketCode: body.ticketCode }).lean();
    if (!existing) return NextResponse.json({ ok: false, error: "Ticket not found." }, { status: 404 });
    return NextResponse.json({ ok: false, error: `Already redeemed${existing.redeemedAt ? ` on ${existing.redeemedAt.toISOString()}` : ""}.` }, { status: 409 });
  }
  return NextResponse.json({ ok: true, redeemedAt: t.redeemedAt });
}
