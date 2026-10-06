import Image from "next/image";
import { getDict } from "@/lib/content";
import {
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/schema";
import {
  bylineFor,
  heroFor,
  pairMedia,
  sectionise,
  type ContentPage,
} from "@/lib/pages";
import SectionRows from "@/components/pages/SectionRows";
import FAQAccordion from "@/components/ui/FAQAccordion";
import CTASection from "@/components/sections/CTASection";
import MapCard from "@/components/sections/MapCard";
import Reveal from "@/components/ui/Reveal";

// One assembly for all 77 pages ported off Carrot. The hero band, the
// alternating section rhythm and the closing call to action are the same ones
// the home page uses, which is what makes a ported page feel like part of this
// site rather than a transplant.
export default function ContentPageView({ page }: { page: ContentPage }) {
  const t = getDict("en");
  const { hero, blocks: withoutHero } = heroFor(page);
  // Blog posts: the "By Karen…" line moves up under the title, next to the
  // date, instead of sitting alone at the top of the first section.
  const { byline, blocks } = bylineFor(page, withoutHero);
  const sections = sectionise(blocks);
  const isBlog = page.kind === "blog";
  const dateLabel = page.updated
    ? `Updated ${formatDate(page.updated)}`
    : page.published
      ? `Published ${formatDate(page.published)}`
      : null;

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
      {isBlog ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateBlogPostingSchema({
                url: `/${page.slug}/`,
                headline: page.h1,
                description: page.description,
                image: hero?.src,
                published: page.published,
                updated: page.updated,
              }),
            ),
          }}
        />
      ) : null}
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
            {byline || dateLabel ? (
              <p className="rich-invert mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/75">
                {byline ? (
                  <span dangerouslySetInnerHTML={{ __html: byline }} />
                ) : null}
                {byline && dateLabel ? (
                  <span aria-hidden className="text-mist">
                    ·
                  </span>
                ) : null}
                {dateLabel ? (
                  <time dateTime={page.updated ?? page.published}>
                    {dateLabel}
                  </time>
                ) : null}
              </p>
            ) : null}
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
          <div className="container-custom flex flex-col gap-8">
            <SectionRows rows={pairMedia(section)} />
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

      {page.slug === "about-us" ? <MapCard /> : null}

      <CTASection t={t} locale="en" />
    </>
  );
}

// "2026-10-06" → "October 6, 2026". Parsed as a calendar date, not a moment,
// so a Chicago evening never shows as the next day.
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
