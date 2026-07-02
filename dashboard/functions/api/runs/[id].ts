// GET /api/runs/:id -> one workflow run's status + flattened step progress
// (drives the live "creating your site" tracker in the dashboard)
import { githubFromEnv } from "../../../src/lib/github";
import { json, guard } from "../../../src/lib/http";
import type { Env } from "../../../src/lib/env";

export async function onRequestGet(context: {
  env: Env;
  params: { id: string };
}): Promise<Response> {
  return guard(async () => {
    const id = Number(context.params.id);
    if (!Number.isFinite(id) || id <= 0) return json({ error: "Invalid run id" }, 400);
    const gh = githubFromEnv(context.env);
    return json(await gh.runProgress(id));
  });
}
