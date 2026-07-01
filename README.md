# Complaint / Refund Site Template

A multi-tenant **Next.js** template for refund/complaint sites. One codebase renders
many sites — each site's content, theme and images live in its own JSON folder, so
spinning up a new site is a data change, not a code change.

- **Fully static export** (`output:'export'` → `out/`), served on Cloudflare Pages' CDN:
  home, contact, privacy, confidentiality.
- **One Cloudflare Pages Function** (`functions/api/refund.ts`, served at `/api/refund`)
  submits the refund form to **HubSpot** (uploads files → upserts contact → opens a
  ticket → attaches a note). It holds the secret HubSpot token, which lives on the Pages
  project as a runtime secret.
- **Atomic Design** component structure: `atoms → molecules → organisms → templates → pages`.

## Quick start

```bash
npm install
SITE=demo npm run dev           # http://localhost:3000 (static pages)
```

`prepare-site` runs automatically before `dev`/`build` and copies the active site's
`assets/` into `public/site-assets/`.

`SITE` is the **only** build-time input — a site's language and canonical URL live in its
`content.json` (`meta.formLang`, `meta.siteUrl`). To exercise the refund form (the
Cloudflare Function) locally:

```bash
cp .dev.vars.example .dev.vars  # add your HUBSPOT_TOKEN
npm run preview                 # builds, then serves out/ + functions/ via wrangler
```

## Per-site data model

```
sites/
  demo/
    content.json   # all copy, nav, contact, legal pages, footer
    theme.json     # colors, radius, font (drives CSS variables)
    assets/        # logo + images (copied to /public/site-assets)
```

Pick the active site with the `SITE` env var:

```bash
SITE=demo npm run build
SITE=acme npm run build         # a different site from the same code
```

- `content.json` is validated against the TS types in [`src/config/types.ts`](src/config/types.ts).
- `theme.json` colors are `"R G B"` triplets so Tailwind can apply opacity. Changing the
  theme is a pure JSON edit — no rebuild of design tokens.
- Reference an image by filename in JSON (e.g. `"logo": "logo.svg"`); it resolves to
  `/site-assets/logo.svg`.

## Form → HubSpot

The form's language (UI + ticket text) comes from the site's `content.json`
(`meta.formLang`, one of `en fr es pt sr me bg lv sl fi ro`). HubSpot connection settings
are **runtime secrets** on the Cloudflare Pages project (see [`.env.example`](.env.example)
for local `.dev.vars`):

| Secret | Purpose |
| --- | --- |
| `HUBSPOT_TOKEN` | Private App token. Scopes: `tickets`, `crm.objects.contacts.write`, `files` |
| `HUBSPOT_PIPELINE` / `HUBSPOT_STAGE` | Target Help Desk queue (blank = auto-detect) |
| `HUBSPOT_OWNER` / `HUBSPOT_PRIORITY` | Optional assignment/priority |
| `HUBSPOT_ROUTING_PROP` / `HUBSPOT_ROUTING_VALUE` | Stamp a routing property on every ticket |
| `HUBSPOT_OPERATOR_PROP` / `HUBSPOT_OPERATOR_CODE` | Per-site operator code |
| `HUBSPOT_ORIGIN_PROP` / `HUBSPOT_ORIGIN_VALUE` | Origin stamp on every ticket |

The HubSpot flow is ported from the original WordPress plugin
([`src/lib/hubspot.ts`](src/lib/hubspot.ts), runtime-agnostic — takes a `HubSpotConfig`)
and the localized strings from its translation table
([`src/lib/formStrings.ts`](src/lib/formStrings.ts)). The Cloudflare Function
([`functions/api/refund.ts`](functions/api/refund.ts)) builds the config from the project's
secrets and calls `submitRefund`.

## Deploy to Cloudflare Pages

**Model:** one Pages project per site (project name == site slug), all built from this one
repo. Content pages are a static export; `/api/refund` is a Pages Function bundled from the
root `functions/` directory. Deploys run via GitHub Actions + Wrangler direct upload
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) — a `discover` job lists
`sites/*` and a matrix `deploy` job builds + ships each.

Repo-level GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

### Add a new site

1. Create `sites/<slug>/` with `content.json` (incl. `meta.formLang`, `meta.siteUrl`),
   `theme.json`, and `assets/`.
2. Create the Pages project once:
   `npx wrangler pages project create <slug> --production-branch=main`
3. Set its HubSpot secrets:
   `npx wrangler pages secret put HUBSPOT_TOKEN --project-name=<slug>` (repeat as needed).
4. Add the custom domain to the project in the Cloudflare dashboard.
5. Push to `main` — the matrix builds & deploys every site, including the new one.

Manual one-off deploy of a single site:

```bash
SITE=<slug> npm run build
npx wrangler pages deploy out --project-name=<slug> --branch=main
```

## Project structure

```
src/
  app/                    # Next.js App Router pages (static export)
  components/
    atoms/                # Button, Input, Textarea, Checkbox, Tooltip, Logo
    molecules/            # Field, Section, ContactCard
    organisms/            # Header, Footer, Hero, RefundForm
    templates/            # PageLayout, LegalPageView
  config/                 # site loader + TypeScript content/theme types
  lib/                    # hubspot, formStrings, theme, cn
functions/api/refund.ts   # Cloudflare Pages Function -> /api/refund (HubSpot)
sites/<slug>/             # per-site content.json, theme.json, assets/
scripts/prepare-site.mjs  # copies active site assets into /public
wrangler.toml             # Cloudflare Pages config (compat date + output dir)
.github/workflows/        # deploy.yml — per-site build + deploy matrix
```

## Roadmap: dashboard

The file-based model is intentionally dashboard-ready. A future admin app would write
`content.json` / `theme.json` and upload images into `sites/<slug>/`, then trigger a
rebuild/redeploy — no template changes required, because the site already reads
everything from those files.
```
