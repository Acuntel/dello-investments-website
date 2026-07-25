import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-navy pt-24">
      <div className="container-custom text-center">
        <p className="font-heading text-7xl italic text-gold">404</p>
        <h1 className="mt-4 text-3xl !text-white">
          This page has moved on — like a closed deal.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-white/70">
          The page you&apos;re looking for doesn&apos;t exist. Head back home or
          reach out — we answer seven days a week.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/" className="btn-gold">
            Back to Home
          </Link>
          <Link href="/contact" className="btn-outline-light">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
