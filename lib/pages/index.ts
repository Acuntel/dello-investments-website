import raw from "./pages.json";
import type { ContentPage, PageBlock } from "./types";

export type { ContentPage, PageBlock } from "./types";

// SERVER ONLY. pages.json is ~700kb of Karen's copy; it must never be pulled
// into a client bundle. Every consumer here is a server component or a route.
const PAGES = raw as unknown as ContentPage[];

const BY_SLUG = new Map(PAGES.map((p) => [p.slug, p]));

export function getContentPage(slug: string): ContentPage | undefined {
  return BY_SLUG.get(slug);
}

/** Top-level pages, i.e. everything that is not the blog. */
export function topLevelPages(): ContentPage[] {
  return PAGES.filter((p) => p.kind === "page");
}

export function blogPosts(): ContentPage[] {
  return PAGES.filter((p) => p.kind === "blog");
}

export function allContentPages(): ContentPage[] {
  return PAGES;
}

/** Every ported URL path, used for the sitemap and for static params. */
export function allContentPaths(): string[] {
  return PAGES.map((p) => `/${p.slug}`);
}

// A blog post has no hero image of its own, but its opening illustration works
// as one. Promote it rather than leaving the post with a bare colour band.
export function heroFor(page: ContentPage) {
  if (page.hero) return { hero: page.hero, blocks: page.blocks };
  const i = page.blocks.findIndex((b) => b.t === "image");
  if (page.kind !== "blog" || i === -1)
    return { hero: null, blocks: page.blocks };
  const first = page.blocks[i] as Extract<PageBlock, { t: "image" }>;
  return {
    hero: {
      src: first.src,
      alt: first.alt,
      width: first.width,
      height: first.height,
    },
    blocks: page.blocks.filter((_, idx) => idx !== i),
  };
}

/**
 * Split a flat block list into sections at each h2, so the renderer can give
 * them alternating backgrounds and real vertical rhythm instead of one long
 * undifferentiated column.
 */
const HEADINGS = new Set(["h2", "h3", "h4"]);

export function sectionise(blocks: PageBlock[]): PageBlock[][] {
  const sections: PageBlock[][] = [];
  let current: PageBlock[] = [];
  for (const block of blocks) {
    if (block.t === "h2" && current.length) {
      sections.push(current);
      current = [];
    }
    current.push(block);
  }
  if (current.length) sections.push(current);

  // Drop sections that are nothing but a heading. Carrot's FAQ answers lived in
  // <details> elements, which we lift out and re-render as our own accordion,
  // and that leaves the original "Frequently Asked Questions" h2 stranded above
  // an empty band. Same for any other heading whose content did not survive.
  return sections.filter((section) => section.some((b) => !HEADINGS.has(b.t)));
}
