/**
 * Isomorphic validation + normalization (shared by the UI and the Pages
 * Functions). Mirrors the rules in the main app's scripts/new-site.mjs and
 * src/config/site.ts so the dashboard can only ever produce buildable JSON.
 */
import { LANGS, type CreateSiteInput, type SiteContent, type SiteTheme } from "./types";

export type Result = { ok: true } | { ok: false; error: string };

/** "#9333ea" | "9333ea" -> "147 51 234" (Tailwind RGB triplet), or null. */
export function hexToRgbTriplet(hex: string): string | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec((hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** "13 109 181" -> "#0d6db5" (for color inputs), or "#000000" on bad input. */
export function rgbTripletToHex(triplet: string): string {
  const parts = (triplet || "").trim().split(/\s+/).map((x) => parseInt(x, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return "#000000";
  }
  return "#" + parts.map((n) => n.toString(16).padStart(2, "0")).join("");
}

/** Accepts "acme.com" or "https://acme.com"; returns a full origin or null. */
export function normalizeDomain(input: string): string | null {
  let v = (input || "").trim().replace(/\/+$/, "");
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    return new URL(v).origin;
  } catch {
    return null;
  }
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug) && !slug.startsWith("_");
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Validate the create-site form (server-side gate before dispatching CI). */
export function validateCreateInput(input: Partial<CreateSiteInput>): Result {
  const slug = (input.slug ?? "").toLowerCase().trim();
  if (!isValidSlug(slug)) {
    return { ok: false, error: "Slug must be lowercase letters, digits and hyphens (not starting with _)." };
  }
  if (!(input.brand ?? "").trim()) return { ok: false, error: "Brand name is required." };
  if (!normalizeDomain(input.domain ?? "")) {
    return { ok: false, error: "Enter a valid domain, e.g. acme.com or https://acme.com." };
  }
  if (!LANGS.includes((input.lang ?? "") as never)) {
    return { ok: false, error: `Language must be one of: ${LANGS.join(", ")}.` };
  }
  if (input.color && !hexToRgbTriplet(input.color)) {
    return { ok: false, error: "Color must be a hex value like #9333ea." };
  }
  if (input.email && !EMAIL_RE.test(input.email)) {
    return { ok: false, error: "Support email is not a valid address." };
  }
  return { ok: true };
}

/** Validate an edited content.json before committing. */
export function validateContent(c: unknown): Result {
  if (!c || typeof c !== "object") return { ok: false, error: "Content must be an object." };
  const x = c as Partial<SiteContent>;
  if (!x.brand?.name?.trim()) return { ok: false, error: "brand.name is required." };
  if (!x.meta) return { ok: false, error: "meta is required." };
  if (!LANGS.includes((x.meta.formLang ?? "") as never)) {
    return { ok: false, error: `meta.formLang must be one of: ${LANGS.join(", ")}.` };
  }
  if (x.meta.siteUrl && !normalizeDomain(x.meta.siteUrl)) {
    return { ok: false, error: "meta.siteUrl is not a valid URL." };
  }
  if (!x.home?.hero?.title?.trim()) return { ok: false, error: "home.hero.title is required." };
  if (!Array.isArray(x.contact?.channels)) {
    return { ok: false, error: "contact.channels must be a list." };
  }
  return { ok: true };
}

const RGB_RE = /^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/;

export function validateTheme(t: unknown): Result {
  if (!t || typeof t !== "object") return { ok: false, error: "Theme must be an object." };
  const x = t as Partial<SiteTheme>;
  if (!x.colors) return { ok: false, error: "theme.colors is required." };
  for (const [k, v] of Object.entries(x.colors)) {
    if (typeof v !== "string" || !RGB_RE.test(v)) {
      return { ok: false, error: `theme.colors.${k} must be an "R G B" triplet.` };
    }
  }
  return { ok: true };
}

/** Normalize meta.siteUrl on an edited content object (in place, returns it). */
export function normalizeContent(c: SiteContent): SiteContent {
  if (c.meta?.siteUrl) {
    const n = normalizeDomain(c.meta.siteUrl);
    if (n) c.meta.siteUrl = n;
  }
  return c;
}
