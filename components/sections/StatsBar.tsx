import Image from "next/image";
import type { SiteDict } from "@/lib/content/types";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Reveal from "@/components/ui/Reveal";
import type { ImageMeta } from "@/lib/admin/types";

// Overlapping card pulled up over the hero's bottom edge, layered depth
// instead of stacked color bands.
export default function StatsBar({
  t,
  certImages,
}: {
  t: SiteDict;
  certImages: ImageMeta[];
}) {
  return (
    <section className="container-custom relative z-10 -mt-20">
      <Reveal variant="fade-up">
        <div className="rounded-2xl bg-white px-6 py-10 shadow-lift sm:px-10">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {t.stats.map((stat, i) => (
              <div
                key={i}
                className="text-center lg:border-r lg:border-mist-light lg:last:border-0"
              >
                <p className="font-heading text-5xl text-navy">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mx-auto mt-2 max-w-[180px] text-sm text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-5 border-t border-mist-light pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mist-ink">
              {t.certs.label}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {t.certs.items.map((cert, i) => (
                <div key={cert.name} className="flex items-center gap-3">
                  <Image
                    src={cert.img}
                    alt={certImages[i]?.alt ?? cert.alt}
                    title={certImages[i]?.title}
                    width={56}
                    height={56}
                    className="h-14 w-14 object-contain"
                  />
                  <span className="max-w-[140px] text-sm font-medium text-ink">
                    {cert.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
