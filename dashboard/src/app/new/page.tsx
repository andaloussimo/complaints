"use client";

import { useState } from "react";
import Link from "next/link";
import { Banner, Button, Card, Field, TextInput } from "@/components/ui";
import { createSite } from "@/lib/api";
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
};

export default function NewSitePage() {
  const [form, setForm] = useState<CreateSiteInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof CreateSiteInput>(key: K, value: CreateSiteInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setError(null);
    const v = validateCreateInput(form);
    if (!v.ok) return setError(v.error);
    setBusy(true);
    try {
      await createSite(form);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create site");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Card className="space-y-4">
        <Banner kind="ok">
          <strong>{form.brand}</strong> is being created. The build runs in GitHub Actions and
          usually finishes in a minute or two.
        </Banner>
        <p className="text-sm text-gray-600">
          Once it&apos;s live you can edit it from the sites list. Don&apos;t forget to attach the
          custom domain to the <code>{form.slug}</code> Cloudflare Pages project.
        </p>
        <div className="flex gap-3">
          <Link href="/">
            <Button>Back to sites</Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              setForm(EMPTY);
              setDone(false);
            }}
          >
            Create another
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New site</h1>
      {error ? <Banner kind="error">{error}</Banner> : null}
      <Card className="space-y-4">
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
            <select
              value={form.lang}
              onChange={(e) => set("lang", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Brand color">
            <input
              type="color"
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
              className="h-10 w-full cursor-pointer rounded-md border border-gray-300"
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
        <div className="flex gap-3">
          <Button onClick={submit} disabled={busy}>
            {busy ? "Creating…" : "Create site"}
          </Button>
          <Link href="/">
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
