import Link from "next/link";
import type { SiteDict } from "@/lib/content/types";
import Reveal from "@/components/ui/Reveal";

// Post-hero band linking the three money-page categories (foreclosure,
// inherited/probate, property investment company) plus the situations index.
// bodyHtml is our own static copy with inline anchors, so rendering it with
// dangerouslySetInnerHTML is safe; it never carries user or admin input.
export default function CategoryLinks({ t }: { t: SiteDict }) {
  return (
    <section className="container-custom section-padding !pb-0">
      <Reveal variant="fade-up">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl">{t.categoryLinks.title}</h2>
          <p
            className="rich mt-5 text-lg leading-relaxed text-muted"
            dangerouslySetInnerHTML={{ __html: t.categoryLinks.bodyHtml }}
          />
          <p className="mt-5">
            <Link
              href="/situations/"
              className="font-medium text-steel underline decoration-mist underline-offset-4 transition-colors hover:text-navy"
            >
              {t.categoryLinks.seeAllLabel}
            </Link>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
