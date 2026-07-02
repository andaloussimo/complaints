"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Banner, Button, Card, Field, Select, Spinner, TextInput } from "@/components/ui";
import { HubSpotFields } from "@/components/HubSpotFields";
import { useToast } from "@/components/toast";
import { createSite, getRunProgress, getStatus, type RunProgress } from "@/lib/api";
import { validateCreateInput } from "@/lib/validate";
import { LANGS, type CreateSiteInput } from "@/lib/types";

const EMPTY: CreateSiteInput = {
  slug: "",
  brand: "",
  domain: "",
  color: "#0d6db5",
  lang: "en",
  email: "",
  phone: "",
  operator: "",
  hubspot: {},
};

export default function NewSitePage() {
  const [form, setForm] = useState<CreateSiteInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [dispatchedAt, setDispatchedAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const { push } = useToast();

  function set<K extends keyof CreateSiteInput>(key: K, value: CreateSiteInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setError(null);
    const v = validateCreateInput(form);
    if (!v.ok) {
      setError(v.error);
      push("error", "Check the form", v.error);
      return;
    }
    setBusy(true);
    try {
      await createSite(form);
      setDispatchedAt(Date.now());
      push("success", "Site creation started", `Building ${form.brand} — you can watch the progress below.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create site";
      setError(msg);
      push("error", "Could not start creation", msg);
    } finally {
      setBusy(false);
    }
  }

  if (dispatchedAt) {
    return (
      <CreationTracker
        slug={form.slug}
        brand={form.brand}
        domain={form.domain}
        dispatchedAt={dispatchedAt}
        onReset={() => {
          setForm(EMPTY);
          setDispatchedAt(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">New site</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Fill this in and the site is scaffolded, deployed and wired to HubSpot automatically.
        </p>
      </div>
      {error ? <Banner kind="error">{error}</Banner> : null}
      <Card className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Site ID (slug)" hint="lowercase, e.g. acme — also the Cloudflare project name">
            <TextInput value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="acme" />
          </Field>
          <Field label="Brand / company name">
            <TextInput value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Acme Refunds" />
          </Field>
          <Field label="Domain" hint="acme.com or https://acme.com">
            <TextInput value={form.domain} onChange={(e) => set("domain", e.target.value)} placeholder="acme.com" />
          </Field>
          <Field label="Form language">
            <Select value={form.lang} onChange={(e) => set("lang", e.target.value)}>
              {LANGS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </Field>
          <Field label="Brand color">
            <input
              type="color"
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
              className="h-10 w-full cursor-pointer rounded-lg border border-gray-300 shadow-sm"
            />
          </Field>
          <Field label="Operator code (optional)">
            <TextInput value={form.operator} onChange={(e) => set("operator", e.target.value)} placeholder="81054" />
          </Field>
          <Field label="Support email (optional)">
            <TextInput value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="support@acme.com" />
          </Field>
          <Field label="Support phone (optional)">
            <TextInput value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 010 2030" />
          </Field>
        </div>
        <div className="border-t border-gray-100 pt-5">
          <h2 className="font-semibold text-gray-900">HubSpot routing (optional)</h2>
          <p className="mb-4 mt-0.5 text-xs text-gray-400">
            Where this site&apos;s refund tickets land. Leave empty to use the shared defaults — you can
            change all of this later from the Edit page.
          </p>
          <HubSpotFields value={form.hubspot ?? {}} onChange={(next) => set("hubspot", next)} />
        </div>
        <div className="flex gap-3 border-t border-gray-100 pt-5">
          <Button onClick={submit} disabled={busy}>
            {busy ? (
              <>
                <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" /> Starting…
              </>
            ) : (
              "Create site"
            )}
          </Button>
          <Link href="/">
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Live creation tracker ---------------- */

type Phase = "finding" | "tracking" | "success" | "failure" | "lost";

function CreationTracker({
  slug,
  brand,
  domain,
  dispatchedAt,
  onReset,
}: {
  slug: string;
  brand: string;
  domain: string;
  dispatchedAt: number;
  onReset: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("finding");
  const [progress, setProgress] = useState<RunProgress | null>(null);
  const [runUrl, setRunUrl] = useState<string | null>(null);
  const runId = useRef<number | null>(null);

  useEffect(() => {
    let stopped = false;
    const timers: number[] = [];

    // Phase 1: find the workflow run this dispatch started (runs appear within
    // a few seconds; allow generous clock skew).
    const findStart = Date.now();
    async function find() {
      if (stopped) return;
      try {
        const runs = await getStatus("new-site.yml");
        const match = runs.find((r) => new Date(r.created_at).getTime() >= dispatchedAt - 90_000);
        if (match) {
          runId.current = match.id;
          setRunUrl(match.html_url);
          setPhase("tracking");
          void track();
          return;
        }
      } catch {
        /* transient — keep polling */
      }
      if (Date.now() - findStart > 90_000) {
        setPhase("lost");
        return;
      }
      timers.push(window.setTimeout(find, 3000));
    }

    // Phase 2: poll the run's step progress until it completes.
    async function track() {
      if (stopped || runId.current == null) return;
      try {
        const p = await getRunProgress(runId.current);
        setProgress(p);
        setRunUrl(p.html_url);
        if (p.status === "completed") {
          setPhase(p.conclusion === "success" ? "success" : "failure");
          return;
        }
      } catch {
        /* transient — keep polling */
      }
      timers.push(window.setTimeout(track, 3500));
    }

    void find();
    return () => {
      stopped = true;
      timers.forEach(clearTimeout);
    };
  }, [dispatchedAt]);

  const liveUrl = `https://${slug}.pages.dev`;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Card className="space-y-5">
        <div className="flex items-center gap-3">
          {phase === "success" ? (
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="m5 10.5 3.2 3.2L15 7" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          ) : phase === "failure" ? (
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="m6 6 8 8M14 6l-8 8" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10">
              <Spinner className="h-5 w-5" />
            </span>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {phase === "success"
                ? `${brand} is live 🎉`
                : phase === "failure"
                  ? "Something went wrong"
                  : `Creating ${brand}…`}
            </h1>
            <p className="text-sm text-gray-500">
              {phase === "finding" && "Starting the build runner…"}
              {phase === "tracking" && "Building and deploying — usually takes 1–2 minutes."}
              {phase === "success" && "Scaffolded, committed, deployed and wired to HubSpot."}
              {phase === "failure" && "The build failed — check the logs below."}
              {phase === "lost" && "Couldn't locate the run — it may still be running on GitHub."}
            </p>
          </div>
        </div>

        {/* Step checklist */}
        {progress?.steps.length ? (
          <ol className="space-y-1 border-t border-gray-100 pt-4">
            {progress.steps.map((s, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm">
                <StepIcon status={s.status} conclusion={s.conclusion} />
                <span
                  className={
                    s.status === "completed"
                      ? s.conclusion === "success"
                        ? "text-gray-700"
                        : s.conclusion === "skipped"
                          ? "text-gray-400 line-through"
                          : "font-medium text-red-600"
                      : s.status === "in_progress"
                        ? "font-medium text-gray-900"
                        : "text-gray-400"
                  }
                >
                  {s.name}
                </span>
              </li>
            ))}
          </ol>
        ) : phase === "finding" || phase === "tracking" ? (
          <div className="space-y-2 border-t border-gray-100 pt-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                <span className="h-4 w-4 rounded-full border-2 border-gray-200" />
                <span className="skeleton h-3.5 w-48 rounded" />
              </div>
            ))}
          </div>
        ) : null}

        {/* Footer actions */}
        <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
          {phase === "success" ? (
            <>
              <a href={liveUrl} target="_blank" rel="noopener">
                <Button>Open {slug}.pages.dev</Button>
              </a>
              <Link href={`/edit?site=${slug}`}>
                <Button variant="ghost">Edit site</Button>
              </Link>
            </>
          ) : null}
          {phase === "failure" || phase === "lost" ? (
            <Button variant="ghost" onClick={onReset}>← Back to the form</Button>
          ) : null}
          {runUrl ? (
            <a
              href={runUrl}
              target="_blank"
              rel="noopener"
              className="ml-auto text-xs text-gray-400 hover:text-brand hover:underline"
            >
              View run on GitHub ↗
            </a>
          ) : null}
        </div>
      </Card>

      {phase === "success" ? (
        <Banner kind="info">
          <strong>One step left:</strong> attach the custom domain{" "}
          <code>{domain.replace(/^https?:\/\//, "")}</code> to the <code>{slug}</code> project in the
          Cloudflare dashboard (Custom domains → Set up a domain).
        </Banner>
      ) : null}

      {phase === "success" ? (
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-brand hover:underline">
            Back to all sites
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function StepIcon({ status, conclusion }: { status: string; conclusion: string | null }) {
  if (status === "in_progress") return <Spinner className="h-4 w-4" />;
  if (status !== "completed") return <span className="h-4 w-4 rounded-full border-2 border-gray-300" />;
  if (conclusion === "success")
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="m2 5.4 2 2 4-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  if (conclusion === "skipped") return <span className="h-4 w-4 rounded-full border-2 border-gray-200" />;
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
        <path d="m1.5 1.5 5 5M6.5 1.5l-5 5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}
