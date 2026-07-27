import { pageMetadata } from "@/lib/metadata";
import { loadOverrides } from "@/lib/admin/store";
import HomePage from "@/components/HomePage";

// Rendered per request so anything saved in /admin is live immediately, rather
// than waiting for the next deploy. The default wording lives in
// lib/admin/defaults.ts, which is what an empty override falls back to.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata("home", "en");
}

export default async function Page() {
  return <HomePage locale="en" overrides={await loadOverrides()} />;
}
