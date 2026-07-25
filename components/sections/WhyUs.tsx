import Image from "next/image";
import type { SiteDict } from "@/lib/content/types";
import Reveal from "@/components/ui/Reveal";

export default function WhyUs({ t }: { t: SiteDict }) {
  return (
    <section className="section-padding">
      <div className="container-custom grid items-center gap-14 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Reveal variant="fade-up">
            <p className="section-label">{t.why.label}</p>
            <h2 className="max-w-xl text-3xl sm:text-4xl">{t.why.title}</h2>
          </Reveal>
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {t.why.items.map((item, i) => (
              <Reveal key={item.title} variant="fade-up" delay={(i % 2) * 100}>
                <div className="border-l border-champagne/40 pl-6">
                  <h3 className="text-lg">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal
          variant="fade-left"
          className="relative mx-auto w-full max-w-md lg:col-span-2"
        >
          <div
            className="absolute -left-4 -top-4 h-full w-full rounded-2xl bg-sage-light"
            aria-hidden
          />
          <Image
            src="/images/home-sell.webp"
            alt=""
            width={600}
            height={400}
            className="relative rounded-2xl object-cover shadow-card"
          />
        </Reveal>
      </div>
    </section>
  );
}
