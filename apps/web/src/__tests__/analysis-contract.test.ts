import { describe, it, expect } from 'vitest';
import {
  parseJsonColumn,
  normalizeChangedFile,
  normalizeChangedFiles,
  normalizeAnalysisListItem,
  normalizeAnalysisDetail,
} from '../lib/analysis-contract';

describe('parseJsonColumn', () => {
  it('parses valid JSON strings', () => {
    expect(parseJsonColumn('["a"]', [])).toEqual(['a']);
  });

  it('passes objects through untouched', () => {
    expect(parseJsonColumn({ x: 1 }, { x: 0 })).toEqual({ x: 1 });
  });

  it('returns the fallback for null, empty and malformed input', () => {
    expect(parseJsonColumn(null, [])).toEqual([]);
    expect(parseJsonColumn('', [])).toEqual([]);
    expect(parseJsonColumn('{not json', { ok: true })).toEqual({ ok: true });
    expect(parseJsonColumn(42, [])).toEqual([]);
  });
});

describe('normalizeChangedFile', () => {
  it('upgrades legacy bare-filename rows to honest zeroed objects', () => {
    expect(normalizeChangedFile('src/app.ts')).toEqual({
      filename: 'src/app.ts',
      status: 'changed',
      additions: 0,
      deletions: 0,
    });
  });

  it('accepts v1 objects with GitHub statuses', () => {
    expect(
      normalizeChangedFile({ filename: 'a.ts', status: 'added', additions: 3, deletions: 0 })
    ).toEqual({ filename: 'a.ts', status: 'added', additions: 3, deletions: 0 });
  });

  it('coerces unknown statuses and negative counts instead of trusting them', () => {
    expect(
      normalizeChangedFile({ filename: 'a.ts', status: 'weird', additions: -5, deletions: 'x' })
    ).toEqual({ filename: 'a.ts', status: 'changed', additions: 0, deletions: 0 });
  });

  it('drops garbage entries', () => {
    expect(normalizeChangedFile(null)).toBeNull();
    expect(normalizeChangedFile({ nope: true })).toBeNull();
    expect(normalizeChangedFile('')).toBeNull();
  });
});

describe('normalizeChangedFiles', () => {
  it('handles mixed legacy arrays and invalid columns', () => {
    expect(
      normalizeChangedFiles(JSON.stringify(['a.ts', { filename: 'b.ts', status: 'removed' }, 7]))
    ).toEqual([
      { filename: 'a.ts', status: 'changed', additions: 0, deletions: 0 },
      { filename: 'b.ts', status: 'removed', additions: 0, deletions: 0 },
    ]);
    expect(normalizeChangedFiles('garbage')).toEqual([]);
    expect(normalizeChangedFiles(null)).toEqual([]);
  });
});

describe('normalizeAnalysisListItem', () => {
  it('maps a stored row into the v1 list contract', () => {
    const item = normalizeAnalysisListItem({
      id: 5,
      repo_full_name: 'acme/widgets',
      pr_number: 7,
      pr_title: 'Refactor',
      pr_author: 'octocat',
      pr_url: 'https://github.com/acme/widgets/pull/7',
      risk_score: 70,
      risk_level: 'high',
      impacted_services: JSON.stringify(['api', 'web']),
      created_at: '2026-01-01 00:00:00',
      head_sha: 'abc123',
    });
    expect(item).toMatchObject({
      id: 5,
      repo_name: 'acme/widgets',
      risk_level: 'high',
      impacted_services: ['api', 'web'],
      head_sha: 'abc123',
    });
  });

  it('never fabricates risk levels or services', () => {
    const item = normalizeAnalysisListItem({
      id: 1,
      repo_full_name: 'acme/widgets',
      pr_number: 1,
      risk_score: 10,
      risk_level: 'extreme',
      impacted_services: 'not-an-array',
    });
    expect(item.risk_level).toBe('unknown');
    expect(item.impacted_services).toEqual([]);
    expect(item.risk_score).toBe(10);
  });
});

describe('normalizeAnalysisDetail', () => {
  it('includes normalized changed files, recommendations and blast radius', () => {
    const detail = normalizeAnalysisDetail({
      id: 9,
      repo_full_name: 'acme/widgets',
      pr_number: 3,
      risk_score: 40,
      risk_level: 'medium',
      changed_files: JSON.stringify(['src/x.ts']),
      recommendations: JSON.stringify(['Review callers']),
      blast_radius: JSON.stringify({ services: [{ name: 'api' }] }),
      merged_into: null,
      pr_updated_at: '2026-01-02T00:00:00Z',
    });
    expect(detail.changed_files).toEqual([
      { filename: 'src/x.ts', status: 'changed', additions: 0, deletions: 0 },
    ]);
    expect(detail.recommendations).toEqual(['Review callers']);
    expect(detail.blast_radius).toEqual({ services: [{ name: 'api' }] });
    expect(detail.merged_into).toBeNull();
    expect(detail.pr_updated_at).toBe('2026-01-02T00:00:00Z');
  });

  it('drops non-string recommendations instead of rendering objects', () => {
    const detail = normalizeAnalysisDetail({
      id: 10,
      repo_full_name: 'acme/widgets',
      pr_number: 4,
      risk_score: 1,
      risk_level: 'low',
      recommendations: JSON.stringify(['keep', { nested: true }, 42]),
    });
    expect(detail.recommendations).toEqual(['keep']);
    // Absent blast radius is null, not an empty object — the detail page then
    // shows its honest "no data" state instead of an all-undefined panel.
    expect(detail.blast_radius).toBeNull();
  });
});
