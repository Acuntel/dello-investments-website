import { getDict, type Locale } from "@/lib/content";
import { generateFAQSchema } from "@/lib/schema";
import { CERT_IMAGE_IDS } from "@/lib/admin/defaults";
import { resolveImage } from "@/lib/admin/store";
import type { Overrides } from "@/lib/admin/types";
import Hero from "@/components/sections/Hero";
import StatsBar from "@/components/sections/StatsBar";
import Story from "@/components/sections/Story";
import Process from "@/components/sections/Process";
import Situations from "@/components/sections/Situations";
import WhyUs from "@/components/sections/WhyUs";
import Neighborhoods from "@/components/sections/Neighborhoods";
import FAQSection from "@/components/sections/FAQSection";
import CTASection from "@/components/sections/CTASection";

// One assembly for all three locales, the dictionary is the only variable,
// so es/pl can never drift structurally from the English home. Photograph
// descriptions come from the admin overrides and fall back to the dictionary.
export default function HomePage({
  locale,
  overrides,
}: {
  locale: Locale;
  overrides: Overrides;
}) {
  const t = getDict(locale);
  const img = (id: string) => resolveImage(overrides, id, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(t.faq.items)),
        }}
      />
      <Hero t={t} locale={locale} image={img("hero")} />
      <StatsBar t={t} certImages={CERT_IMAGE_IDS.map(img)} />
      <Story t={t} image={img("team")} />
      <Process t={t} />
      <Situations t={t} />
      <WhyUs t={t} image={img("why")} />
      <Neighborhoods t={t} image={img("neighborhoods")} />
      <FAQSection t={t} />
      <CTASection t={t} locale={locale} />
    </>
  );
}
