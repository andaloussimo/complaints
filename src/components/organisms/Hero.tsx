import type { SiteContent } from "@/config/types";

export function Hero({ hero }: { hero: SiteContent["home"]["hero"] }) {
  return (
    <div className="text-ink">
      {hero.eyebrow ? (
        <p className="mb-3 inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
          {hero.eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{hero.title}</h1>
      {hero.subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-ink/70">{hero.subtitle}</p>
      ) : null}
      {hero.highlights?.length ? (
        <ul className="mt-6 space-y-3">
          {hero.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-ink/80">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="m2.5 6 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {h}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
