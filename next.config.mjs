/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Karen's Carrot URLs are all trailing-slash form and that is exactly what
  // Google has indexed for all 77 pages. Matching them means the cutover serves
  // her existing URLs with a 200 instead of a 308 hop each.
  trailingSlash: true,
  // Slugs Karen's own pages linked to that no longer exist on her site. The
  // internal links are fixed in the content, but anything out in the wild
  // pointing at these lands somewhere useful instead of a 404.
  async redirects() {
    const map = {
      "/pl": "/",
      "/pl/contact": "/contact/",
      "/reviews": "/",
      "/we-buy-houses-chicago": "/cash-home-buyers-chicago/",
      "/sell-my-house-fast-roseland": "/sell-my-house-fast-roseland-chicago/",
      "/we-buy-houses-north-lawndale": "/sell-my-house-fast-north-lawndale-chicago/",
      "/sell-my-house-fast-north-lawdale-chicago": "/sell-my-house-fast-north-lawndale-chicago/",
      "/sell-house-fast-chicago": "/sell-my-house-fast-chicago/",
      "/how-we-buy-houses": "/how-it-works/",
      "/contact-us": "/contact/",
      "/we-buy-houses-in-humboldt-park": "/sell-my-house-fast-humboldt-park-chicago/",
      "/we-buy-houses-in-logan-square": "/sell-my-house-fast-logan-square-chicago/",
      "/blog/author/delloinvestments": "/about-us/",
      // 2026-09-15: the About page slug moved to /about-us/ so the URL matches
      // the "About Us" nav label Karen asked for. Every existing link,
      // bookmark, backlink and Google result for /about/ lands on the new URL
      // permanently, so nothing that points at the old path breaks.
      "/about": "/about-us/",
      // 2026-10-19, organic drop diagnosis: dead blog addresses Google still
      // has on record. Misspelt copies of the grass-cutting and Section 8
      // posts, plus two Carrot posts that never came across.
      "/blog/to-stop-cutting-grass-in-chicago-homesellers-guide": "/blog/when-to-stop-cutting-grass-in-chicago-homesellers-guide/",
      "/blog/when-to-stop-cutting-grass-chicago-homesellers-guide": "/blog/when-to-stop-cutting-grass-in-chicago-homesellers-guide/",
      "/blog/when-to-stop-chicago-homesellers-guide": "/blog/when-to-stop-cutting-grass-in-chicago-homesellers-guide/",
      "/blog/when-to-stop-cutting-chicago-homesellers-guide": "/blog/when-to-stop-cutting-grass-in-chicago-homesellers-guide/",
      "/blog/when-to-stop-mowing-in-chicago-homesellers-guide": "/blog/when-to-stop-cutting-grass-in-chicago-homesellers-guide/",
      "/blog/renting-to-section-8-prons-cons-myths": "/blog/renting-to-section-8-in-chicago-prons-cons-myths/",
      "/blog/how-to-winterize-house-prevent-frozen-pipes": "/blog/how-much-does-it-cost-to-winterize-a-house/",
      "/blog/sell-my-house-without-a-realtor-": "/sell-house-without-realtor-chicago/",
    };
    // 2026-07-31, Karen's request: every service/situation page URL carries
    // the city. These are her original Carrot slugs, all indexed by Google,
    // 301ing to the renamed -chicago form. Do not remove before the old URLs
    // fall out of the index.
    const cityRenames = {
      "/as-is-home-buying": "/as-is-home-buying-chicago/",
      "/behind-on-mortgage-help": "/behind-on-mortgage-help-chicago/",
      "/code-violation-property-buying": "/code-violation-property-buying-chicago/",
      "/damaged-house-purchase": "/damaged-house-purchase-chicago/",
      "/divorce-property-sale": "/divorce-property-sale-chicago/",
      "/estate-appraiser": "/estate-appraiser-chicago/",
      "/foreclosure-service": "/foreclosure-service-chicago/",
      "/foundation-issue-home-buyer": "/foundation-issue-home-buyer-chicago/",
      "/free-home-valuation": "/free-home-valuation-chicago/",
      "/hoarder-house-buying": "/hoarder-house-buying-chicago/",
      "/inherited-property-sales": "/inherited-property-sales-chicago/",
      "/multi-unit-building-purchase": "/multi-unit-building-purchase-chicago/",
      "/pre-foreclosure-house-buying": "/pre-foreclosure-house-buying-chicago/",
      "/probate-property-purchase": "/probate-property-purchase-chicago/",
      "/property-investment-company": "/property-investment-company-chicago/",
      "/property-tax-delinquency-help": "/property-tax-delinquency-help-chicago/",
      "/property-with-liens-purchase": "/property-with-liens-purchase-chicago/",
      "/real-estate-consultant": "/real-estate-consultant-chicago/",
      "/sell-house-without-realtor": "/sell-house-without-realtor-chicago/",
      "/south-side-house-buyers": "/south-side-house-buyers-chicago/",
      "/tired-landlord-solutions": "/tired-landlord-solutions-chicago/",
      "/vacant-house-purchase": "/vacant-house-purchase-chicago/",
      "/water-damaged-property-purchase": "/water-damaged-property-purchase-chicago/",
    };
    return Object.entries({ ...map, ...cityRenames }).map(
      ([source, destination]) => ({
        source,
        destination,
        permanent: true,
      }),
    );
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // challenges.cloudflare.com is required in script-src + frame-src
            // for Turnstile; keep both in sync if the allowlist changes.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // The local preview (`npm run dev`) needs 'unsafe-eval' to run its
              // scripts; without it nothing hydrates and every Reveal block stays
              // invisible. Production never gets it.
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://gc.zgo.at`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https://www.google-analytics.com https://challenges.cloudflare.com https://*.goatcounter.com",
              "frame-src 'self' https://challenges.cloudflare.com https://www.google.com https://maps.google.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
