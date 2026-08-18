"use client";

import { LOCALES, type Locale } from "@/lib/content";

const NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

// The site is bilingual, so anything Google reads exists twice. These
// tabs make that obvious instead of hiding half of the site.
export default function LocaleTabs({
  value,
  onChange,
}: {
  value: Locale;
  onChange: (l: Locale) => void;
}) {
  return (
    <div className="flex gap-6 border-b border-mist">
      {LOCALES.map((l) => {
        const active = l === value;
        return (
          <button
            key={l}
            type="button"
            onClick={() => onChange(l)}
            aria-current={active ? "true" : undefined}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-semibold transition-colors duration-200 ${
              active
                ? "border-mist text-navy"
                : "border-transparent text-muted hover:text-navy"
            }`}
          >
            {NAMES[l]}
          </button>
        );
      })}
    </div>
  );
}
