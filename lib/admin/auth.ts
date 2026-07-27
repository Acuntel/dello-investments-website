import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

// Shared passcode gate for every /api/admin route. Constant-time compare plus a
// hard attempt limit per IP, because a single shared passcode is the whole
// security boundary on the admin.

export type AuthResult = { ok: true } | { ok: false; response: NextResponse };

function sameSecret(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function requirePasscode(req: Request, passcode: unknown): AuthResult {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // 10 attempts a minute is generous for a person typing and hopeless for a
  // script guessing.
  if (!checkRateLimit(`admin:${ip}`, 10)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 },
      ),
    };
  }

  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "The admin is not switched on for this site yet." },
        { status: 503 },
      ),
    };
  }
  if (typeof passcode !== "string" || !sameSecret(passcode, expected)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "That password is not right." },
        { status: 401 },
      ),
    };
  }
  return { ok: true };
}
