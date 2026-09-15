import Image from "next/image";
import { Check } from "lucide-react";
import type { PageBlock } from "@/lib/pages/types";
import Reveal from "@/components/ui/Reveal";

// Renders one of Karen's content blocks in the navy design language. Her
// words are untouched; the treatment is ours. Each block type maps onto a
// pattern the home page already established, so a ported page and the home
// page read as one site.

export function Prose({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  return (
    <p
      className={`rich leading-relaxed text-muted ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-ink">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mist/15">
            <Check className="h-3 w-3 text-mist-ink" />
          </span>
          <span
            className="rich leading-relaxed"
            dangerouslySetInnerHTML={{ __html: item }}
          />
        </li>
      ))}
    </ul>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-sm text-mist">
            {i + 1}
          </span>
          <span
            className="rich pt-0.5 text-sm leading-relaxed text-muted"
            dangerouslySetInnerHTML={{ __html: item }}
          />
        </li>
      ))}
    </ol>
  );
}

function Cards({ items }: { items: { title: string; body: string[] }[] }) {
  return (
    <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={i} variant="fade-up" delay={(i % 2) * 90}>
          <div className="border-l border-mist/40 pl-6">
            <h3 className="text-lg">{item.title}</h3>
            {item.body.map((line, j) => (
              <Prose key={j} html={line} className="mt-2.5 text-sm" />
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

// Body photographs are held to the same width the home page uses for the
// "Why Chicago homeowners choose Dello." photograph, so an interior page never
// hands a visitor one enormous image per screen.
export function Figure({
  block,
  reveal = "fade-up",
}: {
  block: Extract<PageBlock, { t: "image" }>;
  reveal?: "fade-up" | "fade-left" | "fade-right";
}) {
  return (
    <Reveal variant={reveal} className="relative mx-auto w-full max-w-md">
      {/* The offset mist frame from the home page's Story section. */}
      <div
        className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl border border-mist"
        aria-hidden
      />
      <Image
        src={block.src}
        alt={block.alt}
        width={block.width}
        height={block.height}
        sizes="(max-width: 768px) 90vw, 448px"
        className="relative rounded-2xl object-cover shadow-card"
      />
      {block.caption ? (
        <figcaption className="relative mt-3 text-center text-xs text-muted">
          {block.caption}
        </figcaption>
      ) : null}
    </Reveal>
  );
}

// Equal columns for the people on the team. The photographs Karen supplies have
// different proportions, so every portrait is cropped into an identical
// fixed-ratio box rather than being allowed to set its own height.
function Team({
  items,
}: {
  items: Extract<PageBlock, { t: "team" }>["items"];
}) {
  const columns =
    items.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid gap-x-8 gap-y-12 ${columns}`}>
      {items.map((member, i) => (
        <Reveal key={member.name} variant="fade-up" delay={(i % 3) * 90}>
          <div className="mx-auto w-full max-w-sm">
            <div className="relative">
              <div
                className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl border border-mist"
                aria-hidden
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-card">
                <Image
                  src={member.src}
                  alt={member.alt}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
            <h3 className="mt-7 text-xl">{member.name}</h3>
            {member.role ? (
              <p
                className="rich mt-1 text-sm font-medium text-mist-ink"
                dangerouslySetInnerHTML={{ __html: member.role }}
              />
            ) : null}
            {member.body?.map((line, j) => (
              <Prose key={j} html={line} className="mt-3 text-sm" />
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

// Certification marks. These are emblems, not photographs, so they sit small
// and centred in one row instead of taking a screen each.
function Badges({
  items,
}: {
  items: Extract<PageBlock, { t: "badges" }>["items"];
}) {
  return (
    <Reveal variant="fade-up">
      <div className="mx-auto grid max-w-lg grid-cols-3 items-center gap-6 sm:gap-10">
        {items.map((badge) => (
          <Image
            key={badge.src}
            src={badge.src}
            alt={badge.alt}
            width={badge.width}
            height={badge.height}
            sizes="170px"
            className="mx-auto h-auto w-full max-w-[140px] object-contain sm:max-w-[170px]"
          />
        ))}
      </div>
    </Reveal>
  );
}

export default function Block({ block }: { block: PageBlock }) {
  switch (block.t) {
    case "h2":
      return (
        <Reveal variant="fade-up">
          <h2 className="max-w-3xl text-3xl sm:text-4xl">{block.text}</h2>
        </Reveal>
      );
    case "h3":
      return (
        <Reveal variant="fade-up">
          <h3 className="max-w-3xl text-xl">{block.text}</h3>
        </Reveal>
      );
    case "h4":
      return (
        <Reveal variant="fade-up">
          <h4 className="max-w-3xl text-lg">{block.text}</h4>
        </Reveal>
      );
    case "p":
      return (
        <Reveal variant="fade-up">
          <Prose html={block.html} className="max-w-3xl" />
        </Reveal>
      );
    case "list":
      return (
        <Reveal variant="fade-up" className="max-w-3xl">
          {block.ordered ? (
            <Steps items={block.items} />
          ) : (
            <Bullets items={block.items} />
          )}
        </Reveal>
      );
    case "cards":
      return <Cards items={block.items} />;
    case "image":
      return <Figure block={block} />;
    case "team":
      return <Team items={block.items} />;
    case "badges":
      return <Badges items={block.items} />;
    case "quote":
      return (
        <Reveal variant="fade-up">
          <blockquote className="max-w-3xl border-l-2 border-mist pl-6 font-heading text-xl italic text-navy">
            {block.text}
          </blockquote>
        </Reveal>
      );
    default:
      return null;
  }
}
