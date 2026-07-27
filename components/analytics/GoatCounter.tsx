// Cookieless, anonymous pageview counting. No personal data, no cross-site
// tracking, nothing that needs a consent banner. Renders nothing at all until
// GC_SITE is set, so the site is never loading a script for no reason.
export default function GoatCounter() {
  const site = process.env.GC_SITE;
  if (!site) return null;
  return (
    <script
      data-goatcounter={`https://${site}.goatcounter.com/count`}
      async
      src="//gc.zgo.at/count.js"
    />
  );
}
