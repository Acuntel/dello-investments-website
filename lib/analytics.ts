// Server-side client for the GoatCounter stats API (token auth, cookieless,
// no consent banner needed). Powers the admin "Numbers" tab. Stays completely
// dormant until GC_SITE + GC_TOKEN are set, so nothing breaks before the
// analytics account exists.
//
// GoatCounter has no per-person tracking: "visits" are short-lived sessions and
// "views" are pageviews. That is the honest vocabulary the dashboard uses.

export type RangeStats = { visits: number; views: number };
export type NamedCount = { name: string; count: number };

export function analyticsConfigured(): boolean {
  return !!(process.env.GC_SITE && process.env.GC_TOKEN);
}

// GoatCounter rejects ranges that start before the site was created ("before
// the site's creation"), so every request is clamped to this floor.
const SINCE = Date.parse(process.env.GC_SINCE || "2026-07-27T00:00:00Z");

// start/end are DATETIMES. A bare date parses as midnight, which silently
// excludes the whole current day (the dashboard shows 7 visits, the API
// returns 0). Always send a full RFC3339 timestamp.
function ts(ms: number): string {
  const clamped = Math.min(Math.max(ms, SINCE), Date.now());
  return new Date(clamped).toISOString().slice(0, 19) + "Z";
}

// The API rate-limits bursts of ~4-5 requests with 429s, and one dashboard load
// fans out to a dozen queries. Everything goes through a paced serial queue
// with a retry, and identical queries within 30s are memoised.
const memo = new Map<string, { at: number; data: unknown }>();
let queue: Promise<unknown> = Promise.resolve();
let lastCallAt = 0;
const GAP_MS = 550;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPaced(url: string): Promise<unknown> {
  for (let attempt = 0; ; attempt++) {
    const wait = lastCallAt + GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastCallAt = Date.now();
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.GC_TOKEN}` },
      cache: "no-store",
    });
    if (res.status === 429 && attempt < 3) {
      await sleep(1200);
      continue;
    }
    if (!res.ok) throw new Error(`goatcounter ${res.status} for ${url}`);
    return res.json();
  }
}

async function get(
  path: string,
  params: Record<string, string | number>,
): Promise<unknown> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  );
  const url = `https://${process.env.GC_SITE}.goatcounter.com/api/v0/${path}?${qs}`;
  const hit = memo.get(url);
  if (hit && Date.now() - hit.at < 30_000) return hit.data;
  const run = queue.then(() => fetchPaced(url));
  queue = run.catch(() => undefined);
  const data = await run;
  memo.set(url, { at: Date.now(), data });
  return data;
}

type HitRow = { path: string; count: number; event?: boolean };

async function hitRows(from: number, to: number): Promise<HitRow[]> {
  const r = (await get("stats/hits", {
    start: ts(from),
    end: ts(to),
    limit: 100,
  })) as { hits?: HitRow[] };
  return (r.hits ?? []).filter((h) => !h.event);
}

export async function rangeStats(
  from: number,
  to: number,
): Promise<RangeStats> {
  const [totals, hits] = await Promise.all([
    get("stats/total", { start: ts(from), end: ts(to) }) as Promise<{
      total?: number;
    }>,
    hitRows(from, to),
  ]);
  // stats/total.total = pageviews; the per-path hit counts sum to visits.
  return {
    visits: hits.reduce((n, h) => n + (h.count ?? 0), 0),
    views: Number(totals.total ?? 0),
  };
}

async function statList(
  path: string,
  from: number,
  to: number,
): Promise<NamedCount[]> {
  const r = (await get(path, { start: ts(from), end: ts(to) })) as {
    stats?: { name: string; count: number }[];
  };
  return (r.stats ?? []).map((s) => ({
    name: s.name,
    count: Number(s.count ?? 0),
  }));
}

export const topReferrers = (from: number, to: number) =>
  statList("stats/toprefs", from, to);
export const topLocations = (from: number, to: number) =>
  statList("stats/locations", from, to);
export const screenSizes = (from: number, to: number) =>
  statList("stats/sizes", from, to);

// Collapse raw paths into names Karen recognises, and drop admin/API traffic so
// her numbers only ever describe the public site.
export async function topPages(
  from: number,
  to: number,
): Promise<NamedCount[]> {
  const LABELS: Record<string, string> = {
    "": "Home page (English)",
    es: "Home page (Spanish)",
    pl: "Home page (Polish)",
    contact: "Cash offer form (English)",
    "es/contact": "Cash offer form (Spanish)",
    "pl/contact": "Cash offer form (Polish)",
  };
  const rows = await hitRows(from, to);
  const out = new Map<string, number>();
  for (const row of rows) {
    const path = row.path.split("?")[0].replace(/^\/+|\/+$/g, "");
    if (/^(admin|api|_)/.test(path)) continue;
    const label = LABELS[path] ?? `/${path}`;
    out.set(label, (out.get(label) ?? 0) + (row.count ?? 0));
  }
  return Array.from(out.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// GoatCounter buckets screen widths rather than sniffing user agents. Its
// "Phones" and "Large phones, small tablets" buckets are the mobile share, and
// that is what Karen's old Carrot dashboard called "Mobile Usage".
export function mobileShare(sizes: NamedCount[]): number | null {
  const known = sizes.filter((s) => !/unknown/i.test(s.name));
  const total = known.reduce((n, s) => n + s.count, 0);
  if (!total) return null;
  const mobile = known
    .filter((s) => /phone/i.test(s.name))
    .reduce((n, s) => n + s.count, 0);
  return Math.round((mobile / total) * 1000) / 10;
}

// Locations come back as full names ("United States"); this catches the odd row
// that is still a bare region code.
export function countryNames(rows: NamedCount[]): NamedCount[] {
  const dn = new Intl.DisplayNames(["en"], { type: "region" });
  return rows.map((r) => {
    let name = r.name;
    if (/^[A-Z]{2}$/.test(name)) {
      try {
        name = dn.of(name) ?? name;
      } catch {
        // keep the raw code
      }
    }
    return { name, count: r.count };
  });
}

// GoatCounter reports an empty referrer for direct traffic.
export function referrerNames(rows: NamedCount[]): NamedCount[] {
  return rows.map((r) => ({
    name: r.name?.trim() ? r.name : "Direct (typed or bookmarked)",
    count: r.count,
  }));
}
