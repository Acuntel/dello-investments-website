import { SITE_URL } from "./constants";
import type { BusinessInfo } from "./admin/types";

// JSON-LD builders. Inject with:
//   <script type="application/ld+json"
//     dangerouslySetInnerHTML={{ __html: JSON.stringify(builder()) }} />
// The business facts now come from lib/admin (defaults, overridden by what
// Karen saves in /admin). Never inflate structured data: every figure must be
// one she can back up.

export function generateLocalBusinessSchema(b: BusinessInfo) {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "RealEstateAgent"],
    "@id": SITE_URL,
    name: b.name,
    description: b.description,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/team-alexa-karen.webp`,
    telephone: b.telephone,
    email: b.email,
    foundingDate: b.foundingDate,
    founder: [
      {
        "@type": "Person",
        name: "Karen Rodriguez",
        jobTitle: "Co-Founder & Managing Partner",
      },
      { "@type": "Person", name: "Alexa", jobTitle: "Co-Founder" },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: b.streetAddress,
      addressLocality: b.addressLocality,
      addressRegion: b.addressRegion,
      postalCode: b.postalCode,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: Number(b.latitude),
      longitude: Number(b.longitude),
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: b.opens,
      closes: b.closes,
    },
    // Omitted entirely rather than shipped as zero: a rating of 0 reviews is a
    // false claim, and Google penalises invented review markup.
    ...(Number(b.reviewCount) > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: b.ratingValue,
        reviewCount: b.reviewCount,
      },
    }),
    priceRange: b.priceRange,
    knowsLanguage: ["en", "es", "pl"],
    areaServed: [
      { "@type": "City", name: "Chicago" },
      { "@type": "AdministrativeArea", name: "Cook County" },
      {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: 41.8781,
          longitude: -87.6298,
        },
        geoRadius: "40000",
      },
    ],
    hasCredential: b.credentials
      .filter((name) => name.trim())
      .map((name) => ({
        "@type": "EducationalOccupationalCredential",
        credentialCategory: /certifi|enterprise|\(WBE\)|\(VBE\)|\(BEPD\)/i.test(
          name,
        )
          ? "certification"
          : "license",
        name,
      })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Home Buying Services",
      itemListElement: b.services
        .filter((name) => name.trim())
        .map((name) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name },
        })),
    },
    sameAs: b.sameAs.filter((url) => url.trim()),
  };
}

// Karen's free-form JSON-LD from the admin. Already validated on save, but
// re-checked here so a hand-edited blob can never break a page render.
export function parseExtraJsonLd(raw: string): unknown[] {
  const text = raw?.trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dello Investments",
    url: SITE_URL,
    inLanguage: ["en", "es", "pl"],
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url?: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url && { item: `${SITE_URL}${item.url}` }),
    })),
  };
}

export function generateFAQSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}
