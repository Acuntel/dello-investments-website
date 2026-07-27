import Image from "next/image";
import { Check } from "lucide-react";
import type { PageBlock } from "@/lib/pages/types";
import Reveal from "@/components/ui/Reveal";

// Renders one of Karen's content blocks in the emerald design language. Her
// words are untouched; the treatment is ours. Each block type maps onto a
// pattern the home page already established, so a ported page and the home
// page read as one site.

function Prose({ html, className = "" }: { html: string; className?: string }) {
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
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-champagne/15">
            <Check className="h-3 w-3 text-champagne-ink" />
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
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald font-heading text-sm text-champagne">
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
          <div className="border-l border-champagne/40 pl-6">
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

function Figure({ block }: { block: Extract<PageBlock, { t: "image" }> }) {
  return (
    <Reveal variant="fade-up" className="relative mx-auto w-full max-w-2xl">
      {/* The offset champagne frame from the home page's Story section. */}
      <div
        className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl border border-champagne"
        aria-hidden
      />
      <Image
        src={block.src}
        alt={block.alt}
        width={block.width}
        height={block.height}
        sizes="(max-width: 768px) 100vw, 672px"
        className="relative rounded-2xl object-cover shadow-lift"
      />
      {block.caption ? (
        <figcaption className="relative mt-3 text-center text-xs text-muted">
          {block.caption}
        </figcaption>
      ) : null}
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
    case "quote":
      return (
        <Reveal variant="fade-up">
          <blockquote className="max-w-3xl border-l-2 border-champagne pl-6 font-heading text-xl italic text-emerald">
            {block.text}
          </blockquote>
        </Reveal>
      );
    default:
      return null;
  }
}
