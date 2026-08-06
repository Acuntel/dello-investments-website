"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Check,
  ImageIcon,
  Inbox,
  Loader2,
  Search,
  Code2,
} from "lucide-react";
import type { Overrides } from "@/lib/admin/types";
import AdminImages from "./AdminImages";
import AdminLeads from "./AdminLeads";
import AdminSchema from "./AdminSchema";
import AdminSeo from "./AdminSeo";
import AdminStats from "./AdminStats";

export const DRAFT_KEY = "dello-admin-draft";

const TABS = [
  { id: "numbers", label: "Numbers", icon: BarChart3 },
  { id: "seo", label: "Search wording", icon: Search },
  { id: "images", label: "Photographs", icon: ImageIcon },
  { id: "schema", label: "Business details", icon: Code2 },
  { id: "leads", label: "Enquiries", icon: Inbox },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminEditor({
  passcode,
  live,
  pendingDraft,
  onDraftDecision,
}: {
  passcode: string;
  live: Overrides;
  pendingDraft: Overrides | null;
  onDraftDecision: (restore: boolean) => void;
}) {
  const [tab, setTab] = useState<TabId>("numbers");
  const [overrides, setOverrides] = useState<Overrides>(live);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    tone: "ok" | "bad";
    text: string;
  } | null>(null);

  // A detected draft is only ever an OFFER. The editor always starts from what
  // is live, so an old draft left in this browser can never be republished over
  // the site by someone who just wanted to change one word.
  const decided = pendingDraft === null;

  useEffect(() => {
    if (!decided || !dirty) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(overrides));
    } catch {
      // private browsing: the publish button still works, drafts just don't keep
    }
  }, [overrides, dirty, decided]);

  const update = useCallback((next: Overrides) => {
    setOverrides(next);
    setDirty(true);
    setNotice(null);
  }, []);

  const restore = (draft: Overrides) => {
    setOverrides(draft);
    setDirty(true);
    onDraftDecision(true);
  };

  const discard = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* nothing to clean up */
    }
    onDraftDecision(false);
  };

  const publish = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, overrides }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setNotice({
          tone: "bad",
          text: data.error ?? "Your changes could not be saved.",
        });
        return;
      }
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* nothing to clean up */
      }
      setDirty(false);
      setNotice({ tone: "ok", text: "Saved. Your website is updated." });
    } catch {
      setNotice({
        tone: "bad",
        text: "Could not reach the website. Check your connection and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const editing = tab === "seo" || tab === "images" || tab === "schema";

  return (
    <div className="min-h-screen bg-cream pb-24">
      <header className="sticky top-0 z-20 border-b border-mist bg-cream/95 backdrop-blur">
        <div className="container-custom flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <p className="font-heading text-xl text-navy">
              Dello Investments
            </p>
            <p className="text-xs uppercase tracking-[0.16em] text-mist-ink">
              Website manager
            </p>
          </div>
          <div className="flex items-center gap-4">
            {dirty ? (
              <span className="text-sm font-semibold text-mist-ink">
                Not saved yet
              </span>
            ) : null}
            <button
              type="button"
              onClick={publish}
              disabled={saving || !dirty}
              className="btn-mist !px-7 !py-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving
                </>
              ) : (
                "Save to my website"
              )}
            </button>
          </div>
        </div>

        <div className="container-custom flex gap-6 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors duration-200 ${
                  active
                    ? "border-mist text-navy"
                    : "border-transparent text-muted hover:text-navy"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="container-custom pt-8">
        {pendingDraft ? (
          <div className="mb-8 rounded-2xl border border-mist bg-white p-6 shadow-card">
            <h2 className="font-heading text-lg text-navy">
              You have changes from last time that were never saved
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Right now you are looking at what is live on your website. Do you
              want those older changes brought back so you can carry on?
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => restore(pendingDraft)}
                className="btn-navy !px-6 !py-3"
              >
                Bring them back
              </button>
              <button
                type="button"
                onClick={discard}
                className="rounded-full border border-mist px-6 py-3 text-sm font-semibold text-muted transition-colors duration-200 hover:border-mist hover:text-mist-ink"
              >
                Throw them away
              </button>
            </div>
          </div>
        ) : null}

        {notice ? (
          <div
            className={`mb-8 flex items-start gap-2.5 rounded-xl p-4 text-sm ${
              notice.tone === "ok"
                ? "bg-mist-light text-navy"
                : "bg-mist/20 text-mist-ink"
            }`}
          >
            {notice.tone === "ok" ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
            ) : null}
            <span className="leading-relaxed">{notice.text}</span>
          </div>
        ) : null}

        {tab === "numbers" ? <AdminStats passcode={passcode} /> : null}
        {tab === "leads" ? <AdminLeads passcode={passcode} /> : null}
        {tab === "seo" ? (
          <AdminSeo overrides={overrides} onChange={update} />
        ) : null}
        {tab === "images" ? (
          <AdminImages overrides={overrides} onChange={update} />
        ) : null}
        {tab === "schema" ? (
          <AdminSchema overrides={overrides} onChange={update} />
        ) : null}

        {editing ? (
          <p className="mt-10 max-w-2xl text-xs leading-relaxed text-muted">
            Nothing changes on your website until you press{" "}
            <strong className="font-semibold text-ink">
              Save to my website
            </strong>
            . Each save keeps a copy of what was there before, so anything can
            be put back.
          </p>
        ) : null}
      </main>
    </div>
  );
}
