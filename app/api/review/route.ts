import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { REVIEW_FEEDBACK_WEBHOOK } from "@/lib/reviewWebhook";
import { reviewConfig } from "@/lib/review.config";

// Review form handler. Every rating is forwarded to GHL: 1-3 so Karen and
// Alexa can call the customer, 4-5 so the win is recorded before the visitor
// leaves for Google. Never blocks the visitor on a slow CRM: the browser
// redirects or thanks them whatever this returns.

const ALLOWED = ["delloinvestments.com", "www.delloinvestments.com", "localhost"];

function allowedOrigin(req: NextRequest) {
  const src = req.headers.get("origin") || req.headers.get("referer") || "";
  try {
    const host = new URL(src).hostname;
    return ALLOWED.includes(host) || host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

const cap = (v: unknown, n: number) =>
  typeof v === "string" ? v.trim().slice(0, n) : "";

export async function POST(req: NextRequest) {
  if (!allowedOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`review:${ip}`, 5)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  // Honeypot: bots fill every field. Pretend it worked.
  if (cap(body.company, 200)) return NextResponse.json({ ok: true });

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Bad rating" }, { status: 400 });
  }
  const happy = rating >= reviewConfig.happyMin;
  const feedback = cap(body.feedback, 3000);
  if (!happy && !feedback) {
    return NextResponse.json({ error: "Feedback required" }, { status: 400 });
  }

  const fromLink = Boolean(cap(body.name, 200) || cap(body.email, 200) || cap(body.cid, 100));
  const payload = {
    rating,
    sentiment: happy ? "happy" : "unhappy",
    feedback,
    name: cap(body.name, 200) || cap(body.contactName, 200),
    email: cap(body.email, 200),
    cid: cap(body.cid, 100),
    contact_method: cap(body.contactMethod, 200),
    source: fromLink ? "review link" : "QR or direct",
    tag: happy ? "review - happy" : fromLink ? "unhappy - needs call" : "unhappy - from QR",
    submitted_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(REVIEW_FEEDBACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Review webhook returned ${res.status}`);
      return NextResponse.json({ ok: false }, { status: 502 });
    }
  } catch (error) {
    console.error("Review webhook failed:", error);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
