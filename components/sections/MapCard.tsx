import { MapPin, Phone, Star, Clock } from "lucide-react";
import { CONTACT } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";
import LazyMap from "@/components/ui/LazyMap";

// Karen's Google Business Profile, embedded beside the details it belongs to.
// The layout is the one the home page already uses for its photograph and text
// pairing in WhyUs, so this card sits inside the page rhythm rather than
// running full bleed across it.
//
// The query form of the embed is deliberate: it is the only variant that
// renders Google's own business panel with the name and the review stars, which
// is what Karen asked for. The coordinates come from the profile link she sent,
// so the view matches exactly what her own Google listing shows.
const PROFILE_URL = "https://maps.app.goo.gl/mQNXoP8q4ugUxk2d8";
const EMBED_SRC =
  "https://www.google.com/maps?q=" +
  encodeURIComponent(
    "Dello Investments, 1651 S Drake Ave G, Chicago, IL 60623",
  ) +
  "&ll=41.8119986,-87.6874016&z=15&output=embed";

export default function MapCard() {
  return (
    <section className="section-padding">
      <div className="container-custom grid items-center gap-12 lg:grid-cols-5 lg:gap-14">
        <Reveal
          variant="fade-right"
          className="relative mx-auto w-full max-w-2xl lg:col-span-3"
        >
          <div
            className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl border border-mist"
            aria-hidden
          />
          <div className="relative">
            <LazyMap
              src={EMBED_SRC}
              title="Google Maps listing for Dello Investments in Chicago"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-2">
          <Reveal variant="fade-up">
            <p className="section-label">Find us</p>
            <h2 className="text-3xl sm:text-4xl">
              Dello Investments on Google.
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={100}>
            <p className="mt-6 leading-relaxed text-muted">
              Our office is here in Chicago and the map beside this text is our
              live Google Business Profile, so everything you see on it is
              coming straight from Google rather than from us.
            </p>
            <ul className="mt-7 flex flex-col gap-4 text-sm text-ink">
              <li className="flex items-start gap-3">
                <Star
                  className="mt-0.5 h-4 w-4 shrink-0 text-mist-ink"
                  aria-hidden
                />
                <span>Rated 5.0 out of 5 across 6 Google reviews.</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-mist-ink"
                  aria-hidden
                />
                <span>{CONTACT.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone
                  className="mt-0.5 h-4 w-4 shrink-0 text-mist-ink"
                  aria-hidden
                />
                <a href={CONTACT.phoneHref} className="hover:text-navy">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock
                  className="mt-0.5 h-4 w-4 shrink-0 text-mist-ink"
                  aria-hidden
                />
                <span>{CONTACT.hoursEn}</span>
              </li>
            </ul>
            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-block text-sm font-medium text-navy underline underline-offset-4 hover:text-steel"
            >
              View our Google Business Profile
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
