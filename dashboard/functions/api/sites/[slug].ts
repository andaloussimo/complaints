// GET /api/sites/:slug  -> content.json + theme.json (+ SHAs for updates)
// PUT /api/sites/:slug  -> commit edited content/theme (triggers deploy.yml)
import { githubFromEnv } from "../../../src/lib/github";
import { validateContent, validateTheme, normalizeContent } from "../../../src/lib/validate";
import { json, guard } from "../../../src/lib/http";
import type { Env } from "../../../src/lib/env";
import type { SiteContent, SiteTheme } from "../../../src/lib/types";

export async function onRequestGet(context: {
  env: Env;
  params: { slug: string };
}): Promise<Response> {
  return guard(async () => {
    const slug = String(context.params.slug);
    const gh = githubFromEnv(context.env);
    const [cf, tf] = await Promise.all([
      gh.getFile(`sites/${slug}/content.json`),
      gh.getFile(`sites/${slug}/theme.json`),
    ]);
    if (!cf || !tf) return json({ error: "Site not found" }, 404);
    return json({
      slug,
      content: JSON.parse(cf.text),
      contentSha: cf.sha,
      theme: JSON.parse(tf.text),
      themeSha: tf.sha,
    });
  });
}

export async function onRequestPut(context: {
  request: Request;
  env: Env;
  params: { slug: string };
}): Promise<Response> {
  return guard(async () => {
    const slug = String(context.params.slug);
    const body = (await context.request.json()) as {
      content: SiteContent;
      contentSha: string;
      theme: SiteTheme;
      themeSha: string;
    };

    const cv = validateContent(body.content);
    if (!cv.ok) return json({ error: cv.error }, 400);
    const tv = validateTheme(body.theme);
    if (!tv.ok) return json({ error: tv.error }, 400);

    const gh = githubFromEnv(context.env);
    const content = normalizeContent(body.content);

    await gh.putText(
      `sites/${slug}/content.json`,
      JSON.stringify(content, null, 2) + "\n",
      `dashboard: update ${slug} content`,
      body.contentSha,
    );
    await gh.putText(
      `sites/${slug}/theme.json`,
      JSON.stringify(body.theme, null, 2) + "\n",
      `dashboard: update ${slug} theme`,
      body.themeSha,
    );
    return json({ ok: true });
  });
}
