import { LOCALES, type Locale } from "@/lib/content";
import { DEFAULT_BUSINESS, defaultAlt, defaultSeo } from "./defaults";
import type { BusinessInfo, ImageMeta, Overrides, SeoOverride } from "./types";

// Pure "override if set, otherwise the compiled default" logic, deliberately
// kept out of store.ts: that file imports @vercel/blob, and the header and
// footer are client components. Importing from here keeps the Blob SDK out of
// the browser bundle.

export function resolveSeo(
  o: Overrides,
  pageKey: string,
  locale: Locale,
): SeoOverride {
  const base = defaultSeo(pageKey, locale);
  const over = o.seo[`${locale}:${pageKey}`];
  return {
    title: over?.title?.trim() || base.title,
    description: over?.description?.trim() || base.description,
  };
}

export function resolveImage(
  o: Overrides,
  id: string,
  locale: Locale,
): ImageMeta {
  const over = o.images[id];
  const alt = over?.alt?.[locale]?.trim() || defaultAlt(id, locale);
  const title = over?.title?.trim();
  return { alt, ...(title ? { title } : {}) };
}

// The header and footer work out their own locale from the URL on the client,
// so they are handed all three up front.
export function resolveImageByLocale(
  o: Overrides,
  id: string,
): Record<Locale, ImageMeta> {
  return LOCALES.reduce(
    (acc, locale) => {
      acc[locale] = resolveImage(o, id, locale);
      return acc;
    },
    {} as Record<Locale, ImageMeta>,
  );
}

export function resolveBusiness(o: Overrides): BusinessInfo {
  return { ...DEFAULT_BUSINESS, ...o.business };
}
