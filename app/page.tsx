import { generatePageMetadata } from "@/lib/metadata";
import HomePage from "@/components/HomePage";

export const metadata = generatePageMetadata({
  title:
    "We Buy Houses Chicago for Cash | Offer in 24 Hours | Dello Investments",
  description:
    "Woman-owned Chicago cash home buyer. Fair offers in 24 hours, close in 7-14 days. Any condition, all 77 neighborhoods. No repairs, no commissions, no closing costs.",
  path: "",
  locale: "en",
});

export default function Page() {
  return <HomePage locale="en" />;
}
