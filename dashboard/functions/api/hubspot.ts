// GET /api/hubspot -> pipelines (with stages) + owners for the routing
// dropdowns, fetched live from HubSpot like the WP plugin's settings page did.
// Uses HUBSPOT_TOKEN on the dashboard project (server-side only). Degrades
// gracefully: no token or an API error returns configured:false and the UI
// falls back to free-text ID inputs.
import { json, guard } from "../../src/lib/http";
import type { Env } from "../../src/lib/env";
import type { HubSpotMeta } from "../../src/lib/types";

const API_BASE = "https://api.hubapi.com";

async function hs(token: string, endpoint: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(API_BASE + endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  return guard(async () => {
    const token = (context.env.HUBSPOT_TOKEN ?? "").trim();
    const empty: HubSpotMeta = { configured: false, pipelines: [], owners: [] };
    if (!token) return json(empty);

    const [pipeData, ownerData] = await Promise.all([
      hs(token, "/crm/v3/pipelines/tickets"),
      hs(token, "/crm/v3/owners?limit=100"),
    ]);
    if (!pipeData) return json(empty);

    const pipelines = ((pipeData.results as Array<Record<string, unknown>>) ?? []).map((p) => {
      const stages = ((p.stages as Array<Record<string, unknown>>) ?? [])
        .slice()
        .sort((a, b) => ((a.displayOrder as number) ?? 0) - ((b.displayOrder as number) ?? 0))
        .map((s) => ({ id: String(s.id), label: String(s.label ?? s.id) }));
      return { id: String(p.id), label: String(p.label ?? p.id), stages };
    });

    const owners = (((ownerData?.results as Array<Record<string, unknown>>) ?? [])).map((o) => {
      const name = [o.firstName, o.lastName].filter(Boolean).join(" ").trim();
      const email = o.email ? String(o.email) : "";
      const label = name ? (email ? `${name} (${email})` : name) : email || String(o.id);
      return { id: String(o.id), label };
    });

    const meta: HubSpotMeta = { configured: true, pipelines, owners };
    return json(meta);
  });
}
