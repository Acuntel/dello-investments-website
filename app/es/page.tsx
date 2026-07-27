import { pageMetadata } from "@/lib/metadata";
import { loadOverrides } from "@/lib/admin/store";
import HomePage from "@/components/HomePage";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata("home", "es");
}

export default async function Page() {
  return <HomePage locale="es" overrides={await loadOverrides()} />;
}
