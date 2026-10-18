import type { Lead } from "@/lib/admin/types";

// Hands each new lead to the GoHighLevel inbound webhook so it lands in the
// CRM. Dormant until GHL_WEBHOOK_URL is set in Vercel. Never throws and gives
// up after 5 seconds: a slow or broken CRM must never cost a seller their
// success screen. Failures only reach the Vercel function logs.
export async function forwardLeadToGhl(lead: Lead): Promise<void> {
  const url = process.env.GHL_WEBHOOK_URL;
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) console.error(`GHL webhook returned ${res.status}`);
  } catch (error) {
    console.error("GHL webhook failed:", error);
  }
}
