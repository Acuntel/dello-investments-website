"use client";

import Link from "next/link";
import { X, Globe, Phone } from "lucide-react";
import {
  detectLocaleFromPath,
  getDict,
  localePrefix,
  pathInLocale,
  DICTS,
  LOCALES,
} from "@/lib/content";
import { CONTACT } from "@/lib/constants";
import { footerNav } from "@/lib/nav";

export default function MobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const locale = detectLocaleFromPath(pathname);
  const t = getDict(locale);
  const prefix = localePrefix(locale);

  const navLinks = footerNav(t, locale);

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 lg:hidden ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute right-0 top-0 flex h-full w-[300px] flex-col bg-white shadow-lift transition-transform duration-500 ease-drama ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-mist-light px-6 py-5">
          <p className="font-heading text-lg text-navy">Dello Investments</p>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col px-6 py-4" aria-label="Mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="border-b border-mist-light py-4 font-medium text-ink transition-colors hover:text-mist-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-2 px-6">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Globe className="h-3.5 w-3.5" />
            {t.nav.languageLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {LOCALES.map((code) => (
              <Link
                key={code}
                href={pathInLocale(pathname, code)}
                onClick={onClose}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  code === locale
                    ? "border-mist bg-mist/10 font-semibold text-mist-ink"
                    : "border-mist text-ink hover:border-mist"
                }`}
              >
                {DICTS[code].langName}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 p-6">
          <a href={CONTACT.phoneHref} className="btn-navy w-full">
            <Phone className="h-4 w-4" />
            {CONTACT.phone}
          </a>
          <Link
            href={`${prefix}/contact`}
            onClick={onClose}
            className="btn-mist w-full"
          >
            {t.nav.getOffer}
          </Link>
        </div>
      </div>
    </div>
  );
}
