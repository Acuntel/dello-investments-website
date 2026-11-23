import type { Metadata } from "next";
import ReviewForm from "@/components/ui/ReviewForm";

// The review ask lands here: /review/?name=...&email=...&cid=... from GHL,
// or bare from the QR code. Kept out of Google's index and the sitemap.
export const metadata: Metadata = {
  title: "How did we do? | Dello Investments",
  description: "Tell us how selling your house with Dello Investments went.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/review/" },
};

export default function Page() {
  return (
    <section className="bg-[linear-gradient(to_bottom,#0F1F31_0,#0F1F31_240px,#F7F4F1_240px)] px-4 pb-20 pt-32 sm:pt-36">
      <div className="mx-auto max-w-xl">
        <ReviewForm />
      </div>
    </section>
  );
}
