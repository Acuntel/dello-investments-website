"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { detectLocaleFromPath, getDict, localePrefix } from "@/lib/content";
import { CONTACT, SOCIAL } from "@/lib/constants";
import { footerNav } from "@/lib/nav";
import type { Locale } from "@/lib/content";
import type { ImageMeta } from "@/lib/admin/types";

export default function Footer({ logo }: { logo: Record<Locale, ImageMeta> }) {
  const pathname = usePathname() || "/";
  const locale = detectLocaleFromPath(pathname);
  const t = getDict(locale);
  const prefix = localePrefix(locale);

  const links = footerNav(t, locale);

  return (
    <footer className="bg-navy text-white/80">
      <div className="container-custom grid gap-12 py-16 md:grid-cols-3">
        <div>
          <Image
            src="/images/logo-white.png"
            alt={logo[locale].alt}
            title={logo[locale].title}
            width={190}
            height={67}
            className="mb-5 h-12 w-auto"
          />
          <p className="max-w-xs text-sm leading-relaxed">{t.footer.tagline}</p>
          <div className="mt-5 flex gap-4 text-sm">
            <a
              href={SOCIAL.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-mist"
            >
              Facebook
            </a>
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-mist"
            >
              Instagram
            </a>
            <a
              href={SOCIAL.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-mist"
            >
              YouTube
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-5 font-heading text-lg text-white">
            {t.footer.quickLinks}
          </h3>
          <ul className="flex flex-col gap-3 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-mist"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 font-heading text-lg text-white">
            {t.footer.contactLabel}
          </h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <a
                href={CONTACT.phoneHref}
                className="flex items-center gap-3 transition-colors hover:text-mist"
              >
                <Phone className="h-4 w-4 shrink-0 text-mist" />
                {CONTACT.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-3 transition-colors hover:text-mist"
              >
                <Mail className="h-4 w-4 shrink-0 text-mist" />
                {CONTACT.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 shrink-0 text-mist" />
              {CONTACT.address}
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-4 w-4 shrink-0 text-mist" />
              {t.footer.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-custom flex flex-col gap-2 py-6 text-xs text-white/50">
          {/* White artwork on transparency: only works on this dark footer. */}
          <Image
            src="/images/realtor-logo-white.webp"
            alt="REALTOR®"
            width={96}
            height={96}
            className="mb-2 h-24 w-24"
          />
          <p>{t.footer.certsLine}</p>
          <p>
            Bungalow photography by{" "}
            <a
              href="https://www.flickr.com/photos/48922763@N04/34087296956"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-mist"
            >
              Cragin Spring
            </a>{" "}
            (CC BY 2.0).
          </p>
          <p>
            © {new Date().getFullYear()} Dello Investments. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
