"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Banner, Button, Card, Skeleton, SiteAvatar, TextInput } from "@/components/ui";
import { useToast } from "@/components/toast";
import { deleteSite, getProject, getStatus, listSites, type RunStatus } from "@/lib/api";
import type { SiteSummary } from "@/lib/types";

export default function SitesPage() {
  const [sites, setSites] = useState<SiteSummary[] | null>(null);
  const [runs, setRuns] = useState<RunStatus[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<SiteSummary | null>(null);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const { push } = useToast();

  useEffect(() => {
    listSites()
      .then((list) => {
        setSites(list);
        // Resolve each project's real pages.dev URL (slug-based URLs are only a guess).
        list.forEach((s) => {
          getProject(s.slug)
            .then((p) => {
              if (p.url) setPreviews((prev) => ({ ...prev, [s.slug]: p.url! }));
            })
            .catch(() => {});
        });
      })
      .catch((e) => setError(e.message));
    getStatus().then(setRuns).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!sites) return null;
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) =>
        s.slug.toLowerCase().includes(q) ||
        s.brand.toLowerCase().includes(q) ||
        (s.siteUrl ?? "").toLowerCase().includes(q),
    );
  }, [sites, query]);

  async function confirmDelete(site: SiteSummary) {
    setToDelete(null);
    setDeleting((d) => new Set(d).add(site.slug));
    try {
      await deleteSite(site.slug);
      push(
        "success",
        `Deleting ${site.brand}`,
        "The site folder and Cloudflare project are being removed — done in about a minute.",
      );
    } catch (e) {
      setDeleting((d) => {
        const next = new Set(d);
        next.delete(site.slug);
        return next;
      });
      push("error", "Delete failed", e instanceof Error ? e.message : undefined);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Sites</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {sites ? `${sites.length} site${sites.length === 1 ? "" : "s"} deployed from this template` : "Loading your sites…"}
          </p>
        </div>
        <Link href="/new">
          <Button>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New site
          </Button>
        </Link>
      </div>

      {error ? (
        <Banner kind="error">
          {error}
          <div className="mt-1 text-xs opacity-80">
            Make sure the dashboard project has <code>GITHUB_TOKEN</code> and <code>GITHUB_REPO</code> set.
          </div>
        </Banner>
      ) : null}

      {/* Search — the list stays usable at 30+ sites */}
      {sites && sites.length > 0 ? (
        <div className="relative">
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, slug or domain…"
            className="pl-10"
          />
        </div>
      ) : null}

      {sites === null && !error ? (
        <Card className="divide-y divide-gray-100 p-0">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <Skeleton className="h-9 w-9" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-40" />
            </div>
          ))}
        </Card>
      ) : null}

      {sites && sites.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="font-medium text-gray-900">No sites yet</p>
          <p className="mt-1 text-sm text-gray-500">Create your first site — it goes live in about two minutes.</p>
          <Link href="/new" className="mt-4 inline-block">
            <Button>New site</Button>
          </Link>
        </Card>
      ) : null}

      {filtered && filtered.length === 0 && sites && sites.length > 0 ? (
        <Card className="py-8 text-center text-sm text-gray-500">
          No site matches “{query}”.
        </Card>
      ) : null}

      {filtered && filtered.length > 0 ? (
        <Card className="divide-y divide-gray-100 p-0">
          {filtered.map((s) => {
            const isDeleting = deleting.has(s.slug);
            return (
              <div
                key={s.slug}
                className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition hover:bg-gray-50/70 ${isDeleting ? "opacity-50" : ""}`}
              >
                <SiteAvatar name={s.brand} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-gray-900">{s.brand}</p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      {s.formLang}
                    </span>
                    {isDeleting ? (
                      <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                        deleting…
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-gray-400">
                    {s.slug}
                    {s.siteUrl ? <> · {s.siteUrl.replace(/^https?:\/\//, "")}</> : null}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Link href={`/edit?site=${s.slug}`}>
                    <Button variant="ghost" className="px-3 py-1.5 text-xs" disabled={isDeleting}>
                      Edit
                    </Button>
                  </Link>
                  <a
                    href={previews[s.slug] ?? `https://${s.slug}.pages.dev`}
                    target="_blank"
                    rel="noopener"
                    title={previews[s.slug] ? undefined : "Best guess — set CLOUDFLARE_API_TOKEN on the dashboard to resolve the real URL"}
                  >
                    <Button variant="ghost" className="px-3 py-1.5 text-xs" disabled={isDeleting}>
                      Preview
                    </Button>
                  </a>
                  <button
                    onClick={() => setToDelete(s)}
                    disabled={isDeleting}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none"
                    aria-label={`Delete ${s.brand}`}
                    title="Delete site"
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M2.5 4h11M6.5 4V2.8c0-.4.3-.8.8-.8h1.4c.5 0 .8.4.8.8V4m3 0-.5 9.2c0 .4-.4.8-.8.8H4.8c-.4 0-.8-.4-.8-.8L3.5 4M6.5 7v4M9.5 7v4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      ) : null}

      {runs.length ? (
        <div>
          <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Recent activity
          </h2>
          <Card className="divide-y divide-gray-100 p-0">
            {runs.slice(0, 8).map((r, i) => (
              <a
                key={i}
                href={r.html_url}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-between px-5 py-3 text-sm transition hover:bg-gray-50"
              >
                <span className="flex items-center gap-3 text-gray-700">
                  <StatusDot run={r} />
                  {r.name}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
                  <StatusPill run={r} />
                </span>
              </a>
            ))}
          </Card>
        </div>
      ) : null}

      {toDelete ? (
        <DeleteModal site={toDelete} onCancel={() => setToDelete(null)} onConfirm={() => confirmDelete(toDelete)} />
      ) : null}
    </div>
  );
}

/** Type-to-confirm destructive modal (deletes the repo folder + CF project). */
function DeleteModal({
  site,
  onCancel,
  onConfirm,
}: {
  site: SiteSummary;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");
  const match = typed.trim() === site.slug;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="toast-in w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-bold text-gray-900">Delete {site.brand}?</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          This permanently removes <code className="rounded bg-gray-100 px-1">sites/{site.slug}/</code> from the
          repo <em>and</em> deletes the <code className="rounded bg-gray-100 px-1">{site.slug}</code> Cloudflare
          Pages project. The live site goes offline. This cannot be undone from the dashboard.
        </p>
        <p className="mt-4 text-sm font-medium text-gray-700">
          Type <span className="font-mono text-red-600">{site.slug}</span> to confirm:
        </p>
        <TextInput
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={site.slug}
          className="mt-2"
          autoFocus
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" disabled={!match} onClick={onConfirm}>
            Delete site
          </Button>
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function StatusDot({ run }: { run: RunStatus }) {
  const color =
    run.status !== "completed"
      ? "bg-amber-400 animate-pulse"
      : run.conclusion === "success"
        ? "bg-emerald-500"
        : "bg-red-500";
  return <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />;
}

function StatusPill({ run }: { run: RunStatus }) {
  const label = run.status === "completed" ? (run.conclusion ?? "done") : run.status.replace("_", " ");
  const color =
    run.status !== "completed"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : run.conclusion === "success"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-red-50 text-red-700 border-red-200";
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}
