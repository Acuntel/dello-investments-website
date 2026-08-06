import Image from "next/image";
import { getDict } from "@/lib/content";
import { generateBreadcrumbSchema, generateFAQSchema } from "@/lib/schema";
import { heroFor, sectionise, type ContentPage } from "@/lib/pages";
import Block from "@/components/pages/Blocks";
import FAQAccordion from "@/components/ui/FAQAccordion";
import CTASection from "@/components/sections/CTASection";
import Reveal from "@/components/ui/Reveal";

// One assembly for all 77 pages ported off Carrot. The hero band, the
// alternating section rhythm and the closing call to action are the same ones
// the home page uses, which is what makes a ported page feel like part of this
// site rather than a transplant.
export default function ContentPageView({ page }: { page: ContentPage }) {
  const t = getDict("en");
  const { hero, blocks } = heroFor(page);
  const sections = sectionise(blocks);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: "Home", url: "/" },
              ...(page.kind === "blog" ? [{ name: "Blog", url: "/blog" }] : []),
              { name: page.h1 },
            ]),
          ),
        }}
      />
      {page.faq.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQSchema(page.faq)),
          }}
        />
      ) : null}

      <section className="relative overflow-hidden bg-navy pb-24 pt-40">
        {hero ? (
          <>
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-25"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/50"
              aria-hidden
            />
          </>
        ) : null}
        <div className="container-custom relative">
          <div className="hero-stagger max-w-3xl">
            <h1 className="text-4xl leading-[1.14] !text-white sm:text-5xl">
              {page.h1}
            </h1>
            {page.intro.map((line, i) => (
              <p
                key={i}
                className="rich-invert mt-5 max-w-2xl text-lg leading-relaxed text-white/75"
                dangerouslySetInnerHTML={{ __html: line }}
              />
            ))}
          </div>
        </div>
      </section>

      {sections.map((section, i) => (
        <section
          key={i}
          className={`section-padding ${i % 2 === 1 ? "bg-mist-faint" : ""}`}
        >
          <div className="container-custom flex flex-col gap-6">
            {section.map((block, j) => (
              <Block key={j} block={block} />
            ))}
          </div>
        </section>
      ))}

      {page.faq.length > 0 ? (
        <section
          className={`section-padding ${sections.length % 2 === 1 ? "bg-mist-faint" : ""}`}
        >
          <div className="container-custom max-w-3xl">
            <Reveal variant="fade-up" className="text-center">
              <p className="section-label justify-center before:hidden">
                {t.faq.label}
              </p>
              <h2 className="text-3xl sm:text-4xl">{t.faq.title}</h2>
            </Reveal>
            <Reveal variant="fade-up" delay={120} className="mt-12">
              <FAQAccordion items={page.faq} />
            </Reveal>
          </div>
        </section>
      ) : null}

      <CTASection t={t} locale="en" />
    </>
  );
}
