import { en } from "./en";
import { es } from "./es";
import { pl } from "./pl";
import type { Locale, SiteDict } from "./types";

export type { Locale, SiteDict };

export const DICTS: Record<Locale, SiteDict> = { en, es, pl };

export const LOCALES: Locale[] = ["en", "es", "pl"];

export function getDict(locale: Locale): SiteDict {
  return DICTS[locale];
}

export function detectLocaleFromPath(pathname: string | null): Locale {
  if (!pathname) return "en";
  if (pathname === "/es" || pathname.startsWith("/es/")) return "es";
  if (pathname === "/pl" || pathname.startsWith("/pl/")) return "pl";
  return "en";
}

// Locale prefix for building hrefs: "" for en, "/es" for es, "/pl" for pl.
export function localePrefix(locale: Locale): string {
  return locale === "en" ? "" : `/${locale}`;
}

// Map the current path to its equivalent in another locale, so the language
// switcher keeps you on the page you're reading instead of dumping you at
// the locale home.
export function pathInLocale(pathname: string, target: Locale): string {
  const bare =
    pathname.replace(/^\/(es|pl)(?=\/|$)/, "").replace(/\/+$/, "") || "/";
  const prefix = localePrefix(target);
  if (bare === "/") return prefix || "/";
  return `${prefix}${bare}`;
}
