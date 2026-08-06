import {
  KeyRound,
  ShieldCheck,
  Hammer,
  Building2,
  FileWarning,
  HeartHandshake,
} from "lucide-react";
import type { SiteDict } from "@/lib/content/types";
import Reveal from "@/components/ui/Reveal";

const ICONS = [
  KeyRound,
  ShieldCheck,
  Hammer,
  Building2,
  FileWarning,
  HeartHandshake,
];

export default function Situations({ t }: { t: SiteDict }) {
  return (
    <section
      id="situations"
      className="section-padding scroll-mt-24 bg-mist-faint"
    >
      <div className="container-custom">
        <Reveal variant="fade-up" className="max-w-2xl">
          <p className="section-label">{t.situations.label}</p>
          <h2 className="text-3xl sm:text-4xl">{t.situations.title}</h2>
          <p className="mt-4 text-muted">{t.situations.subtitle}</p>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.situations.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={item.title} variant="fade-up" delay={(i % 3) * 100}>
                <div className="group h-full rounded-2xl bg-white p-8 shadow-card transition-all duration-500 ease-smooth hover:-translate-y-1.5 hover:shadow-lift">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mist-light transition-colors duration-500 group-hover:bg-mist/15">
                    <Icon className="h-5 w-5 text-steel transition-colors duration-500 group-hover:text-mist-ink" />
                  </span>
                  <h3 className="mt-5 text-xl">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
