"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-seafoam bg-white/90 text-navy shadow-card backdrop-blur transition-transform duration-300 ease-smooth hover:scale-105 sm:left-6"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
