"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type Item = { q: string; a: string; link?: { text: string; href: string } };

// Links the first occurrence of item.link.text inside the answer; the words
// themselves never change.
function Answer({ item }: { item: Item }) {
  const at = item.link ? item.a.indexOf(item.link.text) : -1;
  if (!item.link || at < 0) return <>{item.a}</>;
  const end = at + item.link.text.length;
  return (
    <>
      {item.a.slice(0, at)}
      <Link href={item.link.href} className="underline decoration-mist underline-offset-4 hover:text-navy">
        {item.link.text}
      </Link>
      {item.a.slice(end)}
    </>
  );
}

export default function FAQAccordion({
  items,
}: {
  items: Item[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-mist-light rounded-2xl bg-white shadow-card">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-mist-faint"
            >
              <span className="font-heading text-lg text-navy">{item.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-mist-ink transition-transform duration-300 ease-smooth ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-smooth ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 leading-relaxed text-muted">
                  <Answer item={item} />
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
