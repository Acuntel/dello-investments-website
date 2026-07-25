import { Metadata } from "next";
import { SITE_URL } from "./constants";

interface PageMetadataParams {
  title: string;
  description: string;
  // Locale-less path ("" for home, "/contact", …). hreflang alternates for
  // en/es/pl are derived from it automatically.
  path: string;
  locale?: "en" | "es" | "pl";
  noindex?: boolean;
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
    title,
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
      title: `${title} | Dello Investments`,
      description,
      url,
      type: "website",
      locale: locale === "en" ? "en_US" : locale === "es" ? "es_US" : "pl_PL",
      images: [
        {
          url: "/images/team-alexa-karen.webp",
          width: 1200,
          height: 900,
          alt: "Dello Investments — Alexa and Karen",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Dello Investments`,
      description,
      images: ["/images/team-alexa-karen.webp"],
    },
  };
}
