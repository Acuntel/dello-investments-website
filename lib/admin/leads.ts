import { get, list, put } from "@vercel/blob";
import type { Lead } from "./types";

// Every enquiry is written as its OWN blob rather than appended to a shared
// array. Two people submitting the form in the same second would race a
// read-modify-write and one lead would vanish; separate keys cannot race.
//
// The timestamp lives in the pathname, so counting leads for the dashboard is
// a single list() with no downloads at all. Only the Leads tab fetches bodies.
//
// These blobs hold a seller's name, phone number and home address, so the store
// is PRIVATE and every read is authenticated with the read-write token. Nothing
// here is ever reachable from a public URL.
const LEAD_PREFIX = "leads/";

function configured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function key(at: Date, source: Lead["source"], id: string): string {
  const stamp = at.toISOString().replace(/[:.]/g, "-");
  return `${LEAD_PREFIX}${stamp}__${source}__${id}.json`;
}

function parseAt(pathname: string): number {
  const raw = pathname.slice(LEAD_PREFIX.length).split("__")[0] ?? "";
  // "2026-07-27T14-05-09-123Z" back to a parseable ISO string.
  const iso = raw.replace(
    /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/,
    "$1T$2:$3:$4.$5Z",
  );
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? 0 : ms;
}

const clip = (v: unknown, max: number): string =>
  typeof v === "string" ? v.slice(0, max) : "";

// Records an enquiry. Best effort by design: this runs inside the contact and
// chat routes, and a storage hiccup must never turn into a failed submission
// for someone trying to sell their house.
export async function recordLead(
  input: Partial<Lead> & { source: Lead["source"] },
): Promise<void> {
  if (!configured()) return;
  try {
    const at = new Date();
    const id = Math.random().toString(36).slice(2, 8);
    const lead: Lead = {
      id,
      at: at.toISOString(),
      source: input.source,
      name: clip(input.name, 200),
      phone: clip(input.phone, 50),
      email: clip(input.email, 200),
      address: clip(input.address, 300),
      message: clip(input.message, 5000),
    };
    await put(key(at, input.source, id), JSON.stringify(lead), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 0,
    });
  } catch {
    // swallow: a lost dashboard row is survivable, a 500 on the form is not
  }
}

async function allLeadBlobs(): Promise<{ pathname: string; at: number }[]> {
  if (!configured()) return [];
  const { blobs } = await list({ prefix: LEAD_PREFIX });
  return blobs
    .map((b) => ({ pathname: b.pathname, at: parseAt(b.pathname) }))
    .sort((a, b) => b.at - a.at);
}

// Counts only, from pathnames. No blob bodies are downloaded.
export async function leadCounts(
  windows: { from: number; to: number }[],
): Promise<number[]> {
  const blobs = await allLeadBlobs();
  return windows.map(
    (w) => blobs.filter((b) => b.at >= w.from && b.at <= w.to).length,
  );
}

export async function recentLeads(limit = 50): Promise<Lead[]> {
  const blobs = await allLeadBlobs();
  const picked = blobs.slice(0, limit);
  const rows = await Promise.all(
    picked.map(async (b) => {
      try {
        const res = await get(b.pathname, { access: "private" });
        if (!res?.stream) return null;
        return (await new Response(res.stream).json()) as Lead;
      } catch {
        return null;
      }
    }),
  );
  return rows.filter((r): r is Lead => !!r);
}
