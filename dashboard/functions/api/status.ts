// GET /api/status  -> recent GitHub Actions runs (deploy / new-site)
import { githubFromEnv } from "../../src/lib/github";
import { json, guard } from "../../src/lib/http";
import type { Env } from "../../src/lib/env";

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  return guard(async () => {
    const gh = githubFromEnv(context.env);
    const runs = await gh.recentRuns(15);
    return json({ runs });
  });
}
