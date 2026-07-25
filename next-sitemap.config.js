/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.delloinvestments.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/api/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
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
    // Strip the locale prefix so /es and /pl pages rank with the same
    // priority as their English equivalents.
    const bare = path.replace(/^\/(es|pl)(?=\/|$)/, "") || "/";
    let priority = config.priority;
    if (bare === "/") priority = 1.0;
    else if (bare === "/contact") priority = 0.9;
    else if (bare === "/how-it-works" || bare === "/about") priority = 0.8;

    return {
      loc: path,
      changefreq: config.changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
