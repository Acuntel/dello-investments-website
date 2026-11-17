"use client";

import { useState, FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { attribution, countEvent } from "@/lib/leadTracking";

// The commercial property form on /sell-commercial-property/. Labels, options
// and the thank-you line are Karen's final copy, word for word. It posts to the
// same /api/contact route as the residential form with kind "commercial", so
// leads land in /admin tagged "commercial" and reach GHL with the extra fields.
// Same honeypot as the residential form.

const PROPERTY_TYPES = [
  "Shopping or strip center",
  "Warehouse / industrial / flex",
  "Apartment building (5+ units)",
  "Self-storage",
  "Portfolio (several properties)",
  "Commercial note",
  "Other",
];

const LOAN_OPTIONS = ["No", "Yes, within 12 months", "Yes, later", "Not sure"];

const REQUIRED = "This field is required.";

export default function CommercialForm() {
  const [values, setValues] = useState({
    propertyType: "",
    address: "",
    occupancy: "",
    loanDue: "",
    name: "",
    phone: "",
    email: "",
    message: "",
    company: "", // honeypot
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  function set(field: keyof typeof values) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setValues({ ...values, [field]: e.target.value });
      if (errors[field]) setErrors({ ...errors, [field]: "" });
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!values.address.trim()) next.address = REQUIRED;
    if (!values.name.trim()) next.name = REQUIRED;
    if (!values.phone.trim()) next.phone = REQUIRED;
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = "Please enter a valid email address.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          kind: "commercial",
          ...attribution(),
        }),
      });
      if (!res.ok) throw new Error("failed");
      countEvent("form-submit");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-mist" />
        <p className="text-ink">
          Thanks. Alexa will look this over and get back to you within one
          business day. If it&apos;s urgent, call or text (312) 975-5557.
        </p>
      </div>
    );
  }

  const inputCls = (field: string) =>
    `w-full rounded-lg border bg-white px-4 py-3.5 text-base text-ink outline-none transition-colors focus:border-mist ${
      errors[field] ? "border-red-400" : "border-mist"
    }`;

  const field = (
    name: keyof typeof values,
    label: string,
    control: React.ReactNode,
    help?: string,
  ) => (
    <div>
      <label htmlFor={`cf-${name}`} className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
      </label>
      {control}
      {help ? (
        <p id={`cf-${name}-help`} className="mt-1 text-xs text-muted">
          {help}
        </p>
      ) : null}
      {errors[name] && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-2xl bg-white p-6 text-left shadow-card sm:p-8"
    >
      {/* Honeypot, visually hidden, tab-skipped, ignored by real users */}
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

      {field(
        "propertyType",
        "What kind of property?",
        <select
          id="cf-propertyType"
          value={values.propertyType}
          onChange={set("propertyType")}
          className={inputCls("propertyType")}
        >
          <option value="">Choose one</option>
          {PROPERTY_TYPES.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>,
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "address",
          "Where is it?",
          <input
            id="cf-address"
            type="text"
            maxLength={300}
            aria-describedby="cf-address-help"
            value={values.address}
            onChange={set("address")}
            className={inputCls("address")}
          />,
          "City and state is enough to start",
        )}
        {field(
          "occupancy",
          "About how full is it?",
          <input
            id="cf-occupancy"
            type="text"
            maxLength={100}
            aria-describedby="cf-occupancy-help"
            value={values.occupancy}
            onChange={set("occupancy")}
            className={inputCls("occupancy")}
          />,
          "A rough percent is fine",
        )}
      </div>
      {field(
        "loanDue",
        "Is a loan coming due?",
        <select
          id="cf-loanDue"
          value={values.loanDue}
          onChange={set("loanDue")}
          className={inputCls("loanDue")}
        >
          <option value="">Choose one</option>
          {LOAN_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>,
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "name",
          "Full name",
          <input
            id="cf-name"
            type="text"
            autoComplete="name"
            maxLength={200}
            value={values.name}
            onChange={set("name")}
            className={inputCls("name")}
          />,
        )}
        {field(
          "phone",
          "Phone number",
          <input
            id="cf-phone"
            type="tel"
            autoComplete="tel"
            maxLength={50}
            value={values.phone}
            onChange={set("phone")}
            className={inputCls("phone")}
          />,
        )}
      </div>
      {field(
        "email",
        "Email address",
        <input
          id="cf-email"
          type="email"
          autoComplete="email"
          maxLength={200}
          value={values.email}
          onChange={set("email")}
          className={inputCls("email")}
        />,
      )}
      {field(
        "message",
        "Anything else we should know?",
        <textarea
          id="cf-message"
          maxLength={5000}
          rows={4}
          aria-describedby="cf-message-help"
          value={values.message}
          onChange={set("message")}
          className={`${inputCls("message")} resize-y`}
        />,
        "Optional",
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          Something went wrong. Please try again or call us directly.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-mist w-full disabled:opacity-60 sm:w-auto sm:self-start"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send my property details"
        )}
      </button>
    </form>
  );
}
