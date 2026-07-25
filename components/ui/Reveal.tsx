"use client";

import { useEffect, useRef, ReactNode } from "react";

// Scroll-reveal driven by the [data-reveal] CSS in globals.css — the same
// easing/stagger system as the Alliance site. Wrap any block; the element
// animates once when ~15% enters the viewport.
interface RevealProps {
  children: ReactNode;
  variant?: "fade-up" | "fade-left" | "fade-right" | "scale";
  delay?: number; // ms
  className?: string;
  as?: "div" | "section" | "li" | "span";
}

export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      data-reveal={variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
