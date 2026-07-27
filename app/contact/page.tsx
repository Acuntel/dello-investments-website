import { pageMetadata } from "@/lib/metadata";
import ContactPage from "@/components/ContactPage";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata("contact", "en");
}

export default function Page() {
  return <ContactPage locale="en" />;
}
