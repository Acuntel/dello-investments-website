import type { SiteDict } from "@/lib/content/types";
import Reveal from "@/components/ui/Reveal";
import FAQAccordion from "@/components/ui/FAQAccordion";

export default function FAQSection({ t }: { t: SiteDict }) {
  return (
    <section id="faq" className="section-padding scroll-mt-24">
      <div className="container-custom max-w-3xl">
        <Reveal variant="fade-up" className="text-center">
          <p className="section-label justify-center before:hidden">
            {t.faq.label}
          </p>
          <h2 className="text-3xl sm:text-4xl">{t.faq.title}</h2>
        </Reveal>
        <Reveal variant="fade-up" delay={120} className="mt-12">
          <FAQAccordion items={t.faq.items} />
        </Reveal>
      </div>
    </section>
  );
}
