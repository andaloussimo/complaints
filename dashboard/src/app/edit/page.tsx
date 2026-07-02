"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Banner, Button, Card, Field, TextArea, TextInput } from "@/components/ui";
import { HubSpotFields } from "@/components/HubSpotFields";
import { getSite, saveSite, uploadLogo, type SiteDetail } from "@/lib/api";
import { hexToRgbTriplet, rgbTripletToHex, validateContent, validateTheme } from "@/lib/validate";
import { LANGS, type SiteContent, type SiteTheme } from "@/lib/types";

export default function EditPage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<SiteDetail | null>(null);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [theme, setTheme] = useState<SiteTheme | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("site");
    setSlug(s);
    if (!s) {
      setError("No site specified.");
      return;
    }
    getSite(s)
      .then((d) => {
        setDetail(d);
        setContent(d.content);
        setTheme(d.theme);
      })
      .catch((e) => setError(e.message));
  }, []);

  function patchContent(fn: (c: SiteContent) => void) {
    setContent((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }
  function patchTheme(fn: (t: SiteTheme) => void) {
    setTheme((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }

  async function onLogo(file: File) {
    if (!slug) return;
    setBusy(true);
    setError(null);
    try {
      const name = await uploadLogo(slug, file);
      patchContent((c) => {
        c.brand.logo = name;
        c.brand.logoAlt = c.brand.logoAlt ?? c.brand.name;
      });
      setNotice(`Logo uploaded (${name}) and committed. It will show after the next build.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Logo upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!slug || !detail || !content || !theme) return;
    setError(null);
    setNotice(null);
    const cv = validateContent(content);
    if (!cv.ok) return setError(cv.error);
    const tv = validateTheme(theme);
    if (!tv.ok) return setError(tv.error);
    setBusy(true);
    try {
      await saveSite(slug, {
        content,
        contentSha: detail.contentSha,
        theme,
        themeSha: detail.themeSha,
      });
      setNotice("Saved. A rebuild is running — changes go live in a minute or two.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (error && !content) {
    return (
      <div className="space-y-4">
        <Banner kind="error">{error}</Banner>
        <Link href="/"><Button variant="ghost">Back to sites</Button></Link>
      </div>
    );
  }
  if (!content || !theme) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit <span className="text-brand">{content.brand.name}</span>
        </h1>
        <Link href="/"><Button variant="ghost">Back</Button></Link>
      </div>

      {error ? <Banner kind="error">{error}</Banner> : null}
      {notice ? <Banner kind="ok">{notice}</Banner> : null}

      {/* Brand + logo */}
      <Card className="space-y-4">
        <h2 className="font-semibold text-gray-900">Brand</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand name">
            <TextInput value={content.brand.name} onChange={(e) => patchContent((c) => { c.brand.name = e.target.value; })} />
          </Field>
          <Field label="Logo" hint={content.brand.logo ? `Current: ${content.brand.logo}` : "No logo — header shows the name as text"}>
            <input
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onLogo(f); }}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-white"
            />
          </Field>
        </div>
      </Card>

      {/* Meta */}
      <Card className="space-y-4">
        <h2 className="font-semibold text-gray-900">General</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Page title (SEO)">
            <TextInput value={content.meta.title} onChange={(e) => patchContent((c) => { c.meta.title = e.target.value; })} />
          </Field>
          <Field label="Site URL" hint="https://acme.com">
            <TextInput value={content.meta.siteUrl ?? ""} onChange={(e) => patchContent((c) => { c.meta.siteUrl = e.target.value; })} />
          </Field>
          <Field label="Form language">
            <select
              value={content.meta.formLang}
              onChange={(e) => patchContent((c) => { c.meta.formLang = e.target.value; })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Operator code (HubSpot)">
            <TextInput value={content.home.operatorCode ?? ""} onChange={(e) => patchContent((c) => { c.home.operatorCode = e.target.value; })} />
          </Field>
        </div>
      </Card>

      {/* Hero */}
      <Card className="space-y-4">
        <h2 className="font-semibold text-gray-900">Home hero</h2>
        <Field label="Title">
          <TextInput value={content.home.hero.title} onChange={(e) => patchContent((c) => { c.home.hero.title = e.target.value; })} />
        </Field>
        <Field label="Subtitle">
          <TextInput value={content.home.hero.subtitle ?? ""} onChange={(e) => patchContent((c) => { c.home.hero.subtitle = e.target.value; })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Form title">
            <TextInput value={content.home.formTitle ?? ""} onChange={(e) => patchContent((c) => { c.home.formTitle = e.target.value; })} />
          </Field>
          <Field label="Form intro">
            <TextInput value={content.home.formIntro ?? ""} onChange={(e) => patchContent((c) => { c.home.formIntro = e.target.value; })} />
          </Field>
        </div>
      </Card>

      {/* Contact channels */}
      <Card className="space-y-4">
        <h2 className="font-semibold text-gray-900">Contact</h2>
        {content.contact.channels.map((ch, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <Field label="Label"><TextInput value={ch.label} onChange={(e) => patchContent((c) => { c.contact.channels[i].label = e.target.value; })} /></Field>
            <Field label={`Value (${ch.type})`}>
              <TextInput
                value={ch.value}
                onChange={(e) => patchContent((c) => {
                  const v = e.target.value;
                  c.contact.channels[i].value = v;
                  if (ch.type === "email") c.contact.channels[i].href = `mailto:${v}`;
                  if (ch.type === "phone") c.contact.channels[i].href = `tel:${v.replace(/[^+\d]/g, "")}`;
                })}
              />
            </Field>
          </div>
        ))}
      </Card>

      {/* HubSpot routing (pipeline/stage/owner/priority/routing prop) */}
      <Card className="space-y-4">
        <h2 className="font-semibold text-gray-900">HubSpot routing</h2>
        <p className="text-xs text-gray-500">
          Where this site&apos;s refund tickets land. Empty fields fall back to the shared
          defaults. Applied on the next publish.
        </p>
        <HubSpotFields
          value={content.hubspot ?? {}}
          onChange={(next) => patchContent((c) => { c.hubspot = next; })}
        />
      </Card>

      {/* Theme colors */}
      <Card className="space-y-4">
        <h2 className="font-semibold text-gray-900">Theme</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(theme.colors) as Array<keyof SiteTheme["colors"]>).map((key) => (
            <Field key={key} label={key}>
              <input
                type="color"
                value={rgbTripletToHex(theme.colors[key])}
                onChange={(e) => {
                  const rgb = hexToRgbTriplet(e.target.value);
                  if (rgb) patchTheme((t) => { t.colors[key] = rgb; });
                }}
                className="h-9 w-full cursor-pointer rounded-md border border-gray-300"
              />
            </Field>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Radius"><TextInput value={theme.radius} onChange={(e) => patchTheme((t) => { t.radius = e.target.value; })} /></Field>
          <Field label="Font family"><TextInput value={theme.fontFamily} onChange={(e) => patchTheme((t) => { t.fontFamily = e.target.value; })} /></Field>
          <Field label="Font URL"><TextInput value={theme.fontUrl ?? ""} onChange={(e) => patchTheme((t) => { t.fontUrl = e.target.value; })} /></Field>
        </div>
      </Card>

      {/* Advanced raw JSON (legal pages, footer, nav, etc.) */}
      <AdvancedJson content={content} onParsed={setContent} />

      <div className="sticky bottom-4 flex gap-3">
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save & publish"}</Button>
        <Link href="/"><Button variant="ghost">Cancel</Button></Link>
      </div>
    </div>
  );
}

/** Full content.json editor for fields not covered by the guided forms. */
function AdvancedJson({ content, onParsed }: { content: SiteContent; onParsed: (c: SiteContent) => void }) {
  const [open, setOpen] = useState(false);
  const pretty = useMemo(() => JSON.stringify(content, null, 2), [content]);
  const [draft, setDraft] = useState(pretty);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Keep the draft in sync when guided fields change (only while collapsed).
  useEffect(() => {
    if (!open) setDraft(pretty);
  }, [pretty, open]);

  return (
    <Card className="space-y-3">
      <button type="button" onClick={() => setOpen((o) => !o)} className="text-sm font-semibold text-gray-700">
        {open ? "▾" : "▸"} Advanced — full content JSON (legal pages, footer, nav…)
      </button>
      {open ? (
        <>
          <TextArea
            rows={18}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              try {
                const parsed = JSON.parse(e.target.value);
                setJsonError(null);
                onParsed(parsed);
              } catch {
                setJsonError("Invalid JSON — fix to apply changes.");
              }
            }}
          />
          {jsonError ? <p className="text-xs text-red-600">{jsonError}</p> : null}
          <p className="text-xs text-gray-500">
            Edits here apply to the whole content object and stay in sync with the guided fields.
          </p>
        </>
      ) : null}
    </Card>
  );
}
