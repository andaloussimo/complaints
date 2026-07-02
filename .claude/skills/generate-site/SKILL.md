---
name: generate-site
description: Interview the user and generate a complete new refund/complaint site (content.json + theme.json in any supported language) under sites/<slug>/, validate it, and ship it through the existing deploy pipeline. Use when the user asks to create/generate a new site, write site content, make a site in some language, or scaffold a site for a specific brand/case.
---

# Generate a new site from an interview

You are generating a complete site for this repo's multi-tenant template. One site = one
folder `sites/<slug>/` containing `content.json`, `theme.json` and `assets/`. Pushing to
`main` auto-creates the Cloudflare Pages project and deploys it — no other setup.

The user may be non-technical. Ask questions in plain language, never mention JSON or
schemas to them, and write ALL site copy yourself, professionally, in their target
language.

## Step 1 — Interview

Ask (use AskUserQuestion where options fit; keep it to 2 rounds max):

1. **Brand name** (e.g. "88195.fr") and **site ID/slug** — propose a slug from the brand
   (lowercase letters/digits/hyphens, not starting with `_`; must not already exist in
   `sites/`).
2. **Domain** (e.g. `acme.com` — normalize to `https://…` origin).
3. **Language** — one of: en fr es pt sr me bg lv sl fi ro (this drives page copy AND the
   refund form/ticket language via `meta.formLang`).
4. **The case** — what are visitors getting refunded for? (e.g. surcharged calls to a
   short number, overbilled mobile payments, a specific operator code). This shapes the
   hero, "how it works", and legal wording.
5. **Support contact** — email (required-ish), phone/hours/address (optional).
6. **Operator code** (optional; goes to `home.operatorCode`) and any HubSpot routing they
   know (pipeline/stage/owner/priority/routingProp/routingValue/operatorProp — all
   optional, empty = shared defaults; they can set these later in the dashboard).
7. **Brand color** (hex) and tone (default: reassuring, professional, simple).

Then show a one-paragraph summary of what you'll create and confirm before writing files.

## Step 2 — Generate the files

Copy the structure of `sites/_template/content.json` (authoritative schema:
`src/config/types.ts`; a filled example: `sites/demo/content.json`, which is in French).

Rules:

- **Every user-facing string in the target language** — nav labels, meta title/description,
  hero (eyebrow/title/subtitle/3 highlights), formTitle/formIntro, "how it works" trust
  section, contact page, BOTH legal pages, footer tagline/legalNote (© current year).
- **Tailor to the case** from the interview (mention the kind of transaction, invoice,
  IBAN refund flow). Don't invent legal entities, addresses or registration numbers.
- **Legal pages**: `privacy` = privacy policy (data collected: phone/email/IBAN/uploads/IP;
  use; storage/retention; user rights incl. the local data-protection authority — CNIL for
  fr, AEPD for es, etc.). `confidentiality` = confidentiality commitment (confidential
  handling, secure transmission, no unsolicited contact). 3–4 sections each, `body` =
  array of paragraph strings.
- **meta**: `locale` + `formLang` = chosen language code; `siteUrl` = normalized https
  origin; title pattern "<Brand> — <refund CTA in language>".
- **brand**: name + logoAlt only (no `logo` — text header until they upload one in the
  dashboard).
- **contact.channels**: only channels the user actually provided (email gets
  `mailto:`, phone gets `tel:` with digits/+ only). Labels in the target language.
- **hubspot block**: include all 7 keys; fill what the user gave, empty strings otherwise.
  `priority` must be "", "LOW", "MEDIUM" or "HIGH".
- **theme.json**: copy from `sites/_template/theme.json`; if the user gave a hex color,
  convert to an "R G B" triplet for `colors.brand` (e.g. #9333ea → "147 51 234"). All
  colors are space-separated RGB triplets, never hex.
- Create `sites/<slug>/assets/.gitkeep`.

## Step 3 — Validate (do not skip)

```bash
node -e "JSON.parse(require('fs').readFileSync('sites/<slug>/content.json','utf8')); JSON.parse(require('fs').readFileSync('sites/<slug>/theme.json','utf8'))"
SITE=<slug> npm run build   # must exit 0; prerenders all pages with the new content
```

If the build fails, fix the content — never ship a broken site.

## Step 4 — Ship

Ask the user: push now or let them review first. On push:

```bash
git add sites/<slug> && git commit -m "Add site: <slug> (<brand>)" && git push origin main
```

The deploy workflow auto-creates the `<slug>` Cloudflare Pages project, syncs the shared
HubSpot token + the site's routing settings, and deploys to `<slug>.pages.dev`.

Tell the user the two follow-ups:
1. Attach the custom domain to the `<slug>` project in Cloudflare (Custom domains).
2. Everything (copy, colors, logo, HubSpot routing) stays editable in the dashboard.
