import { NextResponse } from "next/server";
import { requirePasscode } from "@/lib/admin/auth";
import {
  loadOverrides,
  saveOverrides,
  storeConfigured,
} from "@/lib/admin/store";
import type { Overrides } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — the live overrides. Everything in here is already published on the
// public site (titles, alt text, structured data), so it needs no gate; the
// admin reads it to make sure the editor always starts from what is LIVE.
export async function GET() {
  const overrides = await loadOverrides();
  return NextResponse.json(overrides, {
    headers: { "Cache-Control": "no-store" },
  });
}

function isOverrides(x: unknown): x is Overrides {
  const o = x as Overrides;
  return (
    !!o &&
    typeof o === "object" &&
    !!o.seo &&
    typeof o.seo === "object" &&
    !!o.images &&
    typeof o.images === "object" &&
    !!o.business &&
    typeof o.business === "object"
  );
}

// POST — { passcode, verify?, overrides? }
//   verify:true       → just check the password (the sign-in screen)
//   overrides given   → check the password, then publish
export async function POST(req: Request) {
  let body: { passcode?: unknown; verify?: boolean; overrides?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const auth = requirePasscode(req, body.passcode);
  if (!auth.ok) return auth.response;

  if (body.verify) return NextResponse.json({ ok: true });

  if (!isOverrides(body.overrides)) {
    return NextResponse.json(
      { error: "Your changes could not be read. Please try again." },
      { status: 400 },
    );
  }

  // Invalid hand-written JSON-LD must never reach Google. Reject the whole
  // save with a plain-words message rather than quietly dropping the block.
  const extra = body.overrides.business.extraJsonLd?.trim();
  if (extra) {
    try {
      JSON.parse(extra);
    } catch {
      return NextResponse.json(
        {
          error:
            "The extra schema code is not valid JSON, so nothing was saved. Fix it or clear the box, then save again.",
        },
        { status: 400 },
      );
    }
  }

  if (!storeConfigured()) {
    return NextResponse.json(
      {
        error:
          "This site has no storage connected yet, so changes cannot be saved. Ask Brady to finish the setup.",
      },
      { status: 503 },
    );
  }

  try {
    await saveOverrides({ ...body.overrides, version: 1 });
  } catch {
    return NextResponse.json(
      { error: "Could not save to the website. Please try again." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
