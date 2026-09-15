// The content model for the 77 pages ported off Carrot.
//
// Karen's words and structure are preserved exactly; only the styling around
// them is ours. `html` fields carry a deliberately tiny subset of inline markup
// (<a>, <strong>, <em>, <br>) that the extractor sanitised on the way in, and
// all internal links were rewritten to relative paths so they survive the move.

export type InlineHtml = string;

export type PageBlock =
  | { t: "h2" | "h3" | "h4"; text: string }
  | { t: "p"; html: InlineHtml }
  | { t: "list"; ordered: boolean; items: InlineHtml[] }
  | { t: "cards"; items: { title: string; body: InlineHtml[] }[] }
  | {
      t: "image";
      src: string;
      alt: string;
      width: number;
      height: number;
      caption?: string;
    }
  | {
      // A row of people, each with a photo, a name, an optional role and an
      // optional run of prose. Rendered as equal columns on desktop and a
      // stack on mobile, which is what keeps the About page headshots the same
      // size even though the source photographs have different proportions.
      t: "team";
      items: {
        src: string;
        alt: string;
        width: number;
        height: number;
        name: string;
        role?: string;
        body?: InlineHtml[];
      }[];
    }
  | {
      // Certification marks and other small trust badges. These are emblems
      // rather than photographs, so they sit in a compact centred row instead
      // of taking a screen each.
      t: "badges";
      items: { src: string; alt: string; width: number; height: number }[];
    }
  | { t: "quote"; text: string };

export type PageKind = "page" | "blog" | "blogIndex";

export interface ContentPage {
  /** Carrot's slug, kept byte-for-byte so existing rankings and links transfer. */
  slug: string;
  kind: PageKind;
  title: string;
  description: string;
  h1: string;
  intro: InlineHtml[];
  hero: { src: string; alt: string; width: number; height: number } | null;
  blocks: PageBlock[];
  faq: { q: string; a: string }[];
}
