/**
 * Repo rows as the dashboard consumes them (snake_case, UI-ready).
 *
 * - `github_id`: no longer produced — the old mock returned a random number.
 *   Kept as null for the RepoCard prop type; never rendered.
 * - `language`: null in the DB means unknown; surfaced as "Unknown" rather
 *   than a fabricated default.
 * - `last_indexed_at`: DB column is `indexed_at`.
 */

export interface RepoRow {
  id: number;
  owner: string | null;
  name: string | null;
  full_name: string | null;
  url: string | null;
  language: string | null;
  is_monorepo: number | boolean | null;
  monorepo_tool: string | null;
  indexed_at: string | null;
  installation_id: number | null;
  created_by_user_id?: number | null;
  created_at?: string;
}

export interface RepoDto {
  id: number;
  github_id: number | null;
  owner: string;
  name: string;
  full_name: string;
  url: string;
  language: string;
  is_monorepo: boolean;
  monorepo_tool: string | null;
  last_indexed_at: string | null;
  created_at: string;
}

export function mapRepo(row: RepoRow): RepoDto {
  const owner = row.owner ?? '';
  const name = row.name ?? '';
  return {
    id: Number(row.id),
    github_id: null,
    owner,
    name,
    full_name: row.full_name ?? `${owner}/${name}`,
    url: row.url ?? '',
    language: row.language ?? 'Unknown',
    is_monorepo: Boolean(row.is_monorepo),
    monorepo_tool: row.monorepo_tool ?? null,
    last_indexed_at: row.indexed_at ?? null,
    created_at: row.created_at ?? '',
  };
}
