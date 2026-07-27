import { NextResponse } from "next/server";
import { requirePasscode } from "@/lib/admin/auth";
import { recentLeads } from "@/lib/admin/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { passcode } → the most recent enquiries, newest first.
export async function POST(req: Request) {
  let body: { passcode?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const auth = requirePasscode(req, body.passcode);
  if (!auth.ok) return auth.response;

  try {
    return NextResponse.json(
      { leads: await recentLeads(50) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Your enquiries could not be fetched right now." },
      { status: 502 },
    );
  }
}
