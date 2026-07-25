import { generatePageMetadata } from "@/lib/metadata";
import ContactPage from "@/components/ContactPage";

export const metadata = generatePageMetadata({
  title: "Get Your Free Cash Offer",
  description:
    "Tell us about your Chicago property and get a fair, written cash offer within 24 hours. Call or text (312) 975-5557, open 7 days a week.",
  path: "/contact",
  locale: "en",
});

export default function Page() {
  return <ContactPage locale="en" />;
}
