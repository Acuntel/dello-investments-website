import { localePrefix, type Locale } from "@/lib/content";
import type { SiteDict } from "@/lib/content/types";

export interface NavLink {
  href: string;
  label: string;
}

// One definition of the menu, shared by the header, the mobile drawer and the
// footer, so they can never drift apart.
//
// The 77 pages ported off Carrot are English only. English visitors get the
// real pages; Spanish and Polish visitors keep the on-page anchors, because
// sending them to English pages from a Spanish menu is a worse experience than
// scrolling to the equivalent section.
export function mainNav(t: SiteDict, locale: Locale): NavLink[] {
  if (locale !== "en") {
    const prefix = localePrefix(locale);
    return [
      { href: `${prefix}/#story`, label: t.nav.about },
      { href: `${prefix}/#process`, label: t.nav.howItWorks },
      { href: `${prefix}/#situations`, label: t.nav.situations },
      { href: `${prefix}/#faq`, label: t.nav.faq },
    ];
  }
  return [
    { href: "/about-us", label: t.nav.about },
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/situations", label: t.nav.situations },
    { href: "/chicago-neighborhoods", label: "Neighborhoods" },
    { href: "/blog", label: "Blog" },
    { href: "/faqs", label: t.nav.faq },
  ];
}

// The footer carries a couple of extras the header has no room for.
export function footerNav(t: SiteDict, locale: Locale): NavLink[] {
  const links = mainNav(t, locale);
  if (locale !== "en")
    return [
      ...links,
      { href: `${localePrefix(locale)}/contact`, label: t.nav.contact },
    ];
  return [...links, { href: "/contact", label: t.nav.contact }];
}
