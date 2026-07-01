import fs from "node:fs";
import path from "node:path";
import type { Site, SiteContent, SiteTheme } from "./types";

/**
 * Server-only loader. Reads the active site's JSON from sites/<SITE>/ at
 * build/request time. Cached per process so repeated calls are cheap.
 *
 * The active site is chosen by the SITE env var (default "demo").
 */

const SITE_SLUG = process.env.SITE?.trim() || "demo";

function sitesRoot(): string {
  return path.join(process.cwd(), "sites");
}

function readJson<T>(file: string): T {
  const raw = fs.readFileSync(file, "utf8");
  return JSON.parse(raw) as T;
}

let cached: Site | null = null;

export function getSite(): Site {
  if (cached) return cached;

  const dir = path.join(sitesRoot(), SITE_SLUG);
  if (!fs.existsSync(dir)) {
    throw new Error(
      `Site "${SITE_SLUG}" not found at ${dir}. Create sites/${SITE_SLUG}/content.json and theme.json, or set the SITE env var.`,
    );
  }

  const content = readJson<SiteContent>(path.join(dir, "content.json"));
  const theme = readJson<SiteTheme>(path.join(dir, "theme.json"));

  cached = { slug: SITE_SLUG, content, theme };
  return cached;
}

export function getSiteSlug(): string {
  return SITE_SLUG;
}

/** Resolve an asset filename from a site's JSON to its public URL. */
export function assetUrl(name?: string): string | undefined {
  if (!name) return undefined;
  if (/^https?:\/\//.test(name) || name.startsWith("/")) return name;
  return `/site-assets/${name}`;
}
