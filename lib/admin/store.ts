import { cache } from "react";
import { del, get, list, put } from "@vercel/blob";
import { DEFAULT_BUSINESS, emptyOverrides } from "./defaults";
import type { Overrides } from "./types";

// The pure resolvers live in resolve.ts (no Blob import, safe for client
// components); re-exported here so server code has one obvious place to reach
// for both halves.
export {
  resolveBusiness,
  resolveImage,
  resolveImageByLocale,
  resolveSeo,
} from "./resolve";

// Karen's edits live in ONE JSON blob, so every publish is atomic: the site can
// never show a half-applied state. Reads fall back to the compiled defaults
// whenever the store is empty or unreachable, which also means the site builds
// and deploys fine before the Blob store is ever provisioned.

export const OVERRIDES_PATH = "content/overrides.json";

// Every save snapshots the CURRENT live overrides first. Ed's site lost work
// three times to stale-draft overwrites before this existed; it is cheap
// insurance, so it ships here on day one rather than after the first incident.
const BACKUP_PREFIX = "content/backups/";
const BACKUP_KEEP = 40;

function configured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function isOverrides(x: unknown): x is Overrides {
  const o = x as Overrides;
  return !!o && typeof o === "object" && !!o.seo && !!o.images && !!o.business;
}

// The store is PRIVATE, so reads go through the SDK with the read-write token
// rather than a public URL. useCache:false reads origin storage directly, so a
// publish is visible on the very next request instead of whenever a CDN node
// happens to expire.
async function readLive(): Promise<Overrides | null> {
  if (!configured()) return null;
  try {
    const res = await get(OVERRIDES_PATH, {
      access: "private",
      useCache: false,
    });
    if (!res?.stream) return null;
    const data = await new Response(res.stream).json();
    return isOverrides(data) ? data : null;
  } catch {
    return null;
  }
}

// cache() collapses the many callers within one request (metadata, layout
// schema, each image) into a single blob fetch.
export const loadOverrides = cache(
  async function loadOverrides(): Promise<Overrides> {
    const live = await readLive();
    if (!live) return emptyOverrides();
    // Merge over the defaults so a blob written by an older version of the admin
    // (missing a business field, say) can never produce `undefined` in the JSON-LD.
    return {
      ...emptyOverrides(),
      ...live,
      business: { ...DEFAULT_BUSINESS, ...live.business },
    };
  },
);

async function backupCurrent(): Promise<void> {
  try {
    const current = await readLive();
    if (!current) return;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await put(
      `${BACKUP_PREFIX}overrides-${stamp}.json`,
      JSON.stringify(current),
      {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 0,
      },
    );
    // ISO timestamps sort lexicographically, so newest = highest pathname.
    const { blobs } = await list({ prefix: BACKUP_PREFIX });
    const stale = blobs
      .sort((a, b) => b.pathname.localeCompare(a.pathname))
      .slice(BACKUP_KEEP);
    if (stale.length) await del(stale.map((b) => b.url));
  } catch {
    // Best effort. A failed backup must never block Karen from publishing.
  }
}

export async function saveOverrides(next: Overrides): Promise<void> {
  if (!configured()) throw new Error("blob-not-configured");
  await backupCurrent();
  await put(
    OVERRIDES_PATH,
    JSON.stringify({ ...next, updatedAt: new Date().toISOString() }),
    {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 0,
    },
  );
}

export function storeConfigured(): boolean {
  return configured();
}
