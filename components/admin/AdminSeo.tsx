"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/constants";
import { localePrefix, type Locale } from "@/lib/content";
import { PAGES, defaultSeo } from "@/lib/admin/defaults";
import type { Overrides, SeoOverride } from "@/lib/admin/types";
import { Area, Card, Text } from "./fields";
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
    <div className="rounded-xl border border-sage bg-sage-faint p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-champagne-ink">
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

  const set = (pageKey: string, patch: Partial<SeoOverride>) => {
    const key = `${locale}:${pageKey}`;
    const current = overrides.seo[key] ?? { title: "", description: "" };
    onChange({
      ...overrides,
      seo: { ...overrides.seo, [key]: { ...current, ...patch } },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-heading text-xl text-emerald">
          Titles and descriptions
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
          This is the headline and the paragraph underneath it when your site
          shows up on Google, and it is also what appears when someone shares a
          link. Leave a box empty to keep the wording the site was built with.
        </p>
        <div className="mt-6">
          <LocaleTabs value={locale} onChange={setLocale} />
        </div>
      </div>

      {PAGES.map((page) => {
        const fallback = defaultSeo(page.key, locale);
        const over = overrides.seo[`${locale}:${page.key}`];
        const title = over?.title ?? "";
        const description = over?.description ?? "";
        const url = `${SITE_URL}${localePrefix(locale)}${page.path}`;
        return (
          <Card key={page.key} title={page.label} subtitle={url}>
            <Text
              label="Page title"
              value={title}
              max={60}
              placeholder={fallback.title}
              onChange={(v) => set(page.key, { title: v })}
              hint="Put the most important words first. Around 60 characters shows in full."
            />
            <Area
              label="Meta description"
              value={description}
              max={160}
              rows={3}
              placeholder={fallback.description}
              onChange={(v) => set(page.key, { description: v })}
              hint="A sentence or two that makes someone want to click. Around 160 characters shows in full."
            />
            <SearchPreview
              title={title || fallback.title}
              description={description || fallback.description}
              url={url}
            />
          </Card>
        );
      })}
    </div>
  );
}
