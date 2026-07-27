"use client";

import { useState } from "react";
import Image from "next/image";
import type { Locale } from "@/lib/content";
import { IMAGES, defaultAlt } from "@/lib/admin/defaults";
import type { Overrides } from "@/lib/admin/types";
import { Text } from "./fields";
import LocaleTabs from "./LocaleTabs";

export default function AdminImages({
  overrides,
  onChange,
}: {
  overrides: Overrides;
  onChange: (next: Overrides) => void;
}) {
  const [locale, setLocale] = useState<Locale>("en");

  const setAlt = (id: string, value: string) => {
    const current = overrides.images[id] ?? { alt: {}, title: "" };
    onChange({
      ...overrides,
      images: {
        ...overrides.images,
        [id]: { ...current, alt: { ...current.alt, [locale]: value } },
      },
    });
  };

  const setTitle = (id: string, value: string) => {
    const current = overrides.images[id] ?? { alt: {}, title: "" };
    onChange({
      ...overrides,
      images: { ...overrides.images, [id]: { ...current, title: value } },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-heading text-xl text-emerald">
          Photograph descriptions
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
          Alt text describes a photograph to Google and reads it aloud to anyone
          using a screen reader. Describe what is actually in the picture, in a
          normal sentence. The title is the small label that appears when
          someone hovers over it.
        </p>
        <div className="mt-6">
          <LocaleTabs value={locale} onChange={setLocale} />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {IMAGES.map((img) => {
          const over = overrides.images[img.id];
          const fallback = defaultAlt(img.id, locale);
          return (
            <section
              key={img.id}
              className="rounded-2xl bg-white p-5 shadow-card sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row">
                <div
                  className={`relative h-32 w-full shrink-0 overflow-hidden rounded-xl sm:w-44 ${
                    img.onDark ? "bg-emerald" : "bg-sage-faint"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    sizes="176px"
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  <div>
                    <h3 className="font-heading text-lg text-emerald">
                      {img.label}
                    </h3>
                    <p className="text-sm text-muted">{img.where}</p>
                    {img.decorative ? (
                      <p className="mt-1.5 text-xs leading-relaxed text-muted">
                        This one is decoration behind the words. It is
                        deliberately left blank so screen readers skip it, but
                        you can describe it if you would rather.
                      </p>
                    ) : null}
                  </div>
                  <Text
                    label="Alt text"
                    value={over?.alt?.[locale] ?? ""}
                    max={125}
                    placeholder={fallback || "Describe the photograph"}
                    onChange={(v) => setAlt(img.id, v)}
                  />
                  <Text
                    label="Image title"
                    value={over?.title ?? ""}
                    placeholder="Optional"
                    onChange={(v) => setTitle(img.id, v)}
                  />
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
