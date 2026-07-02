"use client";

import { useEffect, useState } from "react";
import { Field, TextInput } from "@/components/ui";
import { getHubSpotMeta } from "@/lib/api";
import type { HubSpotMeta, HubSpotSettings } from "@/lib/types";

/**
 * Shared "HubSpot routing" fields for the create and edit forms — the same
 * options the WP plugin's settings page had. Pipeline/stage/owner render as
 * live dropdowns fetched from HubSpot when the dashboard has a HUBSPOT_TOKEN;
 * otherwise they degrade to free-text ID inputs.
 */
export function HubSpotFields({
  value,
  onChange,
}: {
  value: HubSpotSettings;
  onChange: (next: HubSpotSettings) => void;
}) {
  const [meta, setMeta] = useState<HubSpotMeta | null>(null);

  useEffect(() => {
    getHubSpotMeta().then(setMeta).catch(() => setMeta({ configured: false, pipelines: [], owners: [] }));
  }, []);

  function set<K extends keyof HubSpotSettings>(key: K, v: HubSpotSettings[K]) {
    const next = { ...value, [key]: v };
    // Changing pipeline invalidates the chosen stage (mirrors the plugin UI).
    if (key === "pipeline") next.stage = "";
    onChange(next);
  }

  const live = !!meta?.configured && (meta?.pipelines.length ?? 0) > 0;
  const pipeline = meta?.pipelines.find((p) => p.id === value.pipeline);
  const selectCls = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

  return (
    <>
      {meta && !meta.configured ? (
        <p className="text-xs text-amber-600">
          Live pipeline/owner lists unavailable (set <code>HUBSPOT_TOKEN</code> on the dashboard
          project to enable dropdowns). You can still enter IDs manually.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pipeline (Help Desk queue)" hint="Empty = auto-detect / shared default">
          {live ? (
            <select value={value.pipeline ?? ""} onChange={(e) => set("pipeline", e.target.value)} className={selectCls}>
              <option value="">— Auto-detect (default) —</option>
              {meta!.pipelines.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          ) : (
            <TextInput value={value.pipeline ?? ""} onChange={(e) => set("pipeline", e.target.value)} placeholder="pipeline id" />
          )}
        </Field>
        <Field label="Stage" hint="Empty = first stage of the pipeline">
          {live ? (
            <select value={value.stage ?? ""} onChange={(e) => set("stage", e.target.value)} className={selectCls}>
              <option value="">— First stage —</option>
              {(pipeline?.stages ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          ) : (
            <TextInput value={value.stage ?? ""} onChange={(e) => set("stage", e.target.value)} placeholder="stage id" />
          )}
        </Field>
        <Field label="Assign to owner" hint="Also sets the ticket's assigned team">
          {live && meta!.owners.length ? (
            <select value={value.owner ?? ""} onChange={(e) => set("owner", e.target.value)} className={selectCls}>
              <option value="">— Unassigned —</option>
              {meta!.owners.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          ) : (
            <TextInput value={value.owner ?? ""} onChange={(e) => set("owner", e.target.value)} placeholder="owner id (numeric)" />
          )}
        </Field>
        <Field label="Priority">
          <select
            value={value.priority ?? ""}
            onChange={(e) => set("priority", e.target.value as HubSpotSettings["priority"])}
            className={selectCls}
          >
            <option value="">— None —</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </Field>
        <Field label="Routing property" hint="Internal name, e.g. refund_source — must exist on the Ticket object">
          <TextInput value={value.routingProp ?? ""} onChange={(e) => set("routingProp", e.target.value)} placeholder="refund_source" />
        </Field>
        <Field label="Routing value" hint="Stamped on every ticket from this site">
          <TextInput value={value.routingValue ?? ""} onChange={(e) => set("routingValue", e.target.value)} placeholder="81056.fr" />
        </Field>
        <Field label="Operator code property" hint="Ticket property that holds the operator code">
          <TextInput value={value.operatorProp ?? ""} onChange={(e) => set("operatorProp", e.target.value)} placeholder="operator_code" />
        </Field>
      </div>
    </>
  );
}
