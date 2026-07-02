/**
 * Scaffolds a new site under sites/<slug>/ by copying sites/_template/ and
 * applying a handful of inputs. Driven by env vars so it works both from the
 * "New site" GitHub Action and locally.
 *
 * Inputs (env):
 *   NEW_SLUG      required  folder + Cloudflare project name (a-z 0-9 -)
 *   NEW_BRAND     required  brand / company name
 *   NEW_DOMAIN    required  canonical URL, e.g. https://acme.com
 *   NEW_COLOR     optional  brand color as #RRGGBB (default keeps template blue)
 *   NEW_LANG      optional  form language code (default en)
 *   NEW_EMAIL     optional  support email
 *   NEW_PHONE     optional  support phone
 *   NEW_OPERATOR  optional  HubSpot operator code for this site
 *   NEW_HUBSPOT   optional  JSON of per-site HubSpot routing settings, e.g.
 *                           '{"pipeline":"7","stage":"8","priority":"HIGH"}'
 *
 * Usage locally:
 *   NEW_SLUG=acme NEW_BRAND="Acme Refunds" NEW_DOMAIN=https://acme.com \
 *   NEW_COLOR="#9333ea" NEW_LANG=fr NEW_EMAIL=support@acme.com node scripts/new-site.mjs
 */
import fs from "node:fs";
import path from "node:path";

const LANGS = ["en", "fr", "es", "pt", "sr", "me", "bg", "lv", "sl", "fi", "ro"];

function fail(msg) {
  console.error(`[new-site] ERROR: ${msg}`);
  process.exit(1);
}

function req(name) {
  const v = (process.env[name] ?? "").trim();
  if (!v) fail(`missing required input ${name}`);
  return v;
}

/** "#9333ea" | "9333ea" -> "147 51 234" (Tailwind RGB triplet). */
function hexToRgbTriplet(hex) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec((hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

const root = process.cwd();
const slug = req("NEW_SLUG").toLowerCase();
if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
  fail(`invalid slug "${slug}" — use lowercase letters, digits and hyphens only`);
}
if (slug.startsWith("_")) fail(`slug cannot start with "_" (reserved)`);

const brand = req("NEW_BRAND");
let domain = req("NEW_DOMAIN").replace(/\/+$/, "");
// Accept "acme.com" or "https://acme.com" — normalize to a full URL so the site's
// canonical URL is always valid (a bare host would crash the build).
if (!/^https?:\/\//i.test(domain)) domain = `https://${domain}`;
try {
  domain = new URL(domain).origin;
} catch {
  fail(`invalid domain "${process.env.NEW_DOMAIN}" — use something like https://acme.com`);
}
const color = (process.env.NEW_COLOR ?? "").trim();
const lang = (process.env.NEW_LANG ?? "en").trim().toLowerCase();
const email = (process.env.NEW_EMAIL ?? "").trim();
const phone = (process.env.NEW_PHONE ?? "").trim();
const operator = (process.env.NEW_OPERATOR ?? "").trim();

// Per-site HubSpot routing settings, passed as one JSON blob (workflow_dispatch
// caps at 10 inputs). Tolerant: empty/invalid JSON just yields an empty block.
const HUBSPOT_KEYS = ["pipeline", "stage", "owner", "priority", "routingProp", "routingValue", "operatorProp"];
const PRIORITIES = ["", "LOW", "MEDIUM", "HIGH"];
let hubspot = {};
const rawHubspot = (process.env.NEW_HUBSPOT ?? "").trim();
if (rawHubspot) {
  try {
    const parsed = JSON.parse(rawHubspot);
    for (const k of HUBSPOT_KEYS) {
      if (typeof parsed[k] === "string") hubspot[k] = parsed[k].trim();
    }
  } catch {
    console.warn("[new-site] WARN: NEW_HUBSPOT is not valid JSON — using empty settings");
  }
}
if (hubspot.priority && !PRIORITIES.includes(hubspot.priority)) {
  fail(`invalid hubspot priority "${hubspot.priority}" (allowed: LOW, MEDIUM, HIGH)`);
}

if (!LANGS.includes(lang)) fail(`unsupported language "${lang}" (allowed: ${LANGS.join(", ")})`);

const templateDir = path.join(root, "sites", "_template");
const outDir = path.join(root, "sites", slug);
if (!fs.existsSync(templateDir)) fail(`template missing at sites/_template`);
if (fs.existsSync(outDir)) fail(`site "${slug}" already exists at sites/${slug}`);

// --- content.json ---
const content = JSON.parse(fs.readFileSync(path.join(templateDir, "content.json"), "utf8"));
const year = new Date().getFullYear();

content.brand.name = brand;
content.brand.logoAlt = brand;
delete content.brand.logo; // no logo yet -> header renders brand name as text

content.meta.title = `${brand} — Claim your refund`;
content.meta.formLang = lang;
content.meta.siteUrl = domain;

if (email) {
  const c = content.contact.channels.find((x) => x.type === "email");
  if (c) {
    c.value = email;
    c.href = `mailto:${email}`;
  }
}
if (phone) {
  const c = content.contact.channels.find((x) => x.type === "phone");
  if (c) {
    c.value = phone;
    c.href = `tel:${phone.replace(/[^+\d]/g, "")}`;
  }
} else {
  // Drop the empty phone channel the template ships with.
  content.contact.channels = content.contact.channels.filter((x) => x.type !== "phone");
}

content.footer.legalNote = `© ${year} ${brand}. All rights reserved.`;
if (operator) content.home.operatorCode = operator;
content.hubspot = { ...(content.hubspot ?? {}), ...hubspot };

// --- theme.json ---
const theme = JSON.parse(fs.readFileSync(path.join(templateDir, "theme.json"), "utf8"));
if (color) {
  const rgb = hexToRgbTriplet(color);
  if (!rgb) fail(`invalid color "${color}" — use hex like #9333ea`);
  theme.colors.brand = rgb;
}

// --- write ---
fs.mkdirSync(path.join(outDir, "assets"), { recursive: true });
fs.writeFileSync(path.join(outDir, "content.json"), JSON.stringify(content, null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "theme.json"), JSON.stringify(theme, null, 2) + "\n");
fs.writeFileSync(
  path.join(outDir, "assets", ".gitkeep"),
  "# Drop logo.svg/png here and set brand.logo in content.json to use an image logo.\n",
);

console.log(`[new-site] created sites/${slug}/ for "${brand}"`);
console.log(`[new-site]   domain=${domain} lang=${lang}${color ? ` color=${color}` : ""}`);
console.log(`[new-site] next: build with  SITE=${slug} npm run build`);
