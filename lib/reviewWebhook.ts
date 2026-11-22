// Server-only. Where every review-form submission lands: the GoHighLevel
// inbound webhook on the "Review feedback" workflow (set up 22 November 2026).
// Kept in code rather than a Vercel env var so it survives the move to
// Karen's own Vercel account. Imported only by app/api/review/route.ts.
export const REVIEW_FEEDBACK_WEBHOOK =
  "https://services.leadconnectorhq.com/hooks/EHbk0xHtXRPSaNA1vUSr/webhook-trigger/04dad2b2-0cb3-4132-b2ec-33d8fcfc1a12";
