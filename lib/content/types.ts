// One exhaustive dictionary per locale. Record<Locale, SiteDict> makes a
// missing translation a compile error, the fix for the copy drift that
// happens when each locale is a hand-edited page tree.
export type Locale = "en" | "es";

export interface SiteDict {
  langName: string;
  nav: {
    about: string;
    howItWorks: string;
    situations: string;
    faq: string;
    contact: string;
    getOffer: string;
    languageLabel: string;
  };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    titleTail: string;
    subtitle: string;
    bullets: string[];
    ctaPrimary: string;
    ctaSecondary: string;
    trustLine: string;
  };
  stats: { value: number; suffix: string; label: string }[];
  certs: {
    label: string;
    items: { img: string; alt: string; name: string }[];
    // License credentials rendered as text chips beside the badge images; no
    // badge graphics exist for these and none are needed.
    licenses: { name: string; number: string }[];
  };
  // Post-hero band linking the three money-page categories. bodyHtml carries
  // inline anchors, rendered with dangerouslySetInnerHTML (static, our copy).
  categoryLinks: {
    title: string;
    bodyHtml: string;
    seeAllLabel: string;
  };
  // The three positioning bands (licensed-GC, distressed, foreclosure).
  positioning: {
    gc: { title: string; body: string; license: string };
    distressed: { title: string; body1: string; body2: string };
    foreclosure: {
      title: string;
      body1: string;
      body2Html: string;
      body3: string;
    };
  };
  story: {
    label: string;
    title: string;
    body1: string;
    body2: string;
    points: string[];
    imageAlt: string;
  };
  process: {
    label: string;
    title: string;
    subtitle: string;
    steps: { title: string; body: string }[];
  };
  situations: {
    label: string;
    title: string;
    subtitle: string;
    items: { title: string; body: string }[];
  };
  why: {
    label: string;
    title: string;
    items: { title: string; body: string }[];
  };
  neighborhoods: {
    label: string;
    title: string;
    body: string;
    body2: string;
    areas: string[];
    imageAlt: string;
  };
  faq: {
    label: string;
    title: string;
    items: { q: string; a: string }[];
  };
  cta: {
    title: string;
    body: string;
    call: string;
    form: string;
  };
  contactPage: {
    label: string;
    title: string;
    subtitle: string;
    name: string;
    phone: string;
    email: string;
    addressField: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    errorGeneric: string;
    required: string;
    invalidEmail: string;
    directLabel: string;
    orCall: string;
  };
  footer: {
    tagline: string;
    quickLinks: string;
    contactLabel: string;
    hours: string;
    certsLine: string;
    rights: string;
  };
}
