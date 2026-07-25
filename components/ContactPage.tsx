import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { getDict, type Locale } from "@/lib/content";
import { CONTACT } from "@/lib/constants";
import { generateBreadcrumbSchema } from "@/lib/schema";
import ContactForm from "@/components/ui/ContactForm";
import Reveal from "@/components/ui/Reveal";

export default function ContactPage({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const c = t.contactPage;
  const hours =
    locale === "es"
      ? CONTACT.hoursEs
      : locale === "pl"
        ? CONTACT.hoursPl
        : CONTACT.hoursEn;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: "Home", url: locale === "en" ? "/" : `/${locale}` },
              { name: c.label },
            ]),
          ),
        }}
      />
      {/* Navy hero band keeps the fixed header legible */}
      <section className="bg-navy pb-24 pt-40">
        <div className="container-custom hero-stagger">
          <p className="section-label !text-gold">{c.label}</p>
          <h1 className="max-w-2xl text-4xl !text-white sm:text-5xl">
            {c.title}
          </h1>
          <p className="mt-5 max-w-xl text-white/70">{c.subtitle}</p>
        </div>
      </section>

      <section className="container-custom relative z-10 -mt-12 grid gap-8 pb-24 lg:grid-cols-5">
        <Reveal
          variant="fade-up"
          className="rounded-2xl bg-white p-7 shadow-lift sm:p-10 lg:col-span-3"
        >
          <ContactForm t={c} />
        </Reveal>

        <Reveal
          variant="fade-up"
          delay={120}
          className="h-fit rounded-2xl bg-seafoam-light p-7 sm:p-10 lg:col-span-2"
        >
          <h2 className="text-2xl">{c.directLabel}</h2>
          <p className="mt-2 text-sm text-muted">{c.orCall}</p>
          <ul className="mt-7 flex flex-col gap-5 text-sm">
            <li>
              <a
                href={CONTACT.phoneHref}
                className="flex items-center gap-3 font-semibold text-navy transition-colors hover:text-gold-ink"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <Phone className="h-4 w-4 text-gold-ink" />
                </span>
                {CONTACT.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-3 font-medium text-ink transition-colors hover:text-gold-ink"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <Mail className="h-4 w-4 text-gold-ink" />
                </span>
                {CONTACT.email}
              </a>
            </li>
            <li className="flex items-center gap-3 text-ink">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <MapPin className="h-4 w-4 text-gold-ink" />
              </span>
              {CONTACT.address}
            </li>
            <li className="flex items-center gap-3 text-ink">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <Clock className="h-4 w-4 text-gold-ink" />
              </span>
              {hours}
            </li>
          </ul>
        </Reveal>
      </section>
    </>
  );
}
