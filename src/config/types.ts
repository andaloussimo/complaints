/**
 * Shape of every site's JSON. One folder per site under sites/<SITE>/:
 *   content.json  -> SiteContent
 *   theme.json    -> SiteTheme
 *   assets/       -> images (copied to /public/site-assets at build)
 *
 * These types are the contract a future dashboard would edit/validate against.
 */

export interface SiteTheme {
  /** rgb triplets "R G B" (no commas) so Tailwind can apply <alpha-value>. */
  colors: {
    brand: string;
    brandFg: string;
    accent: string;
    accentFg: string;
    surface: string;
    muted: string;
    ink: string;
    line: string;
    success: string;
    danger: string;
  };
  radius: string; // e.g. "6px"
  fontFamily: string; // e.g. "Inter, system-ui, sans-serif"
  /** Optional Google Fonts URL to load the font above. */
  fontUrl?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface BrandInfo {
  name: string;
  logo?: string; // asset path, e.g. "logo.svg" (resolved to /site-assets/logo.svg)
  logoAlt?: string;
}

export interface ContactChannel {
  type: "email" | "phone" | "address" | "hours" | "custom";
  label: string;
  value: string;
  href?: string;
}

export interface RichSection {
  heading?: string;
  /** Paragraphs / list items rendered in order. */
  body: string[];
}

export interface LegalPage {
  title: string;
  subtitle?: string;
  updatedAt?: string;
  sections: RichSection[];
}

export interface SiteContent {
  brand: BrandInfo;
  nav: NavLink[];
  /** SEO / <head> defaults. */
  meta: {
    title: string;
    description: string;
    locale: string; // e.g. "en", "fr-FR"
    ogImage?: string;
    /** Refund-form UI + HubSpot ticket language (one of the FormLang codes). */
    formLang: string;
    /** Canonical origin, used for metadataBase (e.g. "https://acme.com"). */
    siteUrl?: string;
  };
  home: {
    hero: {
      eyebrow?: string;
      title: string;
      subtitle?: string;
      highlights?: string[];
    };
    formTitle?: string;
    formIntro?: string;
    /** Optional operator code override passed to HubSpot for this page. */
    operatorCode?: string;
    trust?: RichSection[];
  };
  contact: {
    title: string;
    subtitle?: string;
    intro?: string[];
    channels: ContactChannel[];
  };
  privacy: LegalPage;
  confidentiality: LegalPage;
  footer: {
    tagline?: string;
    links: NavLink[];
    legalNote?: string;
  };
}

export interface Site {
  slug: string;
  content: SiteContent;
  theme: SiteTheme;
}
