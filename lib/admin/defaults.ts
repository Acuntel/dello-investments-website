import { getDict, type Locale } from "@/lib/content";
import type { SiteDict } from "@/lib/content/types";
import { CONTACT, CREDENTIALS, SOCIAL } from "@/lib/constants";
import type { BusinessInfo, Overrides, SeoOverride } from "./types";

// The compiled defaults every override falls back to. Editing a field in
// /admin only ever shadows one of these; deleting the override (clearing the
// field) restores it. That is why the site can never end up blank.

export interface PageDef {
  key: string;
  // Locale-less path, "" = home. Matches generatePageMetadata's `path`.
  path: string;
  label: string;
  hint: string;
}

export const PAGES: PageDef[] = [
  {
    key: "home",
    path: "",
    label: "Home page",
    hint: "delloinvestments.com",
  },
  {
    key: "contact",
    path: "/contact",
    label: "Get a cash offer",
    hint: "delloinvestments.com/contact",
  },
];

// The titles and descriptions the site ships with, lifted verbatim out of the
// page files so there is exactly one source of truth.
const DEFAULT_SEO: Record<string, SeoOverride> = {
  "en:home": {
    title:
      "We Buy Houses Chicago for Cash | Offer in 24 Hours | Dello Investments",
    description:
      "Woman-owned Chicago cash home buyer. Fair offers in 24 hours, close in 7-14 days. Any condition, all 77 neighborhoods. No repairs, no commissions, no closing costs.",
  },
  "es:home": {
    title:
      "Compramos Casas en Chicago al Contado | Oferta en 24 Horas | Dello Investments",
    description:
      "Compradores de casas en Chicago, empresa de mujeres. Ofertas justas en 24 horas, cierre en 7-14 días. Cualquier condición, los 77 vecindarios. Sin reparaciones, sin comisiones, sin costos de cierre.",
  },
  "pl:home": {
    title:
      "Skup Domów w Chicago za Gotówkę | Oferta w 24 Godziny | Dello Investments",
    description:
      "Skup domów w Chicago, firma prowadzona przez kobiety. Uczciwe oferty w 24 godziny, finalizacja w 7-14 dni. Każdy stan, wszystkie 77 dzielnic. Bez remontów, bez prowizji, bez kosztów zamknięcia.",
  },
  "en:contact": {
    title: "Get Your Free Cash Offer | Dello Investments",
    description:
      "Tell us about your Chicago property and get a fair, written cash offer within 24 hours. Call or text (312) 975-5557, open 7 days a week.",
  },
  "es:contact": {
    title: "Obtenga Su Oferta Gratis en Efectivo | Dello Investments",
    description:
      "Cuéntenos sobre su propiedad en Chicago y reciba una oferta justa por escrito en 24 horas. Llame o envíe texto al (312) 975-5557, abierto los 7 días.",
  },
  "pl:contact": {
    title: "Otrzymaj Bezpłatną Ofertę Gotówkową | Dello Investments",
    description:
      "Opowiedz nam o swojej nieruchomości w Chicago i otrzymaj uczciwą, pisemną ofertę w 24 godziny. Zadzwoń lub napisz: (312) 975-5557, otwarte 7 dni w tygodniu.",
  },
};

export function defaultSeo(pageKey: string, locale: Locale): SeoOverride {
  return DEFAULT_SEO[`${locale}:${pageKey}`] ?? { title: "", description: "" };
}

export interface ImageDef {
  id: string;
  src: string;
  label: string;
  where: string;
  // Purely decorative images ship with alt="" on purpose: a screen reader
  // should skip them. Karen can still give them alt text if she wants the
  // extra keyword surface, so this is a note in the UI, not a lock.
  decorative?: boolean;
  // White artwork on transparency: needs a dark tile behind it in the admin or
  // it looks like a missing image.
  onDark?: boolean;
  defaultAlt: (t: SiteDict) => string;
}

export const IMAGES: ImageDef[] = [
  {
    id: "hero",
    src: "/images/hero-home.webp",
    label: "Hero photograph",
    where: "Home page, behind the headline",
    decorative: true,
    defaultAlt: () => "",
  },
  {
    id: "team",
    src: "/images/team-alexa-karen.webp",
    label: "Karen and Alexa",
    where: "Home page, Our story",
    defaultAlt: (t) => t.story.imageAlt,
  },
  {
    id: "neighborhoods",
    src: "/images/neighborhoods.webp",
    label: "Neighborhoods photograph",
    where: "Home page, Where we buy",
    defaultAlt: (t) => t.neighborhoods.imageAlt,
  },
  {
    id: "why",
    src: "/images/home-sell.webp",
    label: "House photograph",
    where: "Home page, Why sell to us",
    decorative: true,
    defaultAlt: () => "",
  },
  {
    id: "badge-wbe",
    src: "/images/badge-wbe.webp",
    label: "WBE certification badge",
    where: "Home page, trust bar",
    defaultAlt: (t) => t.certs.items[0]?.alt ?? "",
  },
  {
    id: "badge-vbe",
    src: "/images/badge-vbe.webp",
    label: "VBE certification badge",
    where: "Home page, trust bar",
    defaultAlt: (t) => t.certs.items[1]?.alt ?? "",
  },
  {
    id: "badge-bepd",
    src: "/images/badge-bepd.webp",
    label: "BEPD certification badge",
    where: "Home page, trust bar",
    defaultAlt: (t) => t.certs.items[2]?.alt ?? "",
  },
  {
    id: "logo",
    src: "/images/logo-white.png",
    label: "Logo",
    where: "Top and bottom of every page",
    onDark: true,
    defaultAlt: () => "Dello Investments",
  },
];

// Maps a certs[] index to its image id, so StatsBar can look each badge up.
export const CERT_IMAGE_IDS = ["badge-wbe", "badge-vbe", "badge-bepd"];

export function defaultAlt(id: string, locale: Locale): string {
  const def = IMAGES.find((i) => i.id === id);
  return def ? def.defaultAlt(getDict(locale)) : "";
}

// The JSON-LD figures the site ships with. All verified: Google rating 5.0
// across 4 reviews, founded 2021, licences from delloinvestments.com.
export const DEFAULT_BUSINESS: BusinessInfo = {
  name: "Dello Investments",
  description:
    "Woman-owned, veteran-owned cash home buyer serving all 77 Chicago neighborhoods and Cook County suburbs. Fair cash offers in 24 hours, closings in as little as 7 days, any condition, no repairs, no commissions, no closing costs.",
  telephone: "+13129755557",
  email: CONTACT.email,
  streetAddress: "1651 S Drake Ave G",
  addressLocality: "Chicago",
  addressRegion: "IL",
  postalCode: "60623",
  latitude: "41.8586",
  longitude: "-87.7133",
  foundingDate: String(CREDENTIALS.founded),
  priceRange: "$$",
  opens: "09:00",
  closes: "17:00",
  ratingValue: "5.0",
  reviewCount: "4",
  services: [
    "As-is cash home purchase",
    "Inherited & probate property purchase",
    "Pre-foreclosure home purchase",
    "Vacant & damaged property purchase",
    "Multi-unit & rental building purchase",
    "Code violation & lien resolution at closing",
  ],
  credentials: [
    "Illinois Real Estate Broker License",
    `City of Chicago General Contractor License #${CREDENTIALS.gcLicense}`,
    "City of Chicago Woman-Owned Business Enterprise (WBE)",
    "City of Chicago Veteran-Owned Business Enterprise (VBE)",
    "City of Chicago Business Enterprise owned by People with Disabilities (BEPD)",
  ],
  sameAs: [SOCIAL.facebook, SOCIAL.instagram, SOCIAL.youtube],
  extraJsonLd: "",
};

export function emptyOverrides(): Overrides {
  return {
    version: 1,
    seo: {},
    images: {},
    business: { ...DEFAULT_BUSINESS },
    updatedAt: "",
  };
}
