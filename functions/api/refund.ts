/**
 * Cloudflare Pages Function — POST /api/refund
 *
 * Replaces the old Next.js API route (static export can't include one). Same URL
 * and same JSON contract, so the RefundForm client needs no change. Runs on the
 * Workers runtime; the HubSpot secrets come from the Pages project's environment
 * (context.env), NOT from process.env.
 *
 * Uses relative imports (Pages Functions don't resolve the "@/*" tsconfig alias)
 * and only Web APIs, so no nodejs_compat flag is required.
 */

import { submitRefund, type HubSpotConfig } from "../../src/lib/hubspot";
import {
  ALLOWED_EXT,
  MAX_BYTES,
  getFormStrings,
  normalizeLang,
} from "../../src/lib/formStrings";

/** Runtime environment (secrets/vars set on the Cloudflare Pages project). */
interface Env {
  HUBSPOT_TOKEN?: string;
  HUBSPOT_PIPELINE?: string;
  HUBSPOT_STAGE?: string;
  HUBSPOT_OWNER?: string;
  HUBSPOT_PRIORITY?: string;
  HUBSPOT_ROUTING_PROP?: string;
  HUBSPOT_ROUTING_VALUE?: string;
  HUBSPOT_OPERATOR_PROP?: string;
  HUBSPOT_OPERATOR_CODE?: string;
  HUBSPOT_ORIGIN_PROP?: string;
  HUBSPOT_ORIGIN_VALUE?: string;
}

function configFromEnv(env: Env): HubSpotConfig {
  return {
    token: (env.HUBSPOT_TOKEN ?? "").trim(),
    pipeline: env.HUBSPOT_PIPELINE?.trim(),
    stage: env.HUBSPOT_STAGE?.trim(),
    owner: env.HUBSPOT_OWNER?.trim(),
    priority: env.HUBSPOT_PRIORITY?.trim(),
    routingProp: env.HUBSPOT_ROUTING_PROP?.trim(),
    routingValue: env.HUBSPOT_ROUTING_VALUE?.trim(),
    operatorProp: env.HUBSPOT_OPERATOR_PROP?.trim(),
    operatorCode: env.HUBSPOT_OPERATOR_CODE?.trim(),
    originProp: (env.HUBSPOT_ORIGIN_PROP ?? "ticketorigin").trim(),
    originValue: (env.HUBSPOT_ORIGIN_VALUE ?? "nextjs").trim(),
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function validFile(file: unknown): file is File {
  if (!(file instanceof File) || file.size === 0) return false;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (ALLOWED_EXT as readonly string[]).includes(ext) && file.size <= MAX_BYTES;
}

// Cloudflare Pages Function signature: onRequestPost({ request, env }).
export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ success: false, message: getFormStrings(normalizeLang("en")).err }, 400);
  }

  const t = getFormStrings(normalizeLang(String(form.get("lang") ?? "en")));

  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("telephone") ?? "").trim();
  const comment = String(form.get("commentaire") ?? "").trim();
  const operatorCode = String(form.get("operator_value") ?? "").trim();
  const certif = form.get("certif");
  const cgu = form.get("cgu");
  const rib = form.get("rib");
  const facture = form.get("facture");

  // Validation mirrors the client + the original route handler.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !phone) {
    return json({ success: false, message: t.err_required }, 400);
  }
  if (!certif || !cgu) {
    return json({ success: false, message: t.err_consent }, 400);
  }
  if (!validFile(rib) || !validFile(facture)) {
    return json({ success: false, message: t.err_type }, 400);
  }

  const result = await submitRefund(
    { email, phone, comment, operatorCode, files: [rib, facture] },
    t,
    configFromEnv(env),
  );

  if (!result.ok) {
    console.error("[refund] failed:", result.detail);
    return json({ success: false, message: t.err }, 502);
  }

  return json({ success: true, ticket_id: result.ticketId });
}
