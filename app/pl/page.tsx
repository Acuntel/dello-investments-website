import { pageMetadata } from "@/lib/metadata";
import { loadOverrides } from "@/lib/admin/store";
import HomePage from "@/components/HomePage";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata("home", "pl");
}

export default async function Page() {
  return <HomePage locale="pl" overrides={await loadOverrides()} />;
}
