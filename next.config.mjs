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
      "/we-buy-houses-chicago": "/cash-home-buyers-chicago/",
      "/sell-my-house-fast-roseland": "/sell-my-house-fast-roseland-chicago/",
      "/we-buy-houses-north-lawndale": "/sell-my-house-fast-north-lawdale-chicago/",
      "/sell-house-fast-chicago": "/sell-my-house-fast-chicago/",
      "/how-we-buy-houses": "/how-it-works/",
      "/contact-us": "/contact/",
      "/we-buy-houses-in-humboldt-park": "/sell-my-house-fast-humboldt-park-chicago/",
      "/we-buy-houses-in-logan-square": "/sell-my-house-fast-logan-square-chicago/",
      "/blog/author/delloinvestments": "/about/",
    };
    return Object.entries(map).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
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
              "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://gc.zgo.at",
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
