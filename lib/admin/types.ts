import type { Locale } from "@/lib/content";

// Everything Karen can change from /admin. This is an OVERRIDE layer, never a
// replacement: an empty/unreachable store means every getter falls back to the
// compiled defaults in lib/admin/defaults.ts, so the live site is byte-identical
// to what it renders today until she actually edits something.

export type LocaleText = Record<Locale, string>;

export interface SeoOverride {
  title: string;
  description: string;
}

// What a section component receives once the override and the compiled default
// have been resolved.
export type ImageMeta = { alt: string; title?: string };

export interface ImageOverride {
  // Per locale: the site is trilingual, so alt text is too.
  alt: Partial<LocaleText>;
  // The tooltip/`title` attribute. One value, it is a proper noun in practice.
  title: string;
}

// The fields that feed the LocalBusiness + RealEstateAgent JSON-LD. Structured
// data is a truth claim to Google, so every field here is one Karen can vouch
// for. Nothing is invented on her behalf.
export interface BusinessInfo {
  name: string;
  description: string;
  telephone: string;
  email: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  foundingDate: string;
  priceRange: string;
  opens: string;
  closes: string;
  ratingValue: string;
  reviewCount: string;
  services: string[];
  credentials: string[];
  sameAs: string[];
  // Escape hatch for schema types the form does not cover (Service, Product,
  // an extra Organization block…). Parsed and validated before it is trusted;
  // invalid JSON is dropped rather than shipped to Google.
  extraJsonLd: string;
}

export interface Overrides {
  version: 1;
  // Key = `${locale}:${pageKey}`, e.g. "en:home", "pl:contact".
  seo: Record<string, SeoOverride>;
  // Key = image id from IMAGES in defaults.ts.
  images: Record<string, ImageOverride>;
  business: BusinessInfo;
  updatedAt: string;
}

export interface Lead {
  id: string;
  at: string;
  source: "form" | "chat";
  name: string;
  phone: string;
  email: string;
  address: string;
  message: string;
}
