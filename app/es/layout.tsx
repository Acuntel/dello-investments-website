// The root layout owns <html lang="en">; stamp the correct lang for the
// Spanish tree as early as possible for screen readers. hreflang alternates
// in metadata carry the SEO signal.
export default function EsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang = "es";`,
        }}
      />
      {children}
    </>
  );
}
