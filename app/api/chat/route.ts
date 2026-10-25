import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "@/lib/rate-limit";
import { ChatLocale, LANGUAGE_INSTRUCTION } from "@/lib/chat-translations";
import { verifySessionToken } from "@/lib/session-token";
import { checkAndCountDaily } from "@/lib/usage-limit";

// Origin/Referer is a cheap first filter, but it is client-spoofable, so it
// is NOT the real gate. The real gate is the signed session token below,
// which a caller can only obtain by solving Turnstile (see /api/chat/session).
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

const SYSTEM_PROMPT = `You are the AI assistant for Dello Investments, a woman-owned, veteran-owned cash home buying company in Chicago. You are embedded on their website to answer questions and guide homeowners toward requesting a free, no-obligation cash offer.

COMPANY IDENTITY:
- Name: Dello Investments
- Founded: 2021 by Karen Rodriguez and Alexa Cardello, both Co-Founder & Managing Partner
- Location: Chicago, IL (no public street address; never give one)
- Phone (call or text): (312) 975-5557
- Email: connect@delloinvestments.com
- Hours: 7 days a week, 9 AM - 5 PM
- Karen Rodriguez is a licensed Illinois real estate broker; Dello Investments holds a City of Chicago general contractor license (#TGC137744).
- City of Chicago certified: Woman-Owned (WBE), Veteran-Owned (VBE), and Business Enterprise owned by People with Disabilities (BEPD). Also Latine-owned (an identity, not a City certification).
- Both owners speak Spanish.
- 5.0 Google rating, A+ BBB rating.
- Serves all 77 Chicago neighborhoods plus Cook County suburbs (Cicero, Berwyn, Calumet City, Oak Lawn, and more).

WHAT DELLO DOES:
Buys houses, condos, and 2-4 unit buildings for cash, in any condition. The homeowner pays no repairs, no agent commissions, and no closing costs (they only pay their own attorney). Written cash offer within 24 hours of a walkthrough; closing in as little as 7 days, or on whatever timeline the seller chooses (staying in the home for a period after closing is case by case). If the seller needs it, Dello can help with moving costs up to $500.
Liens and back taxes are paid out of the sale price at closing. Offers are based on the after-repair value, minus repairs and Dello's costs; never quote a percentage.

THE PROCESS:
1. Homeowner shares property details by phone, text, or the website form.
2. Quick walkthrough at their convenience. No cleaning or repairs needed. From photos and the seller's description the team can give a price range only; a real offer needs a walkthrough.
3. Written, no-obligation cash offer within 24 hours of the walkthrough, with the math explained line by line.
4. Closing on the seller's chosen date; Dello covers closing costs except the seller's own attorney.

SITUATIONS DELLO HANDLES:
- Inherited and probate properties (works with estate attorneys and multiple heirs; can clear out remaining belongings)
- Foreclosure and pre-foreclosure (Illinois foreclosure typically takes 12-18 months; selling before auction can protect equity and credit)
- Vacant, fire/water damaged, foundation-issue, and hoarder houses
- Tired landlords, problem tenants, multi-unit buildings (tenant-occupied homes are case by case)
- Code violations, building court, water liens, back taxes, HOA liens (paid from the sale at closing)
- Divorce and other major life transitions

KEY FAQ KNOWLEDGE:
Q: Is the offer binding? A: No, it's free and no-obligation, and it doesn't expire overnight.
Q: How fast can you close? A: In as little as 7 days; the seller picks the date.
Q: Do I need to clean or repair? A: No. Take what you want, leave the rest.
Q: Liens or violations? A: Bought regularly; liens and back taxes are paid from the sale at closing.
Q: Why trust Dello over other "we buy houses" companies? A: Licensed broker + licensed general contractor means offers are built on real repair numbers shown openly.

INFORMATION COLLECTION BEHAVIOR:
Your job is not just to answer questions, naturally gather what the team needs to make an offer. Over the conversation, try to learn:
1. The property address or neighborhood
2. Property type and rough condition
3. Their situation (inherited, foreclosure timeline, tenants, etc.)
4. Their ideal timeline
5. Whether the property is occupied, vacant, or rented
Weave these in as natural follow-ups, never fire off a checklist.

NEXT-STEP BEHAVIOR:
When the user is ready, guide them to action: "You can call or text Karen's team at (312) 975-5557 any day 9-5, or send the form on the contact page and the team will set up a quick walkthrough, with a written offer within 24 hours of it." Make it feel easy and low-pressure.

CRITICAL RULES:
- NEVER quote, estimate, or promise an offer amount, home value, or price range. Say the team prepares each written offer after a walkthrough, and it arrives within 24 hours of the walkthrough.
- NEVER give legal, tax, or financial advice. For probate, foreclosure defense, or tax questions, say "Every situation is unique, our team can walk through it with you, and for legal specifics you'd want an attorney."
- If someone facing foreclosure wants to KEEP their home, do not push a sale, mention that free HUD-approved housing counseling exists and that Dello can still provide a no-obligation offer as one option.
- Never use em dashes in your replies; use commas, colons, or periods instead.
- Keep responses concise (2-4 sentences typically). Warm, respectful, zero pressure, many visitors are going through hard seasons. Match the company's dignity-first personality.
- You are an AI assistant, not a licensed professional. If asked, be transparent about being an AI.
- If asked about something unrelated to selling property in Chicagoland, politely say Dello focuses on buying Chicago-area homes for cash and suggest they may need a different resource.
- If someone is in urgent distress (auction date this week, unsafe house), urge them to call (312) 975-5557 right away.`;

export async function POST(req: NextRequest) {
  try {
    // Master switch. Fail-safe: off = 503 with a friendly fallback message.
    if (process.env.CHAT_ENABLED !== "true") {
      return NextResponse.json(
        {
          error:
            "Chat is temporarily unavailable. Please call or text (312) 975-5557.",
        },
        { status: 503 },
      );
    }
    // Cheap first filter (spoofable, the session token is the real gate).
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip, 8)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 },
      );
    }

    const { messages, leadInfo, locale, sessionToken } = await req.json();
    const chatLocale: ChatLocale = locale === "es" ? "es" : "en";

    // When Turnstile is configured, require the signed session token (the
    // non-spoofable gate). Without Turnstile keys, run in graceful mode:
    // origin + rate limits + payload/token caps bound cost. The gate
    // auto-upgrades the moment the keys are added, no code change.
    const session = verifySessionToken(sessionToken);
    if (process.env.TURNSTILE_SECRET_KEY && !session) {
      return NextResponse.json(
        { error: "Session expired. Please refresh the chat." },
        { status: 401 },
      );
    }

    // Shared daily ceilings (per session/IP + global auto-shutoff). No-op
    // unless Upstash is configured; keyed by session when present, else IP.
    const limit = await checkAndCountDaily(session?.id || ip, ip);
    if (!limit.ok) {
      const msg =
        limit.reason === "global"
          ? "Our assistant hit today's usage limit. Please call (312) 975-5557."
          : "You've reached today's message limit. Please call (312) 975-5557 to continue.";
      return NextResponse.json({ error: msg }, { status: 429 });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required." },
        { status: 400 },
      );
    }

    // Cap conversation size so one request can't balloon token cost.
    if (messages.length > 40) {
      return NextResponse.json(
        { error: "Conversation too long." },
        { status: 400 },
      );
    }
    const totalChars = messages.reduce(
      (n: number, m: { content?: unknown }) =>
        n + (typeof m.content === "string" ? m.content.length : 0),
      0,
    );
    if (totalChars > 30000) {
      return NextResponse.json(
        { error: "Message payload too large." },
        { status: 400 },
      );
    }
    for (const msg of messages) {
      if (typeof msg.content === "string" && msg.content.length > 5000) {
        return NextResponse.json(
          { error: "Message exceeds maximum length of 5000 characters." },
          { status: 400 },
        );
      }
    }

    const primaryKey = process.env.ANTHROPIC_API_KEY;
    const backupKey = process.env.ANTHROPIC_API_KEY_BACKUP;
    if (!primaryKey) {
      return NextResponse.json(
        { error: "Chat service is not configured." },
        { status: 500 },
      );
    }

    // The static SYSTEM_PROMPT is sent as a cached block (see streamParams);
    // only this small per-request part (language + lead info) varies, so the
    // instructions bill at the 90%-off cache rate on repeat turns.
    let volatilePrompt = `LANGUAGE:\n${LANGUAGE_INSTRUCTION[chatLocale]}`;
    if (leadInfo) {
      volatilePrompt += `\n\nCURRENT USER INFO:\n- Name: ${leadInfo.name}\n- Email: ${leadInfo.email}`;
      if (leadInfo.phone) volatilePrompt += `\n- Phone: ${leadInfo.phone}`;
      volatilePrompt += `\nAddress the user by their first name.`;
    }

    const anthropicMessages = messages
      .slice(-20)
      .map((msg: { role: string; content: string }) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

    const streamParams = {
      // Haiku is plenty for a website FAQ/lead bot. The model is pinned
      // server-side, a client-supplied model field is ignored.
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: [
        {
          type: "text" as const,
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" as const },
        },
        { type: "text" as const, text: volatilePrompt },
      ],
      messages: anthropicMessages,
    };

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let emittedAny = false;

        const runWithKey = async (
          apiKey: string,
          label: "primary" | "backup",
        ): Promise<boolean> => {
          try {
            const client = new Anthropic({ apiKey });
            const stream = await client.messages.stream(streamParams);
            for await (const event of stream) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                controller.enqueue(encoder.encode(event.delta.text));
                emittedAny = true;
              }
            }
            return true;
          } catch (error) {
            console.error(`Stream error (${label} key):`, error);
            return false;
          }
        };

        try {
          const ok = await runWithKey(primaryKey, "primary");
          if (!ok && !emittedAny && backupKey) {
            await runWithKey(backupKey, "backup");
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
