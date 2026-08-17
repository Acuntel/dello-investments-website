// Delivers lead notification emails through Resend, with a two-step strategy:
// the primary attempt sends from the delloinvestments.com domain to Karen's
// leads inbox, and if that fails (it will until delloinvestments.com is
// verified at resend.com/domains, since Resend rejects unverified senders)
// it falls back to the account owner's inbox via Resend's built-in sender,
// which is always deliverable. The moment the domain is verified in Resend,
// the primary path starts working with no code or env change needed.
//
// Leads are always recorded in the admin store before any email is attempted
// (see the callers), so a total email outage can never lose a lead.

const PRIMARY_FROM =
  process.env.LEAD_FROM_EMAIL ?? "Dello Website <website@delloinvestments.com>";
const PRIMARY_TO = process.env.LEAD_TO_EMAIL ?? "leads@delloinvestments.com";
const FALLBACK_FROM = "Dello Website <onboarding@resend.dev>";
const FALLBACK_TO = "bradyschwartz25@gmail.com";

type LeadEmail = {
  subject: string;
  html: string;
  replyTo?: string;
};

async function attempt(
  key: string,
  from: string,
  to: string,
  { subject, html, replyTo }: LeadEmail,
): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      ...(replyTo && { reply_to: replyTo }),
      subject,
      html,
    }),
  });
  if (!res.ok) {
    console.error(`Resend error (to ${to}):`, await res.text());
  }
  return res.ok;
}

/** Returns true if the notification reached at least one inbox. */
export async function sendLeadEmail(email: LeadEmail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[lead email, RESEND_API_KEY not set]", email.subject);
    return false;
  }
  if (await attempt(key, PRIMARY_FROM, PRIMARY_TO, email)) return true;
  return attempt(key, FALLBACK_FROM, FALLBACK_TO, {
    ...email,
    subject: `[fallback until domain verified] ${email.subject}`,
  });
}
