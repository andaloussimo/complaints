"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Field } from "@/components/molecules/Field";
import { cn } from "@/lib/cn";
import { ALLOWED_EXT, MAX_BYTES, type FormStrings } from "@/lib/formStrings";

interface RefundFormProps {
  strings: FormStrings;
  lang: string;
  endpoint: string;
  operatorCode?: string;
}

type Status = { kind: "ok" | "bad"; text: string } | null;

const STEPS = 3;

export function RefundForm({ strings: t, lang, endpoint, operatorCode }: RefundFormProps) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);
  const [ribName, setRibName] = useState(t.no_file);
  const [factureName, setFactureName] = useState(t.no_file);
  const formRef = useRef<HTMLFormElement>(null);

  const accept = useMemo(() => ALLOWED_EXT.map((e) => "." + e).join(","), []);

  function fail(text: string) {
    setStatus({ kind: "bad", text });
    return false;
  }

  function validateStep(index: number): boolean {
    const form = formRef.current;
    if (!form) return false;
    setStatus(null);
    const panel = form.querySelector<HTMLElement>(`[data-step="${index}"]`);
    if (!panel) return true;

    const required = panel.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[required]");
    for (const el of Array.from(required)) {
      if (el instanceof HTMLInputElement && el.type === "checkbox" && !el.checked) {
        return fail(t.err_consent);
      }
      if (el instanceof HTMLInputElement && el.type === "file") {
        const file = el.files?.[0];
        if (!file) return fail(t.err_required);
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!(ALLOWED_EXT as readonly string[]).includes(ext)) return fail(t.err_type);
        if (file.size > MAX_BYTES) return fail(t.err_size);
        continue;
      }
      if (!el.value.trim()) return fail(t.err_required);
      if (el instanceof HTMLInputElement && el.type === "email") {
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value)) return fail(t.err_email);
      }
    }
    return true;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS - 1));
  }
  function prev() {
    setStatus(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateStep(step)) return;
    const form = formRef.current;
    if (!form) return;

    const fd = new FormData(form);
    fd.append("lang", lang);
    if (operatorCode) fd.set("operator_value", operatorCode);

    setSending(true);
    setStatus(null);
    try {
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setStatus({ kind: "ok", text: t.ok });
        form.reset();
        setRibName(t.no_file);
        setFactureName(t.no_file);
        setStep(0);
      } else {
        setStatus({ kind: "bad", text: data?.message || t.err });
      }
    } catch {
      setStatus({ kind: "bad", text: t.err });
    } finally {
      setSending(false);
    }
  }

  const headers = [t.step1, t.step2, t.step3];

  return (
    <div className="overflow-hidden rounded-theme border border-line bg-surface shadow-sm">
      {/* Step header */}
      <ol className="flex bg-brand text-brand-fg">
        {headers.map((label, i) => (
          <li key={i} className="flex flex-1 flex-col items-center gap-2 px-2 py-4 text-center">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                i <= step ? "bg-accent text-accent-fg" : "bg-white/25",
              )}
            >
              {i + 1}
            </span>
            <span className="text-xs sm:text-sm">{label}</span>
          </li>
        ))}
      </ol>

      <form ref={formRef} onSubmit={onSubmit} noValidate encType="multipart/form-data" className="p-6">
        {/* Step 1 — identity */}
        <div data-step={0} hidden={step !== 0}>
          <Field label={t.phone_label} tip={t.phone_tip} htmlFor="rf-phone">
            <Input id="rf-phone" type="tel" name="telephone" required />
          </Field>
          <Field label={t.email_label} tip={t.email_tip} htmlFor="rf-email">
            <Input id="rf-email" type="email" name="email" required />
          </Field>
          <Field label={t.iban_label} tip={t.iban_tip} hint={t.file_hint}>
            <FilePicker
              id="rf-rib"
              name="rib"
              accept={accept}
              chooseLabel={t.choose}
              viewLabel={t.view}
              fileName={ribName}
              onName={setRibName}
              noFileLabel={t.no_file}
            />
          </Field>
        </div>

        {/* Step 2 — documents */}
        <div data-step={1} hidden={step !== 1}>
          <Field label={t.invoice_label} tip={t.invoice_tip} hint={t.file_hint}>
            <FilePicker
              id="rf-facture"
              name="facture"
              accept={accept}
              chooseLabel={t.choose}
              viewLabel={t.view}
              fileName={factureName}
              onName={setFactureName}
              noFileLabel={t.no_file}
            />
          </Field>
          <Field label={t.comments_label} htmlFor="rf-comment">
            <Textarea id="rf-comment" name="commentaire" maxLength={500} />
          </Field>
        </div>

        {/* Step 3 — consent */}
        <div data-step={2} hidden={step !== 2}>
          <div className="space-y-4">
            <Checkbox name="certif" required>
              {t.certif}
            </Checkbox>
            <Checkbox name="cgu" required>
              {t.cgu}
            </Checkbox>
          </div>
          <p className="mt-4 text-sm text-ink/60">{t.privacy}</p>
        </div>

        <input type="hidden" name="operator_value" defaultValue={operatorCode ?? ""} />

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={prev} className={cn(step === 0 && "invisible")}>
            {t.prev}
          </Button>
          {step < STEPS - 1 ? (
            <Button type="button" variant="brand" onClick={next}>
              {t.next}
            </Button>
          ) : (
            <Button type="submit" variant="accent" disabled={sending}>
              {sending ? t.sending : t.submit}
            </Button>
          )}
        </div>

        {status ? (
          <p
            className={cn(
              "mt-4 rounded-theme border px-4 py-3 text-sm",
              status.kind === "ok"
                ? "border-success/30 bg-success/10 text-success"
                : "border-danger/30 bg-danger/10 text-danger",
            )}
          >
            {status.text}
          </p>
        ) : null}
      </form>
    </div>
  );
}

interface FilePickerProps {
  id: string;
  name: string;
  accept: string;
  chooseLabel: string;
  viewLabel: string;
  noFileLabel: string;
  fileName: string;
  onName: (name: string) => void;
}

function FilePicker({ id, name, accept, chooseLabel, viewLabel, noFileLabel, fileName, onName }: FilePickerProps) {
  const [url, setUrl] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3 rounded-theme border border-line bg-muted px-3 py-2.5">
      <label
        htmlFor={id}
        className="cursor-pointer rounded border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-muted"
      >
        {chooseLabel}
      </label>
      <input
        id={id}
        type="file"
        name={name}
        accept={accept}
        required
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (url) URL.revokeObjectURL(url);
          if (file) {
            onName(file.name);
            setUrl(URL.createObjectURL(file));
          } else {
            onName(noFileLabel);
            setUrl(null);
          }
        }}
      />
      <span className="truncate text-xs text-ink/60">{fileName}</span>
      {url ? (
        <button
          type="button"
          onClick={() => window.open(url, "_blank", "noopener")}
          className="ml-auto rounded bg-brand px-3 py-1.5 text-xs text-brand-fg"
        >
          {viewLabel}
        </button>
      ) : null}
    </div>
  );
}
