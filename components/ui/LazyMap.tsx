"use client";

import { useEffect, useRef, useState } from "react";

// The Google Maps embed is the single heaviest thing on the About page, so it
// is not mounted at all until the card is close to the viewport. Until then the
// visitor sees a quiet placeholder and the page has paid nothing for it.
export default function LazyMap({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative h-[320px] w-full overflow-hidden rounded-2xl bg-mist-light shadow-card sm:h-[400px]"
    >
      {show ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen={false}
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-sm text-mist-ink">
          The map is loading.
        </span>
      )}
    </div>
  );
}
