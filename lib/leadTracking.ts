// Lead attribution, all in the visitor's own browser tab. No cookies, nothing
// that outlives the tab: sessionStorage is wiped when the tab closes. It only
// leaves the browser attached to an enquiry the visitor chose to send.

const FIRST_TOUCH_KEY = "dello-first-touch";

export type Attribution = {
  landingPage: string;
  submitPage: string;
  referrer: string;
};

declare global {
  interface Window {
    goatcounter?: {
      count: (vars: { path: string; title?: string; event?: boolean }) => void;
    };
  }
}

const bare = (host: string) => host.replace(/^www\./, "");

// Runs once per tab, on the first page the visitor sees. The referrer is kept
// whole (chatgpt.com, perplexity.ai, bing.com...) and only dropped when it is
// this site itself. The landing page keeps its query string, because ChatGPT
// stamps utm_source=chatgpt.com on links even when the browser hides the
// referrer.
export function captureFirstTouch(): void {
  try {
    if (sessionStorage.getItem(FIRST_TOUCH_KEY)) return;
    let referrer = "";
    if (document.referrer) {
      try {
        const host = new URL(document.referrer).hostname;
        if (bare(host) !== bare(location.hostname)) referrer = document.referrer;
      } catch {
        // unparseable referrer: treat as none
      }
    }
    sessionStorage.setItem(
      FIRST_TOUCH_KEY,
      JSON.stringify({
        landingPage: location.pathname + location.search,
        referrer,
      }),
    );
  } catch {
    // storage blocked (private mode): the lead still sends, just unattributed
  }
}

export function attribution(): Attribution {
  let first: { landingPage?: string; referrer?: string } = {};
  try {
    first = JSON.parse(sessionStorage.getItem(FIRST_TOUCH_KEY) || "{}");
  } catch {
    // fall through with nothing
  }
  return {
    landingPage: first.landingPage ?? "",
    submitPage: location.pathname,
    referrer: first.referrer ?? "",
  };
}

// GoatCounter event. A silent no-op until GC_SITE is set and count.js loads,
// and in any browser that opened /admin (GoatCounter's "skipgc" opt-out).
export function countEvent(name: string): void {
  try {
    window.goatcounter?.count({
      path: name,
      title: location.pathname,
      event: true,
    });
  } catch {
    // analytics must never break the page
  }
}
