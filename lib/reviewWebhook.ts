// Server-only. Where every review-form submission lands: the GoHighLevel
// inbound webhook on the "Review feedback" workflow (new URL 23 November 2026).
// Kept in code rather than a Vercel env var so it survives the move to
// Karen's own Vercel account. Imported only by app/api/review/route.ts.
export const REVIEW_FEEDBACK_WEBHOOK =
  "https://services.leadconnectorhq.com/hooks/EHbk0xHtXRPSaNA1vUSr/webhook-trigger/2c3ecf7b-b3c4-439e-b08d-44a2f3c1d15c";
