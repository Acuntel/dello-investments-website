// Sliding-window limiter, per serverless instance. Fast first line of
// defense; the cross-instance guarantee comes from lib/usage-limit.ts
// (Upstash). Stale keys are swept on write so the Map can't grow unbounded.
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const MAX_KEYS = 5000;

function sweep(now: number) {
  if (rateLimit.size < MAX_KEYS) return;
  for (const [key, record] of rateLimit) {
    if (now > record.resetTime) rateLimit.delete(key);
  }
}

export function checkRateLimit(
  ip: string,
  limit: number = 10,
  windowMs: number = 60000,
): boolean {
  const now = Date.now();
  sweep(now);
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;
  record.count++;
  return true;
}
