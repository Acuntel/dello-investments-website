"use client";

import { useState, FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { SiteDict } from "@/lib/content/types";

// Localized cash-offer form. Includes a honeypot ("company") that stays
// invisible to humans; the API silently accepts bot submissions that fill it.
export default function ContactForm({ t }: { t: SiteDict["contactPage"] }) {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    message: "",
    company: "", // honeypot
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  function set(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues({ ...values, [field]: e.target.value });
      if (errors[field]) setErrors({ ...errors, [field]: "" });
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = t.required;
    if (!values.phone.trim()) next.phone = t.required;
    if (!values.address.trim()) next.address = t.required;
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = t.invalidEmail;
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-gold" />
        <h3 className="mb-2 text-2xl">{t.successTitle}</h3>
        <p className="text-muted">{t.successBody}</p>
      </div>
    );
  }

  const inputCls = (field: string) =>
    `w-full rounded-lg border px-4 py-3.5 text-base outline-none transition-colors focus:border-gold ${
      errors[field] ? "border-red-400" : "border-seafoam"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Honeypot — visually hidden, tab-skipped, ignored by real users */}
      <div
        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label>
          Company
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.company}
            onChange={set("company")}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <input
            type="text"
            placeholder={t.name}
            aria-label={t.name}
            maxLength={200}
            value={values.name}
            onChange={set("name")}
            className={inputCls("name")}
          />
          {errors.name && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <input
            type="tel"
            placeholder={t.phone}
            aria-label={t.phone}
            maxLength={50}
            value={values.phone}
            onChange={set("phone")}
            className={inputCls("phone")}
          />
          {errors.phone && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>
      </div>
      <div>
        <input
          type="email"
          placeholder={t.email}
          aria-label={t.email}
          maxLength={200}
          value={values.email}
          onChange={set("email")}
          className={inputCls("email")}
        />
        {errors.email && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <input
          type="text"
          placeholder={t.addressField}
          aria-label={t.addressField}
          maxLength={300}
          value={values.address}
          onChange={set("address")}
          className={inputCls("address")}
        />
        {errors.address && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.address}
          </p>
        )}
      </div>
      <textarea
        placeholder={t.messagePlaceholder}
        aria-label={t.message}
        maxLength={5000}
        rows={4}
        value={values.message}
        onChange={set("message")}
        className="w-full resize-y rounded-lg border border-seafoam px-4 py-3.5 text-base outline-none transition-colors focus:border-gold"
      />
      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {t.errorGeneric}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-gold w-full disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.submitting}
          </>
        ) : (
          t.submit
        )}
      </button>
    </form>
  );
}
