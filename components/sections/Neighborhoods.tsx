import Image from "next/image";
import type { SiteDict } from "@/lib/content/types";
import Reveal from "@/components/ui/Reveal";
import type { ImageMeta } from "@/lib/admin/types";

export default function Neighborhoods({
  t,
  image,
}: {
  t: SiteDict;
  image: ImageMeta;
}) {
  return (
    <section className="section-padding bg-mist-faint">
      <div className="container-custom grid items-center gap-14 lg:grid-cols-2">
        <Reveal variant="fade-right" className="order-2 lg:order-1">
          <Image
            src="/images/neighborhoods.webp"
            alt={image.alt}
            title={image.title}
            width={720}
            height={480}
            className="rounded-2xl object-cover shadow-lift"
          />
        </Reveal>
        <div className="order-1 lg:order-2">
          <Reveal variant="fade-up">
            <p className="section-label">{t.neighborhoods.label}</p>
            <h2 className="text-3xl sm:text-4xl">{t.neighborhoods.title}</h2>
            <p className="mt-4 text-muted">{t.neighborhoods.body}</p>
          </Reveal>
          <Reveal variant="fade-up" delay={120}>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {t.neighborhoods.areas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-mist bg-white px-4 py-1.5 text-sm text-ink transition-colors duration-300 hover:border-mist"
                >
                  {area}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
