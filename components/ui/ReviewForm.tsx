"use client";

import { useEffect, useState, FormEvent } from "react";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { reviewConfig } from "@/lib/review.config";

// The review form on /review/ (see /review-generator in the Blueprint).
// - Who they are comes from the link GHL sends (?name=&email=&cid=), never
//   from fields they have to fill in. Parameters are untrusted: they are only
//   ever rendered as React text, and the greeting is length-capped.
// - Tapping a star only selects it. Everything happens on submit.
// - 4-5: record it with GHL, copy their words to the clipboard, go to Google.
// - 1-3: record it with GHL and thank them. No Google link on this path
//   (Karen's choice, 22 November 2026).
// - No link parameters (the QR path) and 1-3: ask, optionally, who to call.

const QUESTION =
  "On a 1-5 scale, how likely are you to refer us to your friends and family?";

type Who = { name: string; email: string; cid: string };

export default function ReviewForm() {
  const [who, setWho] = useState<Who>({ name: "", email: "", cid: "" });
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "thanks" | "leaving">("idle");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const get = (k: string, n: number) => (q.get(k) || "").trim().slice(0, n);
    setWho({ name: get("name", 200), email: get("email", 200), cid: get("cid", 100) });
  }, []);

  const firstName = who.name.split(/\s+/)[0]?.slice(0, 30) || "";
  const fromLink = Boolean(who.name || who.email || who.cid);
  const happy = rating >= reviewConfig.happyMin;
  const chosen = rating > 0;

  async function record() {
    try {
      const res = await fetch("/api/review/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          feedback,
          ...who,
          contactName: fromLink ? "" : contactName,
          contactMethod: fromLink ? "" : contactMethod,
          company,
        }),
        signal: AbortSignal.timeout(6000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!chosen) {
      setError("Please pick a number from 1 to 5.");
      return;
    }
    if (!happy && !feedback.trim()) {
      setError("Please tell us what went wrong, so we can fix it.");
      return;
    }
    setError("");
    setStatus("sending");

    if (happy) {
      // Record the win first, but never hold a 5-star review hostage to it.
      await record();
      if (feedback.trim()) {
        try {
          await navigator.clipboard.writeText(feedback.trim());
        } catch {
          // Clipboard blocked (http, old browser, permissions). Carry on.
        }
      }
      setStatus("leaving");
      window.location.href = reviewConfig.googleReviewUrl;
      return;
    }

    const ok = await record();
    if (!ok) {
      setStatus("idle");
      setError("That didn't send. Please try again, or call or text us at (312) 975-5557.");
      return;
    }
    setStatus("thanks");
  }

  if (status === "thanks") {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-mist-ink" />
        <h1 className="mb-3 font-heading text-2xl font-bold text-navy">Thank you for telling us.</h1>
        <p className="text-ink">
          Karen and Alexa read every one of these personally, and one of us will reach out to make it right.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-card sm:p-8"
    >
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
      />

      <div>
        <p className="mb-2 text-sm font-semibold text-mist-ink">
          {firstName ? <>Hi {firstName} &middot; 30 seconds</> : <>30 seconds</>}
        </p>
        <h1 className="font-heading text-xl font-bold leading-snug text-navy sm:text-2xl">{QUESTION}</h1>
      </div>

      <div role="radiogroup" aria-label="Your rating, 1 to 5" className="flex justify-between gap-2 sm:justify-start sm:gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} out of 5`}
            onClick={() => {
              setRating(n);
              setError("");
            }}
            className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl border-2 transition-colors sm:h-16 sm:w-16 ${
              n <= rating ? "border-navy bg-navy text-white" : "border-mist bg-white text-navy hover:border-navy"
            }`}
          >
            <Star className={`h-6 w-6 ${n <= rating ? "fill-white" : ""}`} aria-hidden="true" />
            <span className="mt-0.5 text-xs font-semibold">{n}</span>
          </button>
        ))}
      </div>

      {chosen && (
        <div>
          <label htmlFor="rv-feedback" className="mb-1.5 block text-sm font-semibold text-navy">
            {happy ? "What stood out? (optional)" : "What went wrong?"}
          </label>
          <textarea
            id="rv-feedback"
            rows={5}
            maxLength={3000}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={
              happy
                ? "What did we help you with, and how did it go?"
                : "Tell us what happened. We read every word."
            }
            className="w-full rounded-lg border border-mist bg-white px-4 py-3.5 text-base text-ink outline-none transition-colors focus:border-navy"
          />
          {happy && (
            <p className="mt-1.5 text-xs text-muted">
              When you continue, we&apos;ll copy what you wrote so you can paste it into your Google review in one tap.
            </p>
          )}
        </div>
      )}

      {chosen && !happy && !fromLink && (
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-sm font-semibold text-navy">
            So we can actually fix this, who should we call? (optional)
          </legend>
          <input
            type="text"
            aria-label="Your name"
            placeholder="Your name"
            maxLength={200}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-lg border border-mist bg-white px-4 py-3.5 text-base text-ink outline-none focus:border-navy"
          />
          <input
            type="text"
            aria-label="Phone or email"
            placeholder="Phone or email"
            maxLength={200}
            value={contactMethod}
            onChange={(e) => setContactMethod(e.target.value)}
            className="w-full rounded-lg border border-mist bg-white px-4 py-3.5 text-base text-ink outline-none focus:border-navy"
          />
        </fieldset>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status !== "idle"}
        className="btn-mist w-full disabled:opacity-60 sm:w-auto sm:self-start"
      >
        {status === "sending" || status === "leaving" ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {happy ? "Opening Google…" : "Sending…"}
          </span>
        ) : happy ? (
          "Continue to Google"
        ) : (
          "Send"
        )}
      </button>
    </form>
  );
}
