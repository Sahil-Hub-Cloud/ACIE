import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { run, get } from '../../../../lib/db';
import {
  calculateBlastRadiusInMemory,
  formatPRComment,
  ACIE_COMMENT_MARKER,
  type GraphEdge,
} from '../../../../lib/blast-radius';
import { resolveRepoToken, githubFetch, isGitHubAppConfigured } from '../../../../lib/github-app';

export const dynamic = 'force-dynamic';
// Analysis fans out to several GitHub API calls; give it room to finish.
export const maxDuration = 60;

const ANALYZED_ACTIONS = new Set(['opened', 'synchronize', 'reopened']);
const SOURCE_FILE = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rb|java|kt)$/;
const MAX_SEARCHES = 6;
const MAX_FILE_PAGES = 3;

// ── Signature verification ──────────────────────────────────────────────────

/**
 * Constant-time comparison of GitHub's HMAC signature against our own.
 * GitHub signs the *raw* body, so this must run before any JSON parsing.
 */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;

  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')}`;

  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ── Diff analysis ───────────────────────────────────────────────────────────

interface ChangedSymbol {
  filePath: string;
  symbolName: string;
  changeType: 'added' | 'modified' | 'removed';
}

const EXPORT_PATTERNS = [
  /export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/,
  /export\s+(?:default\s+)?class\s+(\w+)/,
  /export\s+interface\s+(\w+)/,
  /export\s+type\s+(\w+)/,
  /export\s+(?:const|let|var)\s+(\w+)/,
  /export\s+enum\s+(\w+)/,
  /^\s*def\s+(\w+)/,
  /^\s*func\s+(\w+)/,
];

function analyzePatch(filename: string, patch: string): ChangedSymbol[] {
  if (!patch) return [];

  const symbols: ChangedSymbol[] = [];
  const removedExports: string[] = [];
  const addedExports: string[] = [];

  for (const line of patch.split('\n')) {
    const isRemoved = line.startsWith('-') && !line.startsWith('---');
    const isAdded = line.startsWith('+') && !line.startsWith('+++');
    if (!isRemoved && !isAdded) continue;

    const content = line.slice(1);
    for (const pattern of EXPORT_PATTERNS) {
      const match = content.match(pattern);
      if (match) {
        (isRemoved ? removedExports : addedExports).push(match[1]);
        break;
      }
    }
  }

  for (const name of removedExports) {
    if (!addedExports.includes(name)) {
      symbols.push({ filePath: filename, symbolName: name, changeType: 'removed' });
    }
  }
  for (const name of addedExports) {
    symbols.push({
      filePath: filename,
      symbolName: name,
      changeType: removedExports.includes(name) ? 'modified' : 'added',
    });
  }

  // A body-only edit still changes behavior; record the file itself.
  if (symbols.length === 0 && patch.includes('@@')) {
    symbols.push({ filePath: filename, symbolName: '*', changeType: 'modified' });
  }

  return symbols;
}

// ── Downstream importer discovery ───────────────────────────────────────────

function moduleBases(filenames: string[]): Map<string, string> {
  const bases = new Map<string, string>();
  for (const file of filenames) {
    const base = (file.split('/').pop() || file).replace(SOURCE_FILE, '');
    if (base && !bases.has(base)) bases.set(base, file);
  }
  return bases;
}

/**
 * Ask GitHub code search who imports the changed modules.
 * Bounded to MAX_SEARCHES so a large PR can't stall the webhook.
 */
async function findImporters(
  repoFullName: string,
  filenames: string[],
  token: string | null
): Promise<GraphEdge[]> {
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const bases = moduleBases(filenames);
  const targets = Array.from(bases.keys()).slice(0, MAX_SEARCHES);

  for (const base of targets) {
    try {
      const query = `repo:${repoFullName} "${base}" in:file`;
      const results = await githubFetch<{ items?: Array<{ path: string }> }>(
        `/search/code?q=${encodeURIComponent(query)}&per_page=30`,
        {},
        token
      );

      for (const item of results.items ?? []) {
        if (filenames.includes(item.path)) continue;
        if (seen.has(item.path)) continue;
        seen.add(item.path);
        edges.push({ sourceFile: item.path, targetFile: bases.get(base)! });
      }
    } catch (error) {
      console.warn(`[ACIE] Code search failed for "${base}":`, (error as Error).message);
    }
  }

  return edges;
}

// ── Idempotent PR comment ───────────────────────────────────────────────────

/**
 * Update our existing ACIE comment if there is one, otherwise create it.
 * Without this, every push to a branch would add another comment.
 */
async function upsertPrComment(
  repoFullName: string,
  prNumber: number,
  body: string,
  token: string | null
): Promise<'created' | 'updated'> {
  const existing = await githubFetch<Array<{ id: number; body?: string }>>(
    `/repos/${repoFullName}/issues/${prNumber}/comments?per_page=100`,
    {},
    token
  );

  const mine = existing.find((comment) => comment.body?.includes(ACIE_COMMENT_MARKER));

  if (mine) {
    await githubFetch(
      `/repos/${repoFullName}/issues/comments/${mine.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      },
      token
    );
    return 'updated';
  }

  await githubFetch(
    `/repos/${repoFullName}/issues/${prNumber}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    },
    token
  );
  return 'created';
}

// ── Persistence ─────────────────────────────────────────────────────────────

async function storeAnalysis(params: {
  repoFullName: string;
  prNumber: number;
  prUrl: string;
  prTitle: string;
  prAuthor: string;
  riskScore: number;
  riskLevel: string;
  changedFiles: string[];
  changedSymbols: ChangedSymbol[];
  blastRadius: unknown;
  recommendations: string[];
}) {
  try {
    await run(
      `CREATE TABLE IF NOT EXISTS analyses (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         repo_id INTEGER,
         repo_full_name TEXT,
         pr_number INTEGER NOT NULL,
         pr_url TEXT NOT NULL,
         pr_title TEXT,
         pr_author TEXT,
         risk_score INTEGER NOT NULL,
         risk_level TEXT NOT NULL,
         changed_files TEXT,
         changed_symbols TEXT,
         impacted_services TEXT,
         blast_radius TEXT,
         recommendations TEXT,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
       )`
    );

    const repo = await get<{ id: number }>(
      'SELECT id FROM repos WHERE owner || "/" || name = ? OR url LIKE ?',
      [params.repoFullName, `%${params.repoFullName}%`]
    );

    const result = params.blastRadius as { impactedServices: unknown };

    await run(
      `INSERT INTO analyses (
         repo_id, repo_full_name, pr_number, pr_url, pr_title, pr_author,
         risk_score, risk_level, changed_files, changed_symbols,
         impacted_services, blast_radius, recommendations
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        repo?.id ?? null,
        params.repoFullName,
        params.prNumber,
        params.prUrl,
        params.prTitle,
        params.prAuthor,
        params.riskScore,
        params.riskLevel,
        JSON.stringify(params.changedFiles),
        JSON.stringify(params.changedSymbols),
        JSON.stringify(result.impactedServices),
        JSON.stringify(params.blastRadius),
        JSON.stringify(params.recommendations),
      ]
    );
  } catch (error) {
    console.warn('[ACIE] Analysis not persisted:', (error as Error).message);
  }
}

async function storeInstallation(payload: any, removed: boolean) {
  const installationId = payload.installation?.id;
  if (!installationId) return;

  try {
    await run(
      `CREATE TABLE IF NOT EXISTS installations (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         installation_id INTEGER NOT NULL UNIQUE,
         account_login TEXT,
         account_type TEXT,
         repository_count INTEGER DEFAULT 0,
         setup_action TEXT,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
       )`
    );
    await run(
      `INSERT INTO installations (installation_id, account_login, account_type, repository_count, setup_action)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(installation_id) DO UPDATE SET
         account_login = excluded.account_login,
         account_type = excluded.account_type,
         repository_count = excluded.repository_count,
         setup_action = excluded.setup_action,
         updated_at = CURRENT_TIMESTAMP`,
      [
        installationId,
        payload.installation?.account?.login ?? null,
        payload.installation?.account?.type ?? null,
        payload.repositories?.length ?? payload.repositories_added?.length ?? 0,
        removed ? 'uninstall' : 'update',
      ]
    );
  } catch (error) {
    console.warn('[ACIE] Installation not persisted:', (error as Error).message);
  }
}

// ── Main handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // The raw body must be read once, before parsing, for signature checks.
  const rawBody = await req.text();
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  const event = req.headers.get('x-github-event') ?? 'unknown';
  const delivery = req.headers.get('x-github-delivery');

  // Unsigned requests are only tolerated while the secret is unset (local dev).
  if (webhookSecret) {
    const signature = req.headers.get('x-hub-signature-256');
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      console.warn(`[ACIE] Rejected webhook ${delivery}: signature mismatch`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } else {
    console.warn('[ACIE] GITHUB_WEBHOOK_SECRET is unset — accepting an unsigned webhook.');
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
  }

  const dryRun = new URL(req.url).searchParams.get('dryRun') === '1';

  try {
    // GitHub sends this when you save the webhook — answering it proves liveness.
    if (event === 'ping') {
      return NextResponse.json({ ok: true, event, zen: payload.zen ?? null, dryRun });
    }

    if (event === 'installation' || event === 'installation_repositories') {
      await storeInstallation(payload, event === 'installation' && payload.action === 'deleted');
      return NextResponse.json({ ok: true, event, action: payload.action });
    }

    if (event !== 'pull_request' || !payload.pull_request) {
      return NextResponse.json({ ok: true, ignored: true, event });
    }

    const action = payload.action;

    // Filter on the action before touching any nested fields: GitHub sends
    // dozens of pull_request actions we don't care about (labeled, edited,
    // closed...) and a malformed payload should be ignored, not 500.
    if (!ANALYZED_ACTIONS.has(action)) {
      return NextResponse.json({ ok: true, ignored: true, event, action });
    }

    const pr = payload.pull_request;
    const repoFullName: string | undefined = payload.repository?.full_name;
    if (!repoFullName || !pr?.number) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'Incomplete payload' });
    }

    const [owner, repoName] = repoFullName.split('/');
    const prNumber: number = pr.number;
    const installationId: number | undefined = payload.installation?.id;

    if (!isGitHubAppConfigured() && !process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'No GitHub credentials configured. Set GITHUB_APP_ID + GITHUB_APP_PRIVATE_KEY, or GITHUB_TOKEN.' },
        { status: 503 }
      );
    }

    const token = await resolveRepoToken(owner, repoName, installationId);

    // Changed files, paginated (GitHub caps this endpoint at 3000 files).
    const files: Array<{ filename: string; patch?: string }> = [];
    for (let page = 1; page <= MAX_FILE_PAGES; page++) {
      const batch = await githubFetch<Array<{ filename: string; patch?: string }>>(
        `/repos/${repoFullName}/pulls/${prNumber}/files?per_page=100&page=${page}`,
        {},
        token
      );
      files.push(...batch);
      if (batch.length < 100) break;
    }

    const changedFiles = files.filter((file) => SOURCE_FILE.test(file.filename));

    if (changedFiles.length === 0) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'No source files changed' });
    }

    const changedSymbols = changedFiles.flatMap((file) =>
      analyzePatch(file.filename, file.patch ?? '')
    );
    const filenames = changedFiles.map((file) => file.filename);

    const edges = await findImporters(repoFullName, filenames, token);
    const result = calculateBlastRadiusInMemory(filenames, changedSymbols, edges);
    const comment = formatPRComment(prNumber, filenames, result);

    let commentAction: 'created' | 'updated' | 'skipped' = 'skipped';
    if (!dryRun) {
      try {
        commentAction = await upsertPrComment(repoFullName, prNumber, comment, token);
      } catch (error) {
        // A failed comment shouldn't lose the analysis.
        console.error('[ACIE] Comment failed:', (error as Error).message);
      }
    }

    if (!dryRun) {
      await storeAnalysis({
        repoFullName,
        prNumber,
        prUrl: pr.html_url,
        prTitle: pr.title,
        prAuthor: pr.user?.login ?? 'unknown',
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        changedFiles: filenames,
        changedSymbols,
        blastRadius: result,
        recommendations: result.recommendations,
      });
    }

    return NextResponse.json({
      ok: true,
      event,
      action,
      dryRun,
      delivery,
      repo: repoFullName,
      prNumber,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      changedFiles: filenames.length,
      impactedFiles: result.totalImpactedFiles,
      impactedServices: result.impactedServices.map((service) => service.name),
      entryPointsAffected: result.entryPointsAffected,
      comment: commentAction,
      commentPreview: dryRun ? comment : undefined,
    });
  } catch (error) {
    console.error('[ACIE] Webhook error:', error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/** Health check — useful for confirming the endpoint is wired up correctly. */
export async function GET() {
  return NextResponse.json({
    status: 'ACIE webhook online',
    version: '2.1',
    signatureVerification: Boolean(process.env.GITHUB_WEBHOOK_SECRET),
    githubApp: isGitHubAppConfigured(),
    patFallback: Boolean(process.env.GITHUB_TOKEN),
    hints: 'POST pull_request events here. Add ?dryRun=1 to preview without commenting.',
  });
}
