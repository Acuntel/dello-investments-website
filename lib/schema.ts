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
    image: `${SITE_URL}/images/pages/dello-investments-team-chicago-real-estate.webp`,
    telephone: b.telephone,
    email: b.email,
    foundingDate: b.foundingDate,
    founder: [
      {
        "@type": "Person",
        name: "Karen Rodriguez",
        jobTitle: "Co-Founder & Managing Partner",
      },
      {
        "@type": "Person",
        name: "Alexa Cardello",
        jobTitle: "Co-Founder & Managing Partner",
      },
    ],
    // City and state only. There is no public street address, so street,
    // ZIP and geo are never emitted, even if an older admin save holds them.
    address: {
      "@type": "PostalAddress",
      addressLocality: b.addressLocality,
      addressRegion: b.addressRegion,
      addressCountry: "US",
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
    knowsLanguage: ["en", "es"],
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
    inLanguage: ["en", "es"],
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

// One blog post. The author is Karen with her real credential, which is the
// whole point: it ties the post to a licensed broker Google can verify. The
// publisher points at the LocalBusiness node by @id instead of repeating it.
export function generateBlogPostingSchema(post: {
  url: string;
  headline: string;
  description: string;
  image?: string;
  published?: string;
  updated?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.headline,
    description: post.description,
    url: `${SITE_URL}${post.url}`,
    mainEntityOfPage: `${SITE_URL}${post.url}`,
    ...(post.image && { image: `${SITE_URL}${post.image}` }),
    ...(post.published && { datePublished: post.published }),
    ...(post.updated && { dateModified: post.updated }),
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: "Karen Rodriguez",
      jobTitle: "Co-Founder & Managing Partner",
      url: `${SITE_URL}/about-us/`,
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "license",
        name: "Illinois Real Estate Broker License #475.201055",
      },
    },
    publisher: { "@id": SITE_URL },
  };
}
