// GET /api/sites   -> list site summaries
// POST /api/sites  -> create a site (dispatches new-site.yml)
import { githubFromEnv } from "../../src/lib/github";
import { validateCreateInput, normalizeDomain } from "../../src/lib/validate";
import { json, guard } from "../../src/lib/http";
import type { Env } from "../../src/lib/env";
import type { CreateSiteInput, SiteSummary } from "../../src/lib/types";

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  return guard(async () => {
    const gh = githubFromEnv(context.env);
    const entries = await gh.listDir("sites");
    const slugs = entries
      .filter((e) => e.type === "dir" && !e.name.startsWith("_"))
      .map((e) => e.name);

    // Fetch all summaries in parallel — sequential fetching would make the
    // list crawl once there are dozens of sites.
    const sites = (
      await Promise.all(
        slugs.map(async (slug): Promise<SiteSummary | null> => {
          const f = await gh.getFile(`sites/${slug}/content.json`).catch(() => null);
          if (!f) return null;
          try {
            const c = JSON.parse(f.text);
            return {
              slug,
              brand: c.brand?.name ?? slug,
              siteUrl: c.meta?.siteUrl,
              formLang: c.meta?.formLang ?? "en",
            };
          } catch {
            return { slug, brand: slug, formLang: "en" };
          }
        }),
      )
    ).filter((s): s is SiteSummary => s !== null);
    return json({ sites });
  });
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  return guard(async () => {
    const input = (await context.request.json()) as Partial<CreateSiteInput>;
    const v = validateCreateInput(input);
    if (!v.ok) return json({ error: v.error }, 400);

    const gh = githubFromEnv(context.env);
    const hubspot = input.hubspot && Object.values(input.hubspot).some((v) => v?.trim())
      ? JSON.stringify(input.hubspot)
      : "";
    await gh.dispatchWorkflow("new-site.yml", {
      slug: String(input.slug).toLowerCase().trim(),
      brand: String(input.brand).trim(),
      domain: normalizeDomain(input.domain ?? "") ?? "",
      color: input.color?.trim() ?? "",
      lang: String(input.lang),
      email: input.email?.trim() ?? "",
      phone: input.phone?.trim() ?? "",
      operator: input.operator?.trim() ?? "",
      hubspot,
    });
    return json({ ok: true });
  });
}
