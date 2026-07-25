import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { mintSessionToken } from "@/lib/session-token";

// Exchange a solved Cloudflare Turnstile token for a short-lived signed
// session token. The chat widget calls this once when a conversation starts,
// then reuses the returned token for every message. This is the non-spoofable
// gate behind the client-controlled Origin check.

const ALLOWED_HOSTS = [
  "delloinvestments.com",
  "www.delloinvestments.com",
  "localhost",
];

function isAllowedOrigin(req: NextRequest): boolean {
  const src = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!src) return false;
  try {
    const host = new URL(src).hostname;
    return ALLOWED_HOSTS.includes(host) || host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (process.env.CHAT_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Chat is temporarily unavailable." },
      { status: 503 },
    );
  }
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  let body: { turnstileToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const ok = await verifyTurnstile(body.turnstileToken, ip);
  if (!ok) {
    return NextResponse.json(
      { error: "Verification failed. Please refresh and try again." },
      { status: 403 },
    );
  }

  const minted = mintSessionToken();
  if (!minted) {
    return NextResponse.json(
      { error: "Chat is not configured." },
      { status: 500 },
    );
  }

  return NextResponse.json({ token: minted.token });
}
