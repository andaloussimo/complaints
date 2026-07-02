/** Browser-side client for the dashboard's Pages Functions. */
import type { CreateSiteInput, HubSpotMeta, SiteContent, SiteSummary, SiteTheme } from "./types";

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data;
}

export async function listSites(): Promise<SiteSummary[]> {
  const data = await jsonOrThrow(await fetch("/api/sites"));
  return (data as { sites: SiteSummary[] }).sites;
}

export interface SiteDetail {
  slug: string;
  content: SiteContent;
  contentSha: string;
  theme: SiteTheme;
  themeSha: string;
}

export async function getSite(slug: string): Promise<SiteDetail> {
  return (await jsonOrThrow(await fetch(`/api/sites/${slug}`))) as SiteDetail;
}

export async function createSite(input: CreateSiteInput): Promise<void> {
  await jsonOrThrow(
    await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function saveSite(
  slug: string,
  payload: { content: SiteContent; contentSha: string; theme: SiteTheme; themeSha: string },
): Promise<void> {
  await jsonOrThrow(
    await fetch(`/api/sites/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function uploadLogo(slug: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const data = await jsonOrThrow(await fetch(`/api/sites/${slug}/logo`, { method: "POST", body: fd }));
  return (data as { logo: string }).logo;
}

export interface RunStatus {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  html_url: string;
}

export async function getStatus(workflow?: string): Promise<RunStatus[]> {
  const qs = workflow ? `?workflow=${encodeURIComponent(workflow)}` : "";
  const data = await jsonOrThrow(await fetch(`/api/status${qs}`));
  return (data as { runs: RunStatus[] }).runs;
}

export interface RunProgress {
  status: string;
  conclusion: string | null;
  html_url: string;
  steps: Array<{ name: string; status: string; conclusion: string | null }>;
}

export async function getRunProgress(id: number): Promise<RunProgress> {
  return (await jsonOrThrow(await fetch(`/api/runs/${id}`))) as RunProgress;
}

export interface ProjectInfo {
  configured: boolean;
  exists?: boolean;
  url?: string;
  domains?: string[];
}

/** Real Cloudflare Pages URL for a project (pages.dev subdomains can differ from the slug). */
export async function getProject(name: string): Promise<ProjectInfo> {
  return (await jsonOrThrow(await fetch(`/api/projects/${name}`))) as ProjectInfo;
}

export async function getHubSpotMeta(): Promise<HubSpotMeta> {
  return (await jsonOrThrow(await fetch("/api/hubspot"))) as HubSpotMeta;
}
