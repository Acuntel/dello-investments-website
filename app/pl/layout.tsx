// The root layout owns <html lang="en">; stamp the correct lang for the
// Polish tree as early as possible for screen readers. hreflang alternates
// in metadata carry the SEO signal.
export default function PlLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang = "pl";`,
        }}
      />
      {children}
    </>
  );
}
