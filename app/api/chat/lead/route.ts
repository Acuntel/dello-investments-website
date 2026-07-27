import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { recordLead } from "@/lib/admin/leads";

// Emails chat leads (and, on chat close, the transcript) to the team via
// Resend. Console-logs as a fallback when RESEND_API_KEY is absent so leads
// are never silently dropped in development.

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

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`lead:${ip}`, 5)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { name, email, phone, transcript, isClose } = await req.json();

    if (typeof name !== "string" || typeof email !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Invalid lead" }, { status: 400 });
    }
    if (
      name.length > 200 ||
      email.length > 200 ||
      (phone && String(phone).length > 50)
    ) {
      return NextResponse.json({ error: "Field too long" }, { status: 400 });
    }

    const transcriptText = Array.isArray(transcript)
      ? transcript
          .slice(0, 40)
          .map(
            (m: { role?: string; content?: string }) =>
              `${m.role === "user" ? "Visitor" : "Assistant"}: ${String(m.content || "").slice(0, 2000)}`,
          )
          .join("\n\n")
      : "";

    // Only the lead itself is recorded, not the transcript that follows when
    // the visitor closes the chat, or every conversation would be counted twice.
    if (!isClose) {
      await recordLead({
        source: "chat",
        name,
        email,
        phone: phone ? String(phone) : "",
      });
    }

    const subject = isClose
      ? `Chat transcript, ${name}`
      : `New chat lead, ${name}`;
    const html = `
      <h2>${isClose ? "Chat ended, transcript" : "New chatbot lead"}</h2>
      <p><strong>Name:</strong> ${esc(name)}</p>
      <p><strong>Email:</strong> ${esc(email)}</p>
      ${phone ? `<p><strong>Phone:</strong> ${esc(String(phone))}</p>` : ""}
      ${transcriptText ? `<hr/><pre style="font-family:inherit;white-space:pre-wrap">${esc(transcriptText)}</pre>` : ""}
    `;

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.log("[chat lead, RESEND_API_KEY not set]", {
        name,
        email,
        phone,
      });
      return NextResponse.json({ ok: true });
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Dello Website <onboarding@resend.dev>",
        to: ["connect@delloinvestments.com"],
        reply_to: email,
        subject,
        html,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Chat lead error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
