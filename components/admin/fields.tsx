"use client";

import { Plus, X } from "lucide-react";

// Shared form controls, so every admin tab looks and behaves the same. Styled
// with the site's own palette rather than a generic dashboard grey.

export const inputClass =
  "w-full rounded-lg border border-mist bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-muted/50 focus:border-mist focus:ring-2 focus:ring-mist/25";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-mist-ink">
      {children}
    </span>
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>
  );
}

// Character counters exist because search engines truncate: roughly 60
// characters for a title and 160 for a description. The bar turns amber past
// the limit instead of blocking, since a long title is a judgement call.
export function Counter({ value, max }: { value: string; max: number }) {
  const n = value.length;
  const over = n > max;
  return (
    <span
      className={`text-xs tabular-nums ${over ? "font-semibold text-mist-ink" : "text-muted"}`}
    >
      {n}/{max}
      {over ? " · Google will cut this off" : ""}
    </span>
  );
}

export function Text({
  label,
  value,
  onChange,
  placeholder,
  hint,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  max?: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Label>{label}</Label>
        {max ? <Counter value={value} max={max} /> : null}
      </div>
      <input
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <Hint>{hint}</Hint> : null}
    </div>
  );
}

export function Area({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 3,
  max,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  max?: number;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Label>{label}</Label>
        {max ? <Counter value={value} max={max} /> : null}
      </div>
      <textarea
        className={`${inputClass} resize-y leading-relaxed ${mono ? "font-mono text-xs" : ""}`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <Hint>{hint}</Hint> : null}
    </div>
  );
}

// An editable list of plain strings (services, licences, social links).
export function ListEditor({
  label,
  items,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const set = (i: number, v: string) =>
    onChange(items.map((item, idx) => (idx === i ? v : item)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputClass}
              value={item}
              placeholder={placeholder}
              onChange={(e) => set(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove "${item || "empty row"}"`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-mist text-muted transition-colors duration-200 hover:border-mist hover:text-mist-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy transition-colors duration-200 hover:text-mist-ink"
      >
        <Plus className="h-4 w-4" /> Add another
      </button>
      {hint ? <Hint>{hint}</Hint> : null}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <h2 className="font-heading text-xl text-navy">{title}</h2>
      {subtitle ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{subtitle}</p>
      ) : null}
      <div className="mt-6 flex flex-col gap-5">{children}</div>
    </section>
  );
}
