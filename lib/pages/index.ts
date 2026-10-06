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
 * Every blog post opens with a "By Karen…" paragraph. Lift it out of the body
 * so the page can show it under the title, beside the date.
 */
export function bylineFor(
  page: ContentPage,
  blocks: PageBlock[],
): { byline: string | null; blocks: PageBlock[] } {
  if (page.kind !== "blog") return { byline: null, blocks };
  const first = blocks[0];
  if (
    first?.t === "p" &&
    /^By\s/i.test(first.html.replace(/<[^>]+>/g, "").trim())
  ) {
    return { byline: first.html, blocks: blocks.slice(1) };
  }
  return { byline: null, blocks };
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

/**
 * A rendered row inside a section. Most blocks stand on their own, but a body
 * photograph is paired with the prose next to it so that desktop readers get
 * image beside text instead of a single column where every picture takes a
 * screen to itself. On narrow screens the pair simply stacks.
 */
export type SectionRow =
  | { kind: "block"; block: PageBlock }
  | {
      kind: "media";
      image: Extract<PageBlock, { t: "image" }>;
      side: PageBlock[];
      /** true puts the photograph on the right and the prose on the left. */
      flip: boolean;
    };

const SIDE_TYPES = new Set(["p", "list"]);
/** How much prose can sit beside one photograph before the column gets tall. */
const MAX_SIDE_BLOCKS = 3;

function isSide(block: PageBlock): boolean {
  return SIDE_TYPES.has(block.t);
}

export function pairMedia(blocks: PageBlock[]): SectionRow[] {
  const rows: SectionRow[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.t !== "image") {
      rows.push({ kind: "block", block });
      continue;
    }

    // Prefer the prose that follows the photograph, which is how Karen's pages
    // are written: a picture introduces the passage underneath it.
    const side: PageBlock[] = [];
    while (
      side.length < MAX_SIDE_BLOCKS &&
      i + 1 < blocks.length &&
      isSide(blocks[i + 1])
    ) {
      side.push(blocks[i + 1]);
      i++;
    }
    if (side.length) {
      rows.push({ kind: "media", image: block, side, flip: false });
      continue;
    }

    // Nothing after it, so fall back to the prose immediately before it and
    // move the photograph to the right of that text.
    const before: PageBlock[] = [];
    while (
      before.length < MAX_SIDE_BLOCKS &&
      rows.length > 1 &&
      rows[rows.length - 1].kind === "block" &&
      isSide((rows[rows.length - 1] as { block: PageBlock }).block)
    ) {
      before.unshift((rows.pop() as { block: PageBlock }).block);
    }
    if (!before.length) {
      // No prose on either side of it, so it stays a single contained figure
      // centred in the column rather than a half-empty two-column row.
      rows.push({ kind: "block", block });
      continue;
    }
    rows.push({ kind: "media", image: block, side: before, flip: true });
  }

  return rows;
}
