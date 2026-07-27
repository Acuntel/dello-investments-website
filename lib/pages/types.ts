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
