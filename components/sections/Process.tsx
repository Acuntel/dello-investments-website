import type { SiteDict } from "@/lib/content/types";
import Reveal from "@/components/ui/Reveal";

export default function Process({ t }: { t: SiteDict }) {
  return (
    <section id="process" className="section-padding scroll-mt-24 bg-navy">
      <div className="container-custom">
        <Reveal variant="fade-up" className="max-w-2xl">
          <p className="section-label !text-gold">{t.process.label}</p>
          <h2 className="text-3xl !text-white sm:text-4xl">
            {t.process.title}
          </h2>
          <p className="mt-4 text-white/65">{t.process.subtitle}</p>
        </Reveal>
        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {t.process.steps.map((step, i) => (
            <Reveal key={i} variant="fade-up" delay={i * 120}>
              <div className="group relative border-t border-white/15 pt-8 transition-colors duration-500">
                <span
                  className="absolute -top-px left-0 h-px w-12 bg-gold transition-all duration-500 ease-smooth group-hover:w-full"
                  aria-hidden
                />
                <p className="font-heading text-5xl italic text-gold/70">
                  0{i + 1}
                </p>
                <h3 className="mt-4 text-xl !text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
