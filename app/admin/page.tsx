"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import AdminEditor, { DRAFT_KEY } from "@/components/admin/AdminEditor";
import { emptyOverrides } from "@/lib/admin/defaults";
import type { Overrides } from "@/lib/admin/types";

const AUTH_KEY = "dello-admin-authed";
const PASS_KEY = "dello-admin-pass";

// Returns a saved draft only when it actually differs from what is live.
function readDraft(live: Overrides): Overrides | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Overrides;
    if (!draft?.seo || !draft?.images || !draft?.business) return null;
    const strip = (o: Overrides) =>
      JSON.stringify([o.seo, o.images, o.business]);
    if (strip(draft) === strip(live)) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [typed, setTyped] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [live, setLive] = useState<Overrides | null>(null);
  const [draft, setDraft] = useState<Overrides | null>(null);
  const [draftDecided, setDraftDecided] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  // Keep a signed-in session across reloads, but only for this tab.
  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === "1") {
      setPasscode(sessionStorage.getItem(PASS_KEY) ?? "");
      setAuthed(true);
    }
  }, []);

  // Whoever opens this page is Karen or Brady, so stop counting this browser
  // in the visitor numbers. "skipgc" is GoatCounter's documented opt-out.
  useEffect(() => {
    try {
      localStorage.setItem("skipgc", "t");
    } catch {
      // private mode: worst case an admin visit gets counted
    }
  }, []);

  // The editor always loads what is LIVE, never the bundled defaults.
  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/content", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("load failed");
        return r.json();
      })
      .then((loaded: Overrides) => {
        setDraft(readDraft(loaded));
        setLive(loaded);
      })
      .catch(() => {
        setLive(emptyOverrides());
        setLoadFailed(true);
      });
  }, [authed]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: typed, verify: true }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "That password is not right.");
        return;
      }
      sessionStorage.setItem(AUTH_KEY, "1");
      sessionStorage.setItem(PASS_KEY, typed);
      setPasscode(typed);
      setAuthed(true);
    } catch {
      setError("Could not reach the website. Check your connection.");
    } finally {
      setChecking(false);
    }
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald px-5">
        <form
          onSubmit={signIn}
          className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lift"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-light">
            <Lock className="h-5 w-5 text-champagne-ink" />
          </span>
          <h1 className="mt-5 font-heading text-2xl text-emerald">
            Dello Investments
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Sign in to manage your website.
          </p>
          <input
            type="password"
            value={typed}
            autoFocus
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className="mt-6 w-full rounded-lg border border-sage bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors duration-200 focus:border-champagne focus:ring-2 focus:ring-champagne/25"
          />
          {error ? (
            <p className="mt-3 text-sm text-champagne-ink">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={checking || !typed}
            className="btn-champagne mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Checking
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    );
  }

  if (!live) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Opening your website...
        </p>
      </div>
    );
  }

  return (
    <>
      {loadFailed ? (
        <div className="bg-champagne/25 px-5 py-3 text-center text-sm text-champagne-ink">
          Your current settings could not be loaded, so this is showing the
          site&apos;s built-in wording. Reload before saving, or you may
          overwrite newer changes.
        </div>
      ) : null}
      <AdminEditor
        passcode={passcode}
        live={live}
        pendingDraft={draftDecided ? null : draft}
        onDraftDecision={() => setDraftDecided(true)}
      />
    </>
  );
}
