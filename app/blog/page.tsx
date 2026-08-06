import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { portedKey } from "@/lib/admin/defaults";
import { getDict } from "@/lib/content";
import { blogPosts, getContentPage, heroFor } from "@/lib/pages";
import { generateBreadcrumbSchema } from "@/lib/schema";
import CTASection from "@/components/sections/CTASection";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return pageMetadata(portedKey("blog"), "en");
}

// Karen's Carrot blog index was a plain list. Here the posts get the same card
// treatment the rest of the site uses, with each post's own illustration.
export default function BlogIndex() {
  const t = getDict("en");
  const page = getContentPage("blog");
  const posts = blogPosts();

  const excerpt = (slug: string) => {
    const post = getContentPage(slug);
    const first = post?.blocks.find(
      (b) => b.t === "p" && !/^By /i.test(b.html.replace(/<[^>]+>/g, "")),
    );
    if (!first || first.t !== "p") return "";
    const text = first.html.replace(/<[^>]+>/g, "").trim();
    return text.length > 180 ? `${text.slice(0, 177).trimEnd()}...` : text;
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Blog" },
            ]),
          ),
        }}
      />

      <section className="bg-navy pb-24 pt-40">
        <div className="container-custom hero-stagger">
          <p className="section-label !text-mist">Guides and answers</p>
          <h1 className="max-w-3xl text-4xl !text-white sm:text-5xl">
            {page?.h1 || "Selling a Chicago house, explained"}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
            Straight answers on probate, foreclosure, tenants, taxes and
            repairs, written for Chicago and Cook County homeowners.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => {
            const hero = heroFor(post).hero;
            const href = `/${post.slug}`;
            return (
              <Reveal key={post.slug} variant="fade-up" delay={(i % 3) * 90}>
                <article className="group flex h-full flex-col">
                  <Link href={href} className="overflow-hidden rounded-2xl">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist-light">
                      {hero ? (
                        <Image
                          src={hero.src}
                          alt={hero.alt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
                        />
                      ) : null}
                    </div>
                  </Link>
                  <h2 className="mt-5 text-xl leading-snug">
                    <Link
                      href={href}
                      className="transition-colors duration-200 hover:text-mist-ink"
                    >
                      {post.h1}
                    </Link>
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    {excerpt(post.slug)}
                  </p>
                  <Link
                    href={href}
                    className="mt-4 text-sm font-semibold text-navy transition-colors duration-200 hover:text-mist-ink"
                  >
                    Read more
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <CTASection t={t} locale="en" />
    </>
  );
}
