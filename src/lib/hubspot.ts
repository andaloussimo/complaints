/**
 * Runtime-agnostic HubSpot client. Ported from the WordPress plugin
 * (Refund_HubSpot_V2). Flow on submit:
 *   1. upload each file privately        -> file ids
 *   2. upsert the contact (by email)     -> contact id
 *   3. create the ticket (assoc contact) -> ticket id
 *   4. create a note w/ attachments      -> linked to the ticket
 *
 * Uses only Web APIs (fetch/FormData/File), so it runs on both Node and the
 * Cloudflare Workers runtime. Configuration is passed in explicitly (never read
 * from process.env here) so the same code works in a Cloudflare Pages Function
 * where secrets live on `context.env`. The token never reaches the browser —
 * this module is imported only by functions/api/refund.ts.
 */

import type { FormStrings } from "./formStrings";

const API_BASE = "https://api.hubapi.com";
const FILE_FOLDER = "/refund-tickets";
const ASSOC_TICKET_TO_CONTACT = 16;
const ASSOC_NOTE_TO_TICKET = 228;

/** All HubSpot settings for a single site (built from env/secrets by the caller). */
export interface HubSpotConfig {
  token: string;
  pipeline?: string;
  stage?: string;
  owner?: string;
  priority?: string;
  routingProp?: string;
  routingValue?: string;
  operatorProp?: string;
  operatorCode?: string;
  originProp?: string;
  originValue?: string;
}

interface ApiResult<T = Record<string, unknown>> {
  code: number;
  data: T;
}

async function api<T = Record<string, unknown>>(
  token: string,
  method: string,
  endpoint: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  const res = await fetch(API_BASE + endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { code: res.status, data };
}

interface Stage {
  id: string;
  label: string;
  displayOrder?: number;
}
interface Pipeline {
  id: string;
  label: string;
  stages: Stage[];
}

async function fetchPipelines(token: string): Promise<Pipeline[]> {
  const { code, data } = await api<{ results?: Array<Record<string, unknown>> }>(
    token,
    "GET",
    "/crm/v3/pipelines/tickets",
  );
  if (code !== 200 || !Array.isArray(data.results)) return [];
  return data.results.map((p) => {
    const stages = (((p as { stages?: Stage[] }).stages) ?? [])
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return {
      id: String((p as { id: string }).id),
      label: String((p as { label?: string }).label ?? (p as { id: string }).id),
      stages,
    };
  });
}

/** Resolve pipeline + stage from config, falling back to the first available. */
async function resolvePipelineStage(
  config: HubSpotConfig,
): Promise<{ pipeline: string; stage: string }> {
  const wantPipe = config.pipeline ?? "";
  const wantStage = config.stage ?? "";
  const pipelines = await fetchPipelines(config.token);
  if (pipelines.length === 0) {
    // Let HubSpot apply defaults if we truly can't read pipelines.
    return { pipeline: wantPipe, stage: wantStage };
  }
  const pipe = pipelines.find((p) => p.id === wantPipe) ?? pipelines[0];
  const stage =
    (wantStage && pipe.stages.find((s) => s.id === wantStage)?.id) ||
    pipe.stages[0]?.id ||
    "";
  return { pipeline: pipe.id, stage };
}

async function uploadFile(token: string, file: File): Promise<string | null> {
  const options = JSON.stringify({
    access: "PRIVATE",
    overwrite: false,
    duplicateValidationStrategy: "NONE",
    duplicateValidationScope: "EXACT_FOLDER",
  });
  const fd = new FormData();
  fd.append("folderPath", FILE_FOLDER);
  fd.append("options", options);
  fd.append("file", file, file.name);

  const res = await fetch(`${API_BASE}/files/v3/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return data.id ?? null;
}

async function upsertContact(
  token: string,
  email: string,
  phone: string,
): Promise<string | null> {
  // Try create; on conflict, find the existing contact and update it.
  const create = await api<{ id?: string }>(token, "POST", "/crm/v3/objects/contacts", {
    properties: { email, phone },
  });
  if (create.data?.id) return create.data.id;

  // Search by email, then patch.
  const search = await api<{ results?: Array<{ id: string }> }>(
    token,
    "POST",
    "/crm/v3/objects/contacts/search",
    {
      filterGroups: [
        { filters: [{ propertyName: "email", operator: "EQ", value: email }] },
      ],
      properties: ["email"],
      limit: 1,
    },
  );
  const id = search.data?.results?.[0]?.id;
  if (!id) return null;
  await api(token, "PATCH", `/crm/v3/objects/contacts/${id}`, { properties: { phone } });
  return id;
}

export interface RefundSubmission {
  email: string;
  phone: string;
  comment: string;
  operatorCode: string;
  files: File[]; // [rib, facture]
}

export interface RefundResult {
  ok: boolean;
  ticketId?: string;
  contactId?: string | null;
  fileIds?: string[];
  detail?: string;
}

/** Full submit flow. `config` carries the site's HubSpot settings/secrets. */
export async function submitRefund(
  input: RefundSubmission,
  strings: FormStrings,
  config: HubSpotConfig,
): Promise<RefundResult> {
  const token = (config.token ?? "").trim();
  if (!token) return { ok: false, detail: "no token configured" };

  // 1. Upload files
  const fileIds: string[] = [];
  for (const file of input.files) {
    const id = await uploadFile(token, file);
    if (id) fileIds.push(id);
  }

  // 2. Contact
  const contactId = await upsertContact(token, input.email, input.phone);

  // 3. Ticket
  const { pipeline, stage } = await resolvePipelineStage(config);
  const props: Record<string, string> = {
    subject: `${strings.subject_prefix} · ${input.phone} · ${input.email}`,
    content: input.comment || "(no comment provided)",
    source_type: "FORM",
  };
  if (pipeline) props.hs_pipeline = pipeline;
  if (stage) props.hs_pipeline_stage = stage;

  if (config.originProp) props[config.originProp] = config.originValue || "nextjs";
  if (config.owner) props.hubspot_owner_id = config.owner;
  if (config.priority) props.hs_ticket_priority = config.priority;
  if (config.routingProp && config.routingValue) {
    props[config.routingProp] = config.routingValue;
  }
  const opCode = input.operatorCode || config.operatorCode || "";
  if (config.operatorProp && opCode) props[config.operatorProp] = opCode;

  const associations = contactId
    ? [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: ASSOC_TICKET_TO_CONTACT,
            },
          ],
        },
      ]
    : [];

  const ticket = await api<{ id?: string; message?: string }>(
    token,
    "POST",
    "/crm/v3/objects/tickets",
    { properties: props, associations },
  );
  const ticketId = ticket.data?.id;
  if (!ticketId) {
    return {
      ok: false,
      detail: `ticket failed (HTTP ${ticket.code}: ${ticket.data?.message ?? "unknown"})`,
      fileIds,
    };
  }

  // 4. Note with attachments
  if (fileIds.length) {
    await api(token, "POST", "/crm/v3/objects/notes", {
      properties: {
        hs_timestamp: Date.now(),
        hs_note_body: strings.note_body,
        hs_attachment_ids: fileIds.join(";"),
      },
      associations: [
        {
          to: { id: ticketId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: ASSOC_NOTE_TO_TICKET,
            },
          ],
        },
      ],
    });
  }

  return { ok: true, ticketId, contactId, fileIds };
}
