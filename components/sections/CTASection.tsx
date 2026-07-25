import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import type { SiteDict } from "@/lib/content/types";
import { localePrefix, type Locale } from "@/lib/content";
import { CONTACT } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

export default function CTASection({
  t,
  locale,
}: {
  t: SiteDict;
  locale: Locale;
}) {
  const prefix = localePrefix(locale);
  return (
    <section className="relative overflow-hidden bg-navy">
      <div
        className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-slate/40 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
        aria-hidden
      />
      <div className="container-custom relative section-padding text-center">
        <Reveal variant="fade-up">
          <h2 className="mx-auto max-w-2xl text-3xl !text-white sm:text-4xl lg:text-5xl">
            {t.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/70">{t.cta.body}</p>
        </Reveal>
        <Reveal variant="fade-up" delay={150}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href={CONTACT.phoneHref} className="btn-gold">
              <Phone className="h-4 w-4" />
              {t.cta.call}
            </a>
            <Link href={`${prefix}/contact`} className="btn-outline-light">
              {t.cta.form}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
