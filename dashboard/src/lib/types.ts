/**
 * Mirrors the site JSON contract from the main app's src/config/types.ts.
 * Kept in sync manually (the two apps build separately). Only the fields the
 * dashboard reads/edits are typed strictly; the rest is preserved as-is.
 */

export const LANGS = [
  "en", "fr", "es", "pt", "sr", "me", "bg", "lv", "sl", "fi", "ro",
] as const;
export type FormLang = (typeof LANGS)[number];

export interface ThemeColors {
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
}

export interface SiteTheme {
  colors: ThemeColors;
  radius: string;
  fontFamily: string;
  fontUrl?: string;
}

export interface ContactChannel {
  type: "email" | "phone" | "address" | "hours" | "custom";
  label: string;
  value: string;
  href?: string;
}

export interface SiteContent {
  brand: { name: string; logo?: string; logoAlt?: string };
  nav: Array<{ label: string; href: string }>;
  meta: {
    title: string;
    description: string;
    locale: string;
    ogImage?: string;
    formLang: string;
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
    operatorCode?: string;
    trust?: Array<{ heading?: string; body: string[] }>;
  };
  contact: {
    title: string;
    subtitle?: string;
    intro?: string[];
    channels: ContactChannel[];
  };
  privacy: unknown;
  confidentiality: unknown;
  footer: {
    tagline?: string;
    links: Array<{ label: string; href: string }>;
    legalNote?: string;
  };
}

/** Inputs for creating a site (map 1:1 to new-site.yml workflow inputs). */
export interface CreateSiteInput {
  slug: string;
  brand: string;
  domain: string;
  color?: string;
  lang: string;
  email?: string;
  phone?: string;
  operator?: string;
}

export interface SiteSummary {
  slug: string;
  brand: string;
  siteUrl?: string;
  formLang: string;
}
