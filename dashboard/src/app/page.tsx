"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banner, Button, Card, Skeleton, SiteAvatar } from "@/components/ui";
import { getStatus, listSites, type RunStatus } from "@/lib/api";
import type { SiteSummary } from "@/lib/types";

export default function SitesPage() {
  const [sites, setSites] = useState<SiteSummary[] | null>(null);
  const [runs, setRuns] = useState<RunStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSites().then(setSites).catch((e) => setError(e.message));
    getStatus().then(setRuns).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      {sites === null && !error ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="mt-4 h-3 w-40" />
            </Card>
          ))}
        </div>
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

      <div className="grid gap-4 sm:grid-cols-2">
        {sites?.map((s) => (
          <Card key={s.slug} className="transition hover:border-gray-300 hover:shadow-md hover:shadow-gray-900/[0.04]">
            <div className="flex items-start gap-3">
              <SiteAvatar name={s.brand} />
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold text-gray-900">{s.brand}</h2>
                <p className="text-xs text-gray-400">{s.slug}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {s.formLang}
              </span>
            </div>
            {s.siteUrl ? (
              <a
                href={s.siteUrl}
                target="_blank"
                rel="noopener"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
              >
                {s.siteUrl.replace(/^https?:\/\//, "")}
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M4 2h6v6M10 2 5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : null}
            <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
              <Link href={`/edit?site=${s.slug}`} className="flex-1">
                <Button variant="ghost" className="w-full">Edit</Button>
              </Link>
              <a href={`https://${s.slug}.pages.dev`} target="_blank" rel="noopener" className="flex-1">
                <Button variant="ghost" className="w-full">Preview</Button>
              </a>
            </div>
          </Card>
        ))}
      </div>

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
