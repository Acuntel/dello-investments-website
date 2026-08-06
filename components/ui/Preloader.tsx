"use client";

import { useEffect, useState } from "react";

// Navy curtain with the wordmark and a growing mist line, then slides up
// (Alliance-style entrance). Shows once per tab session.
export default function Preloader() {
  const [dismissed, setDismissed] = useState(false);
  const [skipped, setSkipped] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("dello-preloaded")) return;
    sessionStorage.setItem("dello-preloaded", "1");
    setSkipped(false);
    const timer = setTimeout(() => setDismissed(true), 1900);
    return () => clearTimeout(timer);
  }, []);

  if (skipped) return null;

  return (
    <div className={`preloader ${dismissed ? "dismissed" : ""}`} aria-hidden>
      <p className="preloader-text font-heading text-2xl tracking-[0.18em] text-white">
        DELLO <span className="text-mist">INVESTMENTS</span>
      </p>
      <div className="preloader-line mt-5" />
    </div>
  );
}
