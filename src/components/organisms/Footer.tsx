import Link from "next/link";
import type { SiteContent } from "@/config/types";

export function Footer({ footer, brandName }: { footer: SiteContent["footer"]; brandName: string }) {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto max-w-content px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-base font-semibold text-ink">{brandName}</p>
            {footer.tagline ? (
              <p className="mt-2 text-sm text-ink/60">{footer.tagline}</p>
            ) : null}
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footer.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink/70 transition hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {footer.legalNote ? (
          <p className="mt-8 border-t border-line pt-6 text-xs text-ink/50">{footer.legalNote}</p>
        ) : null}
      </div>
    </footer>
  );
}
