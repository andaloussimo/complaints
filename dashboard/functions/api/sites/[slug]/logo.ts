// POST /api/sites/:slug/logo  -> upload a logo image, set brand.logo in content.json
import { githubFromEnv, bytesToBase64 } from "../../../../src/lib/github";
import { json, guard } from "../../../../src/lib/http";
import type { Env } from "../../../../src/lib/env";

const ALLOWED = ["svg", "png", "jpg", "jpeg", "webp"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function onRequestPost(context: {
  request: Request;
  env: Env;
  params: { slug: string };
}): Promise<Response> {
  return guard(async () => {
    const slug = String(context.params.slug);
    const form = await context.request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return json({ error: "No file uploaded." }, 400);
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED.includes(ext)) {
      return json({ error: "Logo must be an SVG, PNG, JPG or WebP." }, 400);
    }
    if (file.size > MAX_BYTES) {
      return json({ error: "Logo is too large (max 2MB)." }, 400);
    }

    const gh = githubFromEnv(context.env);
    const filename = `logo.${ext === "jpeg" ? "jpg" : ext}`;
    const path = `sites/${slug}/assets/${filename}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const existing = await gh.getFile(path); // sha if overwriting
    await gh.putBase64(
      path,
      bytesToBase64(bytes),
      `dashboard: update ${slug} logo`,
      existing?.sha,
    );

    // Point content.json at the new logo.
    const cf = await gh.getFile(`sites/${slug}/content.json`);
    if (cf) {
      const c = JSON.parse(cf.text);
      c.brand = c.brand ?? {};
      c.brand.logo = filename;
      c.brand.logoAlt = c.brand.logoAlt ?? c.brand.name ?? slug;
      await gh.putText(
        `sites/${slug}/content.json`,
        JSON.stringify(c, null, 2) + "\n",
        `dashboard: set ${slug} logo reference`,
        cf.sha,
      );
    }
    return json({ ok: true, logo: filename });
  });
}
