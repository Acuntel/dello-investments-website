// Daily usage counters backed by Upstash Redis REST — shared across every
// serverless instance, unlike the in-memory limiter. OPTIONAL: when Upstash
// isn't configured these are no-ops and the other layers (origin check,
// per-instance rate limit, Turnstile, max_tokens cap, Anthropic spend cap)
// still bound cost. When configured they add per-session, per-IP, and a
// global daily ceiling that auto-disables the endpoint for the day.
//
// Raw fetch to the Upstash REST API — no npm dependency needed.

function kvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

// INCR a per-day key with a 36h TTL so counters self-clean. Returns the new
// count, or null if KV is unconfigured/unreachable (fail-open on infra error
// — the other defense layers remain).
async function incrDaily(
  cfg: { url: string; token: string },
  suffix: string,
): Promise<number | null> {
  try {
    const key = `dellochat:${today()}:${suffix}`;
    const res = await fetch(`${cfg.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, 129600],
      ]),
    });
    const data = (await res.json()) as Array<{ result?: number }>;
    return typeof data?.[0]?.result === "number" ? data[0].result : null;
  } catch {
    return null;
  }
}

// GLOBAL maps to roughly $5/day on Haiku with prompt caching (~$0.003/msg).
export const PER_SESSION_DAILY = 25;
export const PER_IP_DAILY = 40;
export const GLOBAL_DAILY = 1500;

export type LimitCheck =
  { ok: true } | { ok: false; reason: "user" | "global" };

export async function checkAndCountDaily(
  sessionId: string,
  ip: string,
): Promise<LimitCheck> {
  const cfg = kvConfig();
  if (!cfg) return { ok: true }; // counters disabled; other layers protect

  const [g, s, i] = await Promise.all([
    incrDaily(cfg, "global"),
    incrDaily(cfg, `sess:${sessionId}`),
    incrDaily(cfg, `ip:${ip}`),
  ]);
  if (g !== null && g > GLOBAL_DAILY) return { ok: false, reason: "global" };
  if (s !== null && s > PER_SESSION_DAILY) return { ok: false, reason: "user" };
  if (i !== null && i > PER_IP_DAILY) return { ok: false, reason: "user" };
  return { ok: true };
}
