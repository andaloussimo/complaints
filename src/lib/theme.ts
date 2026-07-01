import type { CSSProperties } from "react";
import type { SiteTheme } from "@/config/types";

/**
 * Turns a site's theme.json into the CSS custom properties consumed by
 * tailwind.config.ts (colors, radius, font). Applied on <body> in the root
 * layout so a theme swap is purely a JSON change.
 */
export function themeToCssVars(theme: SiteTheme): CSSProperties {
  const c = theme.colors;
  return {
    "--color-brand": c.brand,
    "--color-brand-fg": c.brandFg,
    "--color-accent": c.accent,
    "--color-accent-fg": c.accentFg,
    "--color-surface": c.surface,
    "--color-muted": c.muted,
    "--color-ink": c.ink,
    "--color-line": c.line,
    "--color-success": c.success,
    "--color-danger": c.danger,
    "--radius": theme.radius,
    "--font-sans": theme.fontFamily,
  } as CSSProperties;
}
