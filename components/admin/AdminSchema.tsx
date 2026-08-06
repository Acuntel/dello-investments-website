"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { BusinessInfo, Overrides } from "@/lib/admin/types";
import { Area, Card, ListEditor, Text } from "./fields";

// Structured data is a set of claims Google treats as fact, and a wrong one is
// a manual-action risk. The copy here keeps that front of mind without turning
// the form into a lecture.
export default function AdminSchema({
  overrides,
  onChange,
}: {
  overrides: Overrides;
  onChange: (next: Overrides) => void;
}) {
  const b = overrides.business;
  const set = (patch: Partial<BusinessInfo>) =>
    onChange({ ...overrides, business: { ...b, ...patch } });

  const extra = b.extraJsonLd?.trim() ?? "";
  let extraValid: boolean | null = null;
  if (extra) {
    try {
      JSON.parse(extra);
      extraValid = true;
    } catch {
      extraValid = false;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Card
        title="What Google is told about the business"
        subtitle="These details become the structured data on every page, which is how Google builds the business panel next to your name. Everything here is a claim Google treats as fact, so keep it true."
      >
        <Text
          label="Business name"
          value={b.name}
          onChange={(v) => set({ name: v })}
        />
        <Area
          label="Description"
          value={b.description}
          rows={4}
          onChange={(v) => set({ description: v })}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Text
            label="Phone"
            value={b.telephone}
            onChange={(v) => set({ telephone: v })}
            hint="International format, e.g. +13129755557"
          />
          <Text
            label="Email"
            value={b.email}
            onChange={(v) => set({ email: v })}
          />
        </div>
      </Card>

      <Card title="Address and hours">
        <Text
          label="Street address"
          value={b.streetAddress}
          onChange={(v) => set({ streetAddress: v })}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          <Text
            label="City"
            value={b.addressLocality}
            onChange={(v) => set({ addressLocality: v })}
          />
          <Text
            label="State"
            value={b.addressRegion}
            onChange={(v) => set({ addressRegion: v })}
          />
          <Text
            label="ZIP"
            value={b.postalCode}
            onChange={(v) => set({ postalCode: v })}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Text
            label="Opens"
            value={b.opens}
            onChange={(v) => set({ opens: v })}
            hint="24-hour clock, e.g. 09:00"
          />
          <Text
            label="Closes"
            value={b.closes}
            onChange={(v) => set({ closes: v })}
            hint="24-hour clock, e.g. 17:00"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Text
            label="Year founded"
            value={b.foundingDate}
            onChange={(v) => set({ foundingDate: v })}
          />
          <Text
            label="Price range"
            value={b.priceRange}
            onChange={(v) => set({ priceRange: v })}
          />
        </div>
      </Card>

      <Card
        title="Reviews"
        subtitle="Only ever put your real Google review numbers here. Inflated ratings are the fastest way to get structured data penalised, and the stars pulled entirely."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Text
            label="Rating"
            value={b.ratingValue}
            onChange={(v) => set({ ratingValue: v })}
            hint="Out of 5, e.g. 5.0"
          />
          <Text
            label="Number of reviews"
            value={b.reviewCount}
            onChange={(v) => set({ reviewCount: v })}
          />
        </div>
      </Card>

      <Card title="Services offered">
        <ListEditor
          label="Services"
          items={b.services}
          onChange={(services) => set({ services })}
          placeholder="e.g. As-is cash home purchase"
        />
      </Card>

      <Card title="Licences and certifications">
        <ListEditor
          label="Credentials"
          items={b.credentials}
          onChange={(credentials) => set({ credentials })}
          placeholder="e.g. Illinois Real Estate Broker License"
        />
      </Card>

      <Card title="Profiles elsewhere">
        <ListEditor
          label="Links"
          items={b.sameAs}
          onChange={(sameAs) => set({ sameAs })}
          placeholder="https://www.facebook.com/..."
          hint="Facebook, Instagram, YouTube, your Google Business Profile. These tell Google those pages are the same business as this one."
        />
      </Card>

      <Card
        title="Extra schema"
        subtitle="For anything the boxes above do not cover. Paste one JSON-LD object, or a list of them, and it ships alongside the rest."
      >
        <Area
          label="Additional JSON-LD"
          value={b.extraJsonLd}
          rows={10}
          mono
          placeholder={
            '{\n  "@context": "https://schema.org",\n  "@type": "Service",\n  "name": "..."\n}'
          }
          onChange={(v) => set({ extraJsonLd: v })}
        />
        {extraValid === true ? (
          <p className="flex items-center gap-2 text-sm text-steel">
            <CheckCircle2 className="h-4 w-4" /> Valid JSON. This will be added
            to every page.
          </p>
        ) : null}
        {extraValid === false ? (
          <p className="flex items-start gap-2 text-sm text-mist-ink">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> This is not
            valid JSON yet, so it will not save. Check for a missing comma,
            bracket, or quote mark.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
