"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banner, Button, Card } from "@/components/ui";
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
        <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
        <Link href="/new">
          <Button>+ New site</Button>
        </Link>
      </div>

      {error ? (
        <Banner kind="error">
          {error}
          <div className="mt-1 text-xs">
            Make sure the dashboard project has <code>GITHUB_TOKEN</code> and{" "}
            <code>GITHUB_REPO</code> set.
          </div>
        </Banner>
      ) : null}

      {sites === null && !error ? <p className="text-gray-500">Loading…</p> : null}

      {sites && sites.length === 0 ? (
        <Card>No sites yet. Click “New site” to create one.</Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {sites?.map((s) => (
          <Card key={s.slug}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{s.brand}</h2>
                <p className="text-xs text-gray-500">{s.slug}</p>
              </div>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {s.formLang}
              </span>
            </div>
            {s.siteUrl ? (
              <a
                href={s.siteUrl}
                target="_blank"
                rel="noopener"
                className="mt-2 block text-sm text-brand hover:underline"
              >
                {s.siteUrl}
              </a>
            ) : null}
            <div className="mt-4">
              <Link href={`/edit?site=${s.slug}`}>
                <Button variant="ghost">Edit</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {runs.length ? (
        <div>
          <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Recent activity
          </h2>
          <Card className="divide-y divide-gray-100 p-0">
            {runs.slice(0, 8).map((r, i) => (
              <a
                key={i}
                href={r.html_url}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50"
              >
                <span className="text-gray-700">{r.name}</span>
                <StatusPill run={r} />
              </a>
            ))}
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function StatusPill({ run }: { run: RunStatus }) {
  const label = run.status === "completed" ? run.conclusion ?? "done" : run.status;
  const color =
    run.status !== "completed"
      ? "bg-amber-100 text-amber-700"
      : run.conclusion === "success"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}
