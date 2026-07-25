import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

// Contact / cash-offer form handler. Defense order: origin → rate limit →
// honeypot → Turnstile (when configured) → validation with hard length caps
// → HTML-escaped email via Resend. Console-log fallback when Resend is
// absent so a misconfigured deploy never silently eats leads.

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

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CAPS: Record<string, number> = {
  name: 200,
  email: 200,
  phone: 50,
  address: 300,
  message: 5000,
};

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`contact:${ip}`, 5)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, phone, address, message, company, turnstileToken } =
      body;

    // Honeypot: "company" is invisible to humans. Bots that fill it get a
    // fake success so they don't adapt.
    if (typeof company === "string" && company.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    // Bot gate: enforce Turnstile once the secret is configured. Graceful
    // before that so the form is never broken by rollout order.
    if (process.env.TURNSTILE_SECRET_KEY) {
      const ok = await verifyTurnstile(turnstileToken, ip);
      if (!ok) {
        return NextResponse.json(
          { error: "Verification failed. Please refresh and try again." },
          { status: 403 },
        );
      }
    }

    if (!name?.trim() || !phone?.trim() || !address?.trim()) {
      return NextResponse.json(
        { error: "Name, phone, and property address are required." },
        { status: 400 },
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }
    for (const [field, cap] of Object.entries(CAPS)) {
      const value = body[field];
      if (typeof value === "string" && value.length > cap) {
        return NextResponse.json(
          { error: `Field "${field}" is too long.` },
          { status: 400 },
        );
      }
    }

    const html = `
      <h2>New cash-offer request from delloinvestments.com</h2>
      <p><strong>Name:</strong> ${esc(name)}</p>
      <p><strong>Phone:</strong> ${esc(phone)}</p>
      ${email ? `<p><strong>Email:</strong> ${esc(email)}</p>` : ""}
      <p><strong>Property:</strong> ${esc(address)}</p>
      ${message ? `<p><strong>Message:</strong></p><pre style="font-family:inherit;white-space:pre-wrap">${esc(message)}</pre>` : ""}
    `;

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.log("[contact form — RESEND_API_KEY not set]", {
        name,
        phone,
        address,
      });
      return NextResponse.json({ ok: true });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dello Website <onboarding@resend.dev>",
        to: ["connect@delloinvestments.com"],
        ...(email && { reply_to: email }),
        subject: `Cash offer request — ${name} (${address})`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Resend error:", await res.text());
      return NextResponse.json(
        { error: "Could not send your message. Please call us directly." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
