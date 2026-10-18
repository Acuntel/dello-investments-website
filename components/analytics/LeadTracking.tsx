"use client";

import { useEffect } from "react";
import { captureFirstTouch, countEvent } from "@/lib/leadTracking";

// Notes where this tab's visitor first came from, and counts every tap on a
// phone link with ONE listener for the whole page, so tel: links inside blog
// posts and admin-edited content are covered without touching each one.
// Capture phase, so a component that stops click propagation can't hide a tap.
export default function LeadTracking() {
  useEffect(() => {
    captureFirstTouch();
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.('a[href^="tel:"]')) countEvent("tel-tap");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
