/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.delloinvestments.com",
  generateRobotsTxt: true,
  trailingSlash: true,
  generateIndexSitemap: false,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/api/*", "/admin", "/admin/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/", disallow: ["/admin"] },
      // Explicitly welcome AI / answer-engine crawlers so Dello Investments
      // can be cited by Claude, ChatGPT, Perplexity, and Google AI Overviews.
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
    ],
  },
  transform: async (config, path) => {
    // Strip the locale prefix so /es pages rank with the same
    // priority as their English equivalents.
    const bare = path.replace(/^\/es(?=\/|$)/, "") || "/";
    let priority = config.priority;
    if (bare === "/") priority = 1.0;
    else if (bare === "/contact") priority = 0.9;
    else if (bare === "/how-it-works" || bare === "/about-us") priority = 0.8;

    return {
      loc: path,
      changefreq: config.changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },

  // The 77 pages ported off Carrot render per request (so admin edits go live
  // without a deploy), which means next-sitemap cannot discover them by
  // scanning the build output. They are listed explicitly from the same index
  // the site renders from, so the sitemap can never drift from the routes.
  additionalPaths: async (config) => {
    const pages = require("./lib/pages/seo-index.json");

    // Every page on this site renders per request so that admin edits go live
    // without a deploy, which means next-sitemap discovers none of them by
    // scanning the build. The hand-built bilingual routes are listed here and
    // the ported ones come from the same index the site renders from, so the
    // sitemap can never drift from the actual routes.
    const core = [
      { loc: "/", priority: 1.0 },
      { loc: "/es", priority: 1.0 },
      { loc: "/contact", priority: 0.9 },
      { loc: "/es/contact", priority: 0.9 },
    ].map((p) => ({
      ...p,
      changefreq: config.changefreq,
      lastmod: new Date().toISOString(),
    }));

    const ported = pages.map((page) => {
      const loc = `/${page.slug}`;
      let priority = 0.7;
      if (page.kind === "blog") priority = 0.6;
      else if (/^sell-my-house-fast-|^es-vender-casa-/.test(page.slug))
        priority = 0.8;
      else if (
        ["about-us", "faqs", "how-it-works", "situations"].includes(
          page.slug,
        )
      )
        priority = 0.8;
      return {
        loc,
        changefreq: page.kind === "blog" ? "monthly" : config.changefreq,
        priority,
        lastmod: new Date().toISOString(),
      };
    });

    return [...core, ...ported];
  },
};
