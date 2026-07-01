/** Runtime env for the dashboard's Pages Functions (secrets on the project). */
export interface Env {
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string; // "owner/name"
}
