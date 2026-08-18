import type { SiteDict } from "@/lib/content/types";
import Reveal from "@/components/ui/Reveal";

// The three positioning bands from Karen's August 2026 copy handoff: the
// licensed-GC promise, distressed/damaged properties, and foreclosure.
// body2Html carries one inline anchor of our own static copy, so
// dangerouslySetInnerHTML is safe; it never renders user or admin input.
export default function Positioning({ t }: { t: SiteDict }) {
  const p = t.positioning;
  return (
    <>
      <section className="section-padding bg-navy">
        <div className="container-custom">
          <Reveal variant="fade-up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl !text-white sm:text-4xl">{p.gc.title}</h2>
              <p className="mt-5 text-lg leading-relaxed text-white/80">
                {p.gc.body}
              </p>
              <p className="mt-6 inline-block rounded-full border border-mist/40 px-5 py-2 text-sm font-semibold tracking-wide text-mist">
                {p.gc.license}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-custom grid gap-14 lg:grid-cols-2">
          <Reveal variant="fade-up">
            <div>
              <h2 className="text-2xl sm:text-3xl">{p.distressed.title}</h2>
              <p className="mt-4 leading-relaxed text-muted">
                {p.distressed.body1}
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                {p.distressed.body2}
              </p>
            </div>
          </Reveal>
          <Reveal variant="fade-up" delay={120}>
            <div className="rounded-2xl bg-mist-faint p-8 sm:p-10">
              <h2 className="text-2xl sm:text-3xl">{p.foreclosure.title}</h2>
              <p className="mt-4 leading-relaxed text-muted">
                {p.foreclosure.body1}
              </p>
              <p
                className="rich mt-4 leading-relaxed text-muted"
                dangerouslySetInnerHTML={{ __html: p.foreclosure.body2Html }}
              />
              <p className="mt-4 font-medium text-ink">{p.foreclosure.body3}</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
