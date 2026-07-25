import { getDict, type Locale } from "@/lib/content";
import { generateFAQSchema } from "@/lib/schema";
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
// so es/pl can never drift structurally from the English home.
export default function HomePage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(t.faq.items)),
        }}
      />
      <Hero t={t} locale={locale} />
      <StatsBar t={t} />
      <Story t={t} />
      <Process t={t} />
      <Situations t={t} />
      <WhyUs t={t} />
      <Neighborhoods t={t} />
      <FAQSection t={t} />
      <CTASection t={t} locale={locale} />
    </>
  );
}
