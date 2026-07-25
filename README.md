# Dello Investments — delloinvestments.com

Luxury mock draft for Karen Rodriguez's cash home buying company. Next.js 14 (App Router) + TypeScript + Tailwind, trilingual (EN/ES/PL), with an AI chatbot, hardened APIs, and a full SEO/AI-crawler pack.

## Commands

```bash
npm run dev      # local dev at :3000
npm run build    # production build (+ postbuild generates sitemap/robots)
npx tsc --noEmit # type check
```

Deploy: `npx vercel --prod --yes` (Bash sandbox OFF — the CLI hangs sandboxed).

## Architecture notes

- **Trilingual:** `lib/content/{en,es,pl}.ts` are exhaustive `SiteDict` dictionaries — a missing key is a compile error. Pages are shared components (`components/HomePage.tsx`, `components/ContactPage.tsx`); the locale route files only pick a dictionary and metadata. The language switcher maps the _current_ path into the target locale.
- **hreflang:** every page emits `alternates.languages` for en/es/pl via `lib/metadata.ts`.
- **JSON-LD:** `lib/schema.ts` — LocalBusiness+RealEstateAgent (with real license/cert credentials, `knowsLanguage`), WebSite, FAQPage, BreadcrumbList. All figures truthful.
- **AI crawlers:** `next-sitemap.config.js` generates robots.txt welcoming ClaudeBot/GPTBot/PerplexityBot/etc. `public/llms.txt` + `public/llms-full.txt` are the answer-engine knowledge base.

## Chatbot security (defense in depth, in request order)

1. `CHAT_ENABLED !== "true"` → 503 kill switch (fail-safe off)
2. Origin/Referer exact-hostname allowlist (middleware + per-route)
3. Per-IP rate limit 8/min (in-memory, self-evicting)
4. Signed HMAC session token, minted only by solving Cloudflare Turnstile (`/api/chat/session`) — enforced automatically once `TURNSTILE_SECRET_KEY` is set
5. Upstash daily ceilings: 25/session, 40/IP, 1500 global (auto-shutoff) — active once KV env vars exist
6. Input caps: ≤40 messages, ≤30k chars total, ≤5k/message; last 20 sent to model
7. `max_tokens: 500`, model pinned server-side, prompt caching on the static system block, primary→backup key failover

Contact form: honeypot field + Turnstile-ready + length caps + HTML-escaped email.

## Environment variables (set in Vercel)

| Var                                                       | Purpose                                                         |
| --------------------------------------------------------- | --------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`                                       | Chatbot (required for chat)                                     |
| `CHAT_ENABLED`                                            | `true` to turn the chat API on                                  |
| `CHAT_SESSION_SECRET`                                     | Any long random string — HMAC for session tokens                |
| `ANTHROPIC_API_KEY_BACKUP`                                | Optional failover key                                           |
| `ANTHROPIC_MODEL`                                         | Optional override (default `claude-haiku-4-5-20251001`)         |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile (auto-hardens chat + form)                 |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN`                   | Upstash — distributed daily limits                              |
| `RESEND_API_KEY`                                          | Contact-form + chat-lead emails to connect@delloinvestments.com |

Without any of these the site still builds and runs: chat shows a friendly "call us" fallback, forms log to console.

## Brand

Palette from Karen's Squarespace theme: navy `#0F1F31`, slate `#34506B`, seafoam `#C1D9DB`, cream `#FAF9F6`, champagne gold `#C9A468` (refined from the draft's `#FFED05`). Fonts: Playfair Display (headings) + Be Vietnam Pro (body). Motion: `cubic-bezier(0.25,0.46,0.45,0.94)` reveal system.
