import crypto from "crypto";

// Short-lived signed session token. A visitor solves Turnstile once,
// exchanges it for one of these, and reuses it for the rest of the chat.
// A scripted attacker cannot forge one without CHAT_SESSION_SECRET and
// cannot obtain one without solving Turnstile, so the per-session message
// cap actually holds. The token carries a stable id used to key the
// per-session daily counter.

const TTL_MS = 60 * 60 * 1000; // 1 hour

function secret(): string {
  return process.env.CHAT_SESSION_SECRET || "";
}

export function mintSessionToken(): { token: string; id: string } | null {
  const s = secret();
  if (!s) return null;
  const id = crypto.randomBytes(12).toString("hex");
  const exp = Date.now() + TTL_MS;
  const payload = `${id}.${exp}`;
  const sig = crypto.createHmac("sha256", s).update(payload).digest("hex");
  return { token: `${payload}.${sig}`, id };
}

export function verifySessionToken(
  token: string | undefined,
): { id: string } | null {
  const s = secret();
  if (!s || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, expStr, sig] = parts;
  const payload = `${id}.${expStr}`;
  const expected = crypto.createHmac("sha256", s).update(payload).digest("hex");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
    return null;
  if (Date.now() > Number(expStr)) return null;
  return { id };
}
