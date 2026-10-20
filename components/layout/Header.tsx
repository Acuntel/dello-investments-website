"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe, ChevronDown, Phone, Menu } from "lucide-react";
import {
  detectLocaleFromPath,
  getDict,
  localePrefix,
  pathInLocale,
  DICTS,
  LOCALES,
} from "@/lib/content";
import { CONTACT } from "@/lib/constants";
import MobileMenu from "./MobileMenu";
import { mainNav } from "@/lib/nav";
import type { Locale } from "@/lib/content";
import type { ImageMeta } from "@/lib/admin/types";

// The logo's description is resolved for all three languages upstream, because
// this component only learns its locale from the URL on the client.
export default function Header({ logo }: { logo: Record<Locale, ImageMeta> }) {
  const pathname = usePathname() || "/";
  const locale = detectLocaleFromPath(pathname);
  const t = getDict(locale);
  const prefix = localePrefix(locale);

  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = mainNav(t, locale);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-smooth ${
          scrolled
            ? "bg-navy/95 py-3 shadow-lift backdrop-blur"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container-custom flex items-center justify-between gap-4">
          <Link
            href={prefix || "/"}
            aria-label="Dello Investments home"
            className="shrink-0"
          >
            <Image
              src="/images/logo-white.png"
              alt={logo[locale].alt}
              title={logo[locale].title}
              width={168}
              height={59}
              loading="eager"
              className="h-10 w-auto sm:h-11"
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/85 transition-colors hover:text-mist"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Language switcher, maps the CURRENT path into each locale */}
            <div
              className="relative hidden md:block"
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={langOpen}
                onFocus={() => setLangOpen(true)}
                onKeyDown={(e) => e.key === "Escape" && setLangOpen(false)}
                className="flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-white/85 transition-colors hover:text-mist"
              >
                <Globe className="h-4 w-4" />
                <span>{locale.toUpperCase()}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full z-50 pt-2">
                  <div className="min-w-[150px] rounded-lg bg-white py-2 shadow-lift">
                    {LOCALES.map((code) => (
                      <Link
                        key={code}
                        href={pathInLocale(pathname, code)}
                        className={`block px-5 py-2 text-sm transition-colors hover:bg-mist-faint hover:text-navy ${
                          code === locale
                            ? "font-semibold text-mist-ink"
                            : "text-ink"
                        }`}
                      >
                        {DICTS[code].langName}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a
              href={CONTACT.phoneHref}
              className="hidden items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-mist md:flex"
            >
              <Phone className="h-4 w-4 text-mist" />
              {CONTACT.phone}
            </a>

            <Link
              href={`${prefix}/contact`}
              className="hidden rounded-full bg-mist px-5 py-2.5 text-sm font-semibold text-navy transition-all duration-300 ease-smooth hover:bg-mist-strong lg:block"
            >
              {t.nav.getOffer}
            </Link>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
      />
    </>
  );
}
