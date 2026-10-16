/**
 * Versioned read-contract for persisted analyses.
 *
 * v1 shape is defined by the dashboard consumers (repos list, analysis list,
 * analysis detail). Rows written by older webhook versions are normalized at
 * read time rather than backfilled in place, so the stored JSON stays an
 * append-only audit record.
 *
 * Bump the version only for a breaking shape change; add fields freely.
 */
export const ANALYSIS_CONTRACT_VERSION = 1;

export const CONTRACT_HEADERS = {
  'x-acie-contract-version': String(ANALYSIS_CONTRACT_VERSION),
};

export interface ChangedFileInfo {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'changed';
  additions: number;
  deletions: number;
}

export interface AnalysisListItem {
  id: number;
  repo_name: string;
  repo_full_name: string;
  pr_number: number;
  pr_title: string;
  pr_author: string;
  pr_url: string;
  risk_score: number;
  risk_level: 'critical' | 'high' | 'medium' | 'low' | 'unknown';
  impacted_services: string[];
  created_at: string;
  head_sha: string;
}

export interface AnalysisDetail extends AnalysisListItem {
  summary: string;
  changed_files: ChangedFileInfo[];
  recommendations: string[];
  blast_radius: unknown;
  merged_into: number | null;
  pr_updated_at: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Parse a JSON-column value defensively; never trust stored text to be current-shape. */
export function parseJsonColumn<T>(raw: unknown, fallback: T): T {
  if (raw === null || raw === undefined || raw === '') return fallback;
  if (typeof raw === 'object') return raw as T;
  if (typeof raw !== 'string') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function toNonNegInt(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function toRiskLevel(value: unknown): AnalysisListItem['risk_level'] {
  const v = String(value ?? '').toLowerCase();
  if (v === 'critical' || v === 'high' || v === 'medium' || v === 'low') return v;
  // Never invent a severity: unreadable data stays visibly unknown (the UI
  // renders "Unknown Risk" rather than a comforting default).
  return 'unknown';
}

/**
 * Normalize one changed-files entry. Legacy rows stored bare filename strings;
 * v1 rows are objects from the GitHub files API. Garbage drops to a
 * placeholder rather than throwing.
 */
export function normalizeChangedFile(item: unknown): ChangedFileInfo | null {
  if (typeof item === 'string') {
    if (!item) return null;
    return { filename: item, status: 'changed', additions: 0, deletions: 0 };
  }
  if (!isRecord(item)) return null;
  const filename = typeof item.filename === 'string' ? item.filename : '';
  if (!filename) return null;
  const statusRaw = String(item.status ?? 'changed').toLowerCase();
  const status: ChangedFileInfo['status'] =
    statusRaw === 'added' ||
    statusRaw === 'removed' ||
    statusRaw === 'modified' ||
    statusRaw === 'renamed'
      ? statusRaw
      : 'changed';
  return {
    filename,
    status,
    additions: toNonNegInt(item.additions),
    deletions: toNonNegInt(item.deletions),
  };
}

export function normalizeChangedFiles(raw: unknown): ChangedFileInfo[] {
  const arr = parseJsonColumn<unknown[]>(raw, []);
  if (!Array.isArray(arr)) return [];
  return arr
    .map(normalizeChangedFile)
    .filter((f): f is ChangedFileInfo => f !== null);
}

function normalizeServices(raw: unknown): string[] {
  const arr = parseJsonColumn<unknown[]>(raw, []);
  if (!Array.isArray(arr)) return [];
  return arr.filter((s): s is string => typeof s === 'string' && s.length > 0);
}

/** Shape a stored analyses row into the v1 list contract. */
export function normalizeAnalysisListItem(row: Record<string, unknown>): AnalysisListItem {
  const prUrl =
    typeof row.pr_url === 'string' && row.pr_url
      ? row.pr_url
      : typeof row.pr_url === 'object' && isRecord(row.pr_url)
        ? String(row.pr_url.url ?? '')
        : '';
  return {
    id: Number(row.id),
    repo_name: String(row.repo_full_name ?? row.repo_name ?? 'unknown/unknown'),
    repo_full_name: String(row.repo_full_name ?? 'unknown/unknown'),
    pr_number: toNonNegInt(row.pr_number),
    pr_title: String(row.pr_title ?? ''),
    pr_author: String(row.pr_author ?? ''),
    pr_url: prUrl,
    risk_score: toNonNegInt(row.risk_score),
    risk_level: toRiskLevel(row.risk_level),
    impacted_services: normalizeServices(row.impacted_services),
    created_at: String(row.created_at ?? ''),
    head_sha: String(row.head_sha ?? ''),
  };
}

/** Shape a stored analyses row into the v1 detail contract. */
export function normalizeAnalysisDetail(row: Record<string, unknown>): AnalysisDetail {
  const recommendations = parseJsonColumn<unknown[]>(row.recommendations, []);
  const blastRadius = parseJsonColumn<Record<string, unknown>>(row.blast_radius, {});
  const hasBlastRadius =
    blastRadius !== null &&
    typeof blastRadius === 'object' &&
    Object.keys(blastRadius).length > 0;
  return {
    ...normalizeAnalysisListItem(row),
    summary: String(row.summary ?? ''),
    changed_files: normalizeChangedFiles(row.changed_files),
    recommendations: Array.isArray(recommendations)
      ? recommendations.filter((r): r is string => typeof r === 'string')
      : [],
    // null (not {}) for absent data so the detail page can show its honest
    // empty state instead of mounting a panel full of undefined counts.
    blast_radius: hasBlastRadius ? blastRadius : null,
    merged_into: row.merged_into === null || row.merged_into === undefined ? null : Number(row.merged_into),
    pr_updated_at:
      row.pr_updated_at === null || row.pr_updated_at === undefined
        ? null
        : String(row.pr_updated_at),
  };
}
