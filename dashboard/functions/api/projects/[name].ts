// GET /api/projects/:name -> the Cloudflare Pages project's REAL urls.
// pages.dev subdomains are globally unique, so "<slug>.pages.dev" is only a
// guess — if the name was taken, Cloudflare assigned a suffixed subdomain.
// Needs CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID on the dashboard project;
// without them (or on any error) returns configured:false and the UI keeps
// the guessed URL as a fallback.
import { json, guard } from "../../../src/lib/http";
import type { Env } from "../../../src/lib/env";

export async function onRequestGet(context: {
  env: Env;
  params: { name: string };
}): Promise<Response> {
  return guard(async () => {
    const name = String(context.params.name);
    const token = (context.env.CLOUDFLARE_API_TOKEN ?? "").trim();
    const account = (context.env.CLOUDFLARE_ACCOUNT_ID ?? "").trim();
    if (!token || !account || !/^[a-z0-9-]+$/.test(name)) {
      return json({ configured: false });
    }

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${name}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return json({ configured: false, exists: res.status !== 404 ? undefined : false });

    const data = (await res.json()) as {
      result?: { subdomain?: string; domains?: string[] };
    };
    const subdomain = data.result?.subdomain ?? "";
    return json({
      configured: true,
      exists: true,
      url: subdomain ? `https://${subdomain}` : undefined,
      domains: data.result?.domains ?? [],
    });
  });
}
