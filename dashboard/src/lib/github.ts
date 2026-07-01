/**
 * Minimal GitHub REST client used by the Pages Functions (server-side only —
 * it holds the token). Uses only Web APIs (fetch, btoa/atob, TextEncoder) so it
 * runs on the Cloudflare Workers runtime.
 */

const API = "https://api.github.com";

export interface GitHubConfig {
  token: string;
  repo: string; // "owner/name"
  branch?: string; // default "main"
}

export interface DirEntry {
  name: string;
  type: "file" | "dir";
}

export interface FileContent {
  text: string;
  sha: string;
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function base64ToUtf8(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export class GitHub {
  private branch: string;
  constructor(private cfg: GitHubConfig) {
    this.branch = cfg.branch ?? "main";
  }

  private async api(method: string, path: string, body?: unknown): Promise<Response> {
    return fetch(API + path, {
      method,
      headers: {
        Authorization: `Bearer ${this.cfg.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "complaints-dashboard",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private contents(path: string): string {
    return `/repos/${this.cfg.repo}/contents/${path}?ref=${encodeURIComponent(this.branch)}`;
  }

  async listDir(path: string): Promise<DirEntry[]> {
    const res = await this.api("GET", this.contents(path));
    if (!res.ok) throw new Error(`listDir ${path}: ${res.status}`);
    const data = (await res.json()) as Array<{ name: string; type: DirEntry["type"] }>;
    return data.map((d) => ({ name: d.name, type: d.type }));
  }

  /** Returns decoded text + sha, or null if the file does not exist. */
  async getFile(path: string): Promise<FileContent | null> {
    const res = await this.api("GET", this.contents(path));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`getFile ${path}: ${res.status}`);
    const data = (await res.json()) as { content: string; sha: string };
    return { text: base64ToUtf8(data.content), sha: data.sha };
  }

  async putText(path: string, text: string, message: string, sha?: string): Promise<void> {
    await this.put(path, utf8ToBase64(text), message, sha);
  }

  async putBase64(path: string, base64: string, message: string, sha?: string): Promise<void> {
    await this.put(path, base64, message, sha);
  }

  private async put(path: string, contentB64: string, message: string, sha?: string): Promise<void> {
    const res = await this.api("PUT", `/repos/${this.cfg.repo}/contents/${path}`, {
      message,
      content: contentB64,
      branch: this.branch,
      ...(sha ? { sha } : {}),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`putFile ${path}: ${res.status} ${t}`);
    }
  }

  async dispatchWorkflow(
    workflowFile: string,
    inputs: Record<string, string>,
  ): Promise<void> {
    const res = await this.api(
      "POST",
      `/repos/${this.cfg.repo}/actions/workflows/${workflowFile}/dispatches`,
      { ref: this.branch, inputs },
    );
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`dispatch ${workflowFile}: ${res.status} ${t}`);
    }
  }

  async recentRuns(perPage = 15): Promise<
    Array<{ name: string; status: string; conclusion: string | null; created_at: string; html_url: string }>
  > {
    const res = await this.api(
      "GET",
      `/repos/${this.cfg.repo}/actions/runs?per_page=${perPage}`,
    );
    if (!res.ok) throw new Error(`recentRuns: ${res.status}`);
    const data = (await res.json()) as {
      workflow_runs: Array<{
        name: string;
        status: string;
        conclusion: string | null;
        created_at: string;
        html_url: string;
      }>;
    };
    return data.workflow_runs.map((r) => ({
      name: r.name,
      status: r.status,
      conclusion: r.conclusion,
      created_at: r.created_at,
      html_url: r.html_url,
    }));
  }
}

/** Build a client from a Pages Function env. */
export function githubFromEnv(env: { GITHUB_TOKEN?: string; GITHUB_REPO?: string }): GitHub {
  const token = (env.GITHUB_TOKEN ?? "").trim();
  const repo = (env.GITHUB_REPO ?? "").trim();
  if (!token || !repo) throw new Error("GITHUB_TOKEN and GITHUB_REPO must be set");
  return new GitHub({ token, repo });
}
