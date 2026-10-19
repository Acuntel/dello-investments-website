import { en } from "./en";
import { es } from "./es";
import type { Locale, SiteDict } from "./types";

export type { Locale, SiteDict };

export const DICTS: Record<Locale, SiteDict> = { en, es };

export const LOCALES: Locale[] = ["en", "es"];

export function getDict(locale: Locale): SiteDict {
  return DICTS[locale];
}

// Pages that exist in both languages under unrelated slugs (not /es-prefixed).
// Drives hreflang, the page language and the header language switch.
export const LANGUAGE_PAIRS: { en: string; es: string }[] = [
  {
    en: "/sell-my-house-fast-little-village-chicago",
    es: "/es-vender-casa-rapido-little-village-chicago",
  },
];

const bareOf = (p: string) => p.replace(/\/+$/, "") || "/";

export function detectLocaleFromPath(pathname: string | null): Locale {
  if (!pathname) return "en";
  if (pathname === "/es" || pathname.startsWith("/es/")) return "es";
  if (LANGUAGE_PAIRS.some((p) => p.es === bareOf(pathname))) return "es";
  return "en";
}

// Locale prefix for building hrefs: "" for en, "/es" for es.
export function localePrefix(locale: Locale): string {
  return locale === "en" ? "" : `/${locale}`;
}

// The only routes that exist in every locale. The 75 ported Carrot pages are
// English-only, so mapping their paths into /es produces a 404.
const TRANSLATED_PATHS = new Set(["/", "/contact"]);

// Map the current path to its equivalent in another locale. Keeps you on the
// page you're reading when a translation exists; otherwise sends you to the
// locale home rather than a broken URL.
export function pathInLocale(pathname: string, target: Locale): string {
  const pair = LANGUAGE_PAIRS.find(
    (p) => p.en === bareOf(pathname) || p.es === bareOf(pathname),
  );
  if (pair) return `${pair[target]}/`;
  const bare = pathname.replace(/^\/es(?=\/|$)/, "").replace(/\/+$/, "") || "/";
  const prefix = localePrefix(target);
  if (bare === "/") return prefix || "/";
  if (prefix && !TRANSLATED_PATHS.has(bare)) return prefix;
  return `${prefix}${bare}`;
}
