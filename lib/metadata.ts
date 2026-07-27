import { Metadata } from "next";
import { SITE_URL } from "./constants";
import type { Locale } from "./content";
import { PAGES } from "./admin/defaults";
import { loadOverrides, resolveSeo } from "./admin/store";

interface PageMetadataParams {
  title: string;
  description: string;
  // Locale-less path ("" for home, "/contact", …). hreflang alternates for
  // en/es/pl are derived from it automatically.
  path: string;
  locale?: "en" | "es" | "pl";
  noindex?: boolean;
}

// What every page actually calls. Reads the title and description Karen last
// saved in /admin and falls back to the wording the site was built with, so a
// page is never left without metadata even if the store is unreachable.
export async function pageMetadata(
  pageKey: string,
  locale: Locale,
): Promise<Metadata> {
  const overrides = await loadOverrides();
  const { title, description } = resolveSeo(overrides, pageKey, locale);
  const path = PAGES.find((p) => p.key === pageKey)?.path ?? "";
  return generatePageMetadata({ title, description, path, locale });
}

export function generatePageMetadata({
  title,
  description,
  path,
  locale = "en",
  noindex,
}: PageMetadataParams): Metadata {
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}${path}` || SITE_URL;
  return {
    // absolute skips the root layout's "%s | Dello Investments" template. That
    // template applies to child segments only, so /es and /pl (whose titles
    // already end in the brand) came out as "... | Dello Investments | Dello
    // Investments" while / did not. Now the title field is exactly what shows,
    // which is also the only sane contract for an editor with a live preview.
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}${path}` || SITE_URL,
        es: `${SITE_URL}/es${path}`,
        pl: `${SITE_URL}/pl${path}`,
        "x-default": `${SITE_URL}${path}` || SITE_URL,
      },
    },
    ...(noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: locale === "en" ? "en_US" : locale === "es" ? "es_US" : "pl_PL",
      images: [
        {
          url: "/images/og-card.jpg",
          width: 1200,
          height: 630,
          alt: "Dello Investments, we buy houses Chicago for cash",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-card.jpg"],
    },
  };
}
