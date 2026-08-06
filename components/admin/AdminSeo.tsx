"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SITE_URL } from "@/lib/constants";
import { localePrefix, type Locale } from "@/lib/content";
import {
  PAGES,
  PAGE_GROUPS,
  defaultSeo,
  type PageDef,
} from "@/lib/admin/defaults";
import type { Overrides, SeoOverride } from "@/lib/admin/types";
import { Area, Text, inputClass } from "./fields";
import LocaleTabs from "./LocaleTabs";

// What a result looks like on Google. Seeing the truncation is worth more than
// any character count, so the preview clips exactly the way search does.
function SearchPreview({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  return (
    <div className="rounded-xl border border-mist bg-mist-faint p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-mist-ink">
        How this looks on Google
      </p>
      <p className="truncate text-xs text-muted">{url}</p>
      <p className="mt-1 truncate text-lg text-[#1a0dab]">
        {title || "No title yet"}
      </p>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
        {description || "No description yet"}
      </p>
    </div>
  );
}

export default function AdminSeo({
  overrides,
  onChange,
}: {
  overrides: Overrides;
  onChange: (next: Overrides) => void;
}) {
  const [locale, setLocale] = useState<Locale>("en");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>("home");

  // Only pages that exist in the language being edited.
  const available = useMemo(
    () => PAGES.filter((p) => p.locales.includes(locale)),
    [locale],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (p) =>
        p.label.toLowerCase().includes(q) || p.hint.toLowerCase().includes(q),
    );
  }, [available, query]);

  const grouped = useMemo(() => {
    const map = new Map<PageDef["group"], PageDef[]>();
    for (const page of matches) {
      const list = map.get(page.group) ?? [];
      list.push(page);
      map.set(page.group, list);
    }
    return PAGE_GROUPS.filter((g) => map.has(g)).map((g) => ({
      group: g,
      pages: map.get(g)!,
    }));
  }, [matches]);

  const page =
    available.find((p) => p.key === selected) ?? matches[0] ?? available[0];

  const set = (patch: Partial<SeoOverride>) => {
    if (!page) return;
    const key = `${locale}:${page.key}`;
    const current = overrides.seo[key] ?? { title: "", description: "" };
    onChange({
      ...overrides,
      seo: { ...overrides.seo, [key]: { ...current, ...patch } },
    });
  };

  const edited = (p: PageDef) => {
    const o = overrides.seo[`${locale}:${p.key}`];
    return !!(o?.title?.trim() || o?.description?.trim());
  };

  const fallback = page
    ? defaultSeo(page.key, locale)
    : { title: "", description: "" };
  const over = page ? overrides.seo[`${locale}:${page.key}`] : undefined;
  const title = over?.title ?? "";
  const description = over?.description ?? "";
  const url = page ? `${SITE_URL}${localePrefix(locale)}${page.path}` : "";

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-heading text-xl text-navy">
          Titles and descriptions
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
          This is the headline and the paragraph underneath it when your site
          shows up on Google, and it is also what appears when someone shares a
          link. Pick a page on the left. Leave a box empty to keep the wording
          the page already has.
        </p>
        <div className="mt-6">
          <LocaleTabs value={locale} onChange={setLocale} />
        </div>
        {locale !== "en" ? (
          <p className="mt-4 text-sm text-muted">
            The home page and the cash-offer form are the two pages written in
            all three languages. Everything else is English only.
          </p>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className={`${inputClass} pl-9`}
              placeholder={`Search ${available.length} pages`}
              value={query}
              aria-label="Search pages"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-2xl bg-white p-2 shadow-card">
            {grouped.length === 0 ? (
              <p className="p-4 text-sm text-muted">
                No pages match &ldquo;{query}&rdquo;.
              </p>
            ) : null}
            {grouped.map(({ group, pages }) => (
              <div key={group} className="mb-2">
                <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-ink">
                  {group}
                </p>
                {pages.map((p) => {
                  const active = page?.key === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setSelected(p.key)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 ${
                        active
                          ? "bg-mist-light font-semibold text-navy"
                          : "text-ink hover:bg-mist-faint"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{p.label}</span>
                      {edited(p) ? (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-mist"
                          title="You have changed this one"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {page ? (
          <section className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
            <h3 className="font-heading text-xl text-navy">{page.label}</h3>
            <p className="mt-1 break-all text-sm text-muted">{url}</p>
            <div className="mt-6 flex flex-col gap-5">
              <Text
                label="Page title"
                value={title}
                max={60}
                placeholder={fallback.title}
                onChange={(v) => set({ title: v })}
                hint="Put the most important words first. Around 60 characters shows in full."
              />
              <Area
                label="Meta description"
                value={description}
                max={160}
                rows={3}
                placeholder={fallback.description}
                onChange={(v) => set({ description: v })}
                hint="A sentence or two that makes someone want to click. Around 160 characters shows in full."
              />
              <SearchPreview
                title={title || fallback.title}
                description={description || fallback.description}
                url={url}
              />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
