import { NextResponse } from "next/server";
import { requirePasscode } from "@/lib/admin/auth";
import { leadCounts } from "@/lib/admin/leads";
import {
  analyticsConfigured,
  countryNames,
  mobileShare,
  rangeStats,
  referrerNames,
  screenSizes,
  topLocations,
  topPages,
  topReferrers,
} from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const SITE_START = Date.UTC(2026, 6, 25);

// POST { passcode } → the numbers behind the admin "Numbers" tab.
//
// Visitor counts and lead counts come from two independent sources, so each
// half degrades on its own: if analytics is not switched on yet the lead
// numbers still show, and vice versa. Nothing here is ever estimated.
export async function POST(req: Request) {
  let body: { passcode?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const auth = requirePasscode(req, body.passcode);
  if (!auth.ok) return auth.response;

  const now = Date.now();
  const windows = [
    { from: now - 7 * DAY, to: now },
    { from: now - 28 * DAY, to: now },
    { from: SITE_START, to: now },
  ];

  let leads = [0, 0, 0];
  try {
    leads = await leadCounts(windows);
  } catch {
    // leave zeros; the tab still renders with a note
  }

  if (!analyticsConfigured()) {
    return NextResponse.json(
      {
        analytics: false,
        leads: { week: leads[0], month: leads[1], allTime: leads[2] },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const [week, month, allTime, pages, refs, countries, sizes] =
      await Promise.all([
        rangeStats(windows[0].from, windows[0].to),
        rangeStats(windows[1].from, windows[1].to),
        rangeStats(windows[2].from, windows[2].to),
        topPages(windows[1].from, windows[1].to),
        topReferrers(windows[1].from, windows[1].to),
        topLocations(windows[1].from, windows[1].to),
        screenSizes(windows[1].from, windows[1].to),
      ]);

    return NextResponse.json(
      {
        analytics: true,
        ranges: {
          week: { ...week, leads: leads[0] },
          month: { ...month, leads: leads[1] },
          allTime: { ...allTime, leads: leads[2] },
        },
        mobileShare: mobileShare(sizes),
        topPages: pages.slice(0, 10),
        referrers: referrerNames(refs).slice(0, 8),
        countries: countryNames(countries).slice(0, 6),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        analytics: true,
        error: "The visitor numbers could not be fetched right now.",
        leads: { week: leads[0], month: leads[1], allTime: leads[2] },
      },
      { status: 502 },
    );
  }
}
