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
  locale?: "en" | "es";
  noindex?: boolean;
  /** Languages this page actually exists in. The pages ported off Carrot are
   *  English only, so advertising /es and /pl alternates for them would point
   *  Google at URLs that 404. */
  locales?: Locale[];
  /** Optional social share image, e.g. a blog post's own illustration. */
  image?: string;
}

// What every page actually calls. Reads the title and description Karen last
// saved in /admin and falls back to the wording the site was built with, so a
// page is never left without metadata even if the store is unreachable.
export async function pageMetadata(
  pageKey: string,
  locale: Locale,
  image?: string,
): Promise<Metadata> {
  const overrides = await loadOverrides();
  const { title, description } = resolveSeo(overrides, pageKey, locale);
  const def = PAGES.find((p) => p.key === pageKey);
  return generatePageMetadata({
    title,
    description,
    path: def?.path ?? "",
    locale,
    locales: def?.locales,
    image,
  });
}

export function generatePageMetadata({
  title,
  description,
  path,
  locale = "en",
  noindex,
  locales = ["en", "es"],
  image,
}: PageMetadataParams): Metadata {
  const prefix = locale === "en" ? "" : `/${locale}`;
  // next.config sets trailingSlash:true, so canonicals and hreflang must use the
  // same form or they point at a URL that redirects.
  const withSlash = (p: string) =>
    `${SITE_URL}${p}/`.replace(/([^:])\/{2,}/g, "$1/");
  const url = withSlash(`${prefix}${path}`);
  const multilingual = locales.length > 1;
  const card = image || "/images/og-card.jpg";
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
      ...(multilingual && {
        languages: {
          en: withSlash(path),
          es: withSlash(`/es${path}`),
          "x-default": withSlash(path),
        },
      }),
    },
    ...(noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: locale === "es" ? "es_US" : "en_US",
      images: [
        {
          url: card,
          width: 1200,
          height: 630,
          alt: "Dello Investments, Chicago real estate investors, over the Chicago skyline",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [card],
    },
  };
}
