import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { SiteDict } from "@/lib/content/types";
import { localePrefix, type Locale } from "@/lib/content";

export default function Hero({ t, locale }: { t: SiteDict; locale: Locale }) {
  const prefix = localePrefix(locale);
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-emerald">
      <Image
        src="/images/hero-home.webp"
        alt=""
        fill
        priority
        className="object-cover object-right opacity-40"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-emerald via-emerald/85 to-emerald/30"
        aria-hidden
      />
      <div className="container-custom relative pb-32 pt-36">
        <div className="hero-stagger max-w-2xl">
          <p className="section-label !text-champagne">{t.hero.eyebrow}</p>
          <h1 className="text-4xl leading-[1.12] !text-white sm:text-5xl lg:text-6xl">
            {t.hero.titleLead}{" "}
            <em className="italic text-champagne">{t.hero.titleAccent}</em>{" "}
            {t.hero.titleTail}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            {t.hero.subtitle}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href={`${prefix}/contact`} className="btn-champagne">
              {t.hero.ctaPrimary}
            </Link>
            <a href={`${prefix}/#process`} className="btn-outline-light">
              {t.hero.ctaSecondary}
            </a>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-white/60">
            <span className="flex text-champagne" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            {t.hero.trustLine}
          </p>
        </div>
      </div>
    </section>
  );
}
