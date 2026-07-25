import { SITE_URL } from "./constants";

// JSON-LD builders. Inject with:
//   <script type="application/ld+json"
//     dangerouslySetInnerHTML={{ __html: JSON.stringify(builder()) }} />
// All figures here are real (Google 5.0 across 4 reviews, founded 2021,
// licenses from delloinvestments.com), never inflate structured data.

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "RealEstateAgent"],
    "@id": SITE_URL,
    name: "Dello Investments",
    description:
      "Woman-owned, veteran-owned cash home buyer serving all 77 Chicago neighborhoods and Cook County suburbs. Fair cash offers in 24 hours, closings in as little as 7 days, any condition, no repairs, no commissions, no closing costs.",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/team-alexa-karen.webp`,
    telephone: "+13129755557",
    email: "connect@delloinvestments.com",
    foundingDate: "2021",
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
      streetAddress: "1651 S Drake Ave G",
      addressLocality: "Chicago",
      addressRegion: "IL",
      postalCode: "60623",
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: 41.8586, longitude: -87.7133 },
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
      opens: "09:00",
      closes: "17:00",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "4",
    },
    priceRange: "$$",
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
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "license",
        name: "Illinois Real Estate Broker License",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "license",
        name: "City of Chicago General Contractor License #TGC137744",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certification",
        name: "City of Chicago Woman-Owned Business Enterprise (WBE)",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certification",
        name: "City of Chicago Veteran-Owned Business Enterprise (VBE)",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certification",
        name: "City of Chicago Business Enterprise owned by People with Disabilities (BEPD)",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Home Buying Services",
      itemListElement: [
        "As-is cash home purchase",
        "Inherited & probate property purchase",
        "Pre-foreclosure home purchase",
        "Vacant & damaged property purchase",
        "Multi-unit & rental building purchase",
        "Code violation & lien resolution at closing",
      ].map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name },
      })),
    },
    sameAs: [
      "https://www.facebook.com/DelloInvestments/",
      "https://www.instagram.com/delloinvestments",
      "https://www.youtube.com/@delloinvestments",
    ],
  };
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
