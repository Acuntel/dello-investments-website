// The review form's public settings. One place to paste the Google link:
// code/make_review_qr.py in the Blueprint folder reads googleReviewUrl from
// here too. Safe for the browser. The GHL webhook lives server-side in
// lib/reviewWebhook.ts so it never ships to visitors.
export const reviewConfig = {
  googleReviewUrl: "https://g.page/r/CdLGTnX53jK-EBM/review",
  // 4-5 stars go to Google after the feedback is recorded. 1-3 stay private.
  happyMin: 4,
};
