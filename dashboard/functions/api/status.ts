// GET /api/status                       -> recent GitHub Actions runs (all workflows)
// GET /api/status?workflow=new-site.yml -> recent runs of one workflow (for trackers)
import { githubFromEnv } from "../../src/lib/github";
import { json, guard } from "../../src/lib/http";
import type { Env } from "../../src/lib/env";

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  return guard(async () => {
    const gh = githubFromEnv(context.env);
    const workflow = new URL(context.request.url).searchParams.get("workflow") ?? undefined;
    const runs = await gh.recentRuns(workflow ? 5 : 15, workflow);
    return json({ runs });
  });
}
