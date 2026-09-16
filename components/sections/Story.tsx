import Image from "next/image";
import { Check } from "lucide-react";
import type { SiteDict } from "@/lib/content/types";
import Reveal from "@/components/ui/Reveal";
import type { ImageMeta } from "@/lib/admin/types";

export default function Story({ t, image }: { t: SiteDict; image: ImageMeta }) {
  return (
    <section id="story" className="section-padding scroll-mt-24">
      <div className="container-custom grid items-center gap-14 lg:grid-cols-2">
        <Reveal variant="fade-right" className="relative mx-auto max-w-lg">
          {/* Offset mist frame behind the photo, quiet luxury, not a box */}
          <div
            className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl border border-mist"
            aria-hidden
          />
          <Image
            src="/images/pages/dello-investments-team-chicago-real-estate.webp"
            alt={image.alt}
            title={image.title}
            width={640}
            height={427}
            className="relative rounded-2xl object-cover shadow-lift"
          />
        </Reveal>
        <div>
          <Reveal variant="fade-up">
            <p className="section-label">{t.story.label}</p>
            <h2 className="text-3xl sm:text-4xl">{t.story.title}</h2>
          </Reveal>
          <Reveal variant="fade-up" delay={100}>
            <p className="mt-6 leading-relaxed text-muted">{t.story.body1}</p>
            <p className="mt-4 leading-relaxed text-muted">{t.story.body2}</p>
          </Reveal>
          <Reveal variant="fade-up" delay={200}>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {t.story.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm font-medium text-ink"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mist/15">
                    <Check className="h-3 w-3 text-mist-ink" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
