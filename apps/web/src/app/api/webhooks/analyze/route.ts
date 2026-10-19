import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { run, get, getDb } from '../../../../lib/db';
import {
  calculateBlastRadiusInMemory,
  formatPRComment,
  ACIE_COMMENT_MARKER,
  type GraphEdge,
  type BlastRadiusResult,
} from '../../../../lib/blast-radius';
import { resolveRepoToken, githubFetch, isGitHubAppConfigured } from '../../../../lib/github-app';

export const dynamic = 'force-dynamic';
// Analysis fans out to several GitHub API calls; give it room to finish.
export const maxDuration = 60;

const ANALYZED_ACTIONS = new Set(['opened', 'synchronize', 'reopened']);
const SOURCE_FILE = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rb|java|kt)$/;
const MAX_SEARCHES = 6;
const MAX_FILE_PAGES = 3;
const PERFORMANCE_BUDGET_MS = 60_000; // 60-second budget

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

// ── Delivery deduplication ──────────────────────────────────────────────────

const STALE_CLAIM_MS = 10 * 60 * 1000;

function claimIsStale(receivedAt: string | null): boolean {
  if (!receivedAt) return true;
  const ms = Date.parse(receivedAt.includes('T') ? receivedAt : `${receivedAt.replace(' ', 'T')}Z`);
  // Unparseable timestamps are treated as stale: reprocessing is idempotent
  // (upserted analyses, upserted PR comment), dropping a delivery is not.
  return Number.isNaN(ms) ? true : Date.now() - ms > STALE_CLAIM_MS;
}

/**
 * Returns true when this delivery should be processed, false when an earlier
 * attempt already completed (or is still running) for the same delivery id.
 */
async function claimDelivery(deliveryId: string, event: string): Promise<boolean> {
  const inserted = await run(
    `INSERT INTO webhook_deliveries (delivery_id, event, status, attempts)
     VALUES (?, ?, 'processing', 1)
     ON CONFLICT(delivery_id) DO NOTHING`,
    [deliveryId, event]
  );
  if (inserted.rowsAffected > 0) return true;

  const existing = await get<{ status: string; received_at: string | null }>(
    'SELECT status, received_at FROM webhook_deliveries WHERE delivery_id = ?',
    [deliveryId]
  );
  if (!existing) return true;
  if (existing.status === 'completed') return false;
  if (existing.status === 'processing' && !claimIsStale(existing.received_at)) return false;

  // Failed, or a crashed run whose claim went stale — reclaim it.
  await run(
    `UPDATE webhook_deliveries
        SET status = 'processing', attempts = attempts + 1, received_at = CURRENT_TIMESTAMP
      WHERE delivery_id = ?`,
    [deliveryId]
  );
  return true;
}

async function settleDelivery(
  deliveryId: string,
  status: 'completed' | 'failed',
  lastError?: string
): Promise<void> {
  try {
    await run(
      `UPDATE webhook_deliveries
          SET status = ?, last_error = ?, completed_at = CURRENT_TIMESTAMP
        WHERE delivery_id = ?`,
      [status, lastError ?? null, deliveryId]
    );
  } catch (error) {
    console.error('[ACIE] Could not update delivery status:', (error as Error).message);
  }
}

// ── Persistence ─────────────────────────────────────────────────────────────

async function storeAnalysis(params: {
  repoFullName: string;
  prNumber: number;
  prUrl: string;
  prTitle: string;
  prAuthor: string;
  headSha: string | null;
  prUpdatedAt: string | null;
  riskScore: number;
  riskLevel: string;
  changedFiles: Array<{ filename: string; status: string; additions: number; deletions: number }>;
  changedSymbols: ChangedSymbol[];
  blastRadius: unknown;
  recommendations: string[];
}): Promise<'stored' | 'stale'> {
  try {
    // Out-of-order guard: deliveries can arrive after a newer head was already
    // stored. ISO-8601 timestamps from GitHub compare correctly as strings.
    const latest = await get<{ pr_updated_at: string | null }>(
      'SELECT pr_updated_at FROM analyses WHERE repo_full_name = ? AND pr_number = ? ORDER BY id DESC LIMIT 1',
      [params.repoFullName, params.prNumber]
    );
    if (
      latest?.pr_updated_at &&
      params.prUpdatedAt &&
      params.prUpdatedAt < latest.pr_updated_at
    ) {
      console.warn(
        `[ACIE] Dropping stale analysis for ${params.repoFullName}#${params.prNumber}: ` +
          `${params.prUpdatedAt} < stored ${latest.pr_updated_at}`
      );
      return 'stale';
    }

    const repo = await get<{ id: number }>('SELECT id FROM repos WHERE full_name = ?', [
      params.repoFullName,
    ]);

    const result = params.blastRadius as { impactedServices: unknown };

    // Same PR head re-delivered (GitHub retry, manual redelivery) updates the
    // existing row instead of duplicating it.
    await run(
      `INSERT INTO analyses (
         repo_id, repo_full_name, pr_number, pr_url, pr_title, pr_author,
         risk_score, risk_level, changed_files, changed_symbols,
         impacted_services, blast_radius, recommendations, head_sha, pr_updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(repo_full_name, pr_number, head_sha) DO UPDATE SET
         repo_id = excluded.repo_id,
         pr_url = excluded.pr_url,
         pr_title = excluded.pr_title,
         pr_author = excluded.pr_author,
         risk_score = excluded.risk_score,
         risk_level = excluded.risk_level,
         changed_files = excluded.changed_files,
         changed_symbols = excluded.changed_symbols,
         impacted_services = excluded.impacted_services,
         blast_radius = excluded.blast_radius,
         recommendations = excluded.recommendations,
         pr_updated_at = excluded.pr_updated_at`,
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
        params.headSha,
        params.prUpdatedAt,
      ]
    );
    return 'stored';
  } catch (error) {
    console.error('[ACIE] Analysis not persisted:', (error as Error).message);
    return 'stored';
  }
}

/**
 * Register (or refresh) the repository behind a delivery so it appears in the
 * dashboard and becomes the tenancy anchor for its analyses.
 */
async function upsertRepoFromPayload(payload: any): Promise<void> {
  const repo = payload?.repository;
  const fullName: string | undefined = repo?.full_name;
  if (!fullName) return;
  try {
    await run(
      `INSERT INTO repos (installation_id, owner, name, full_name, url, default_branch)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(full_name) DO UPDATE SET
         installation_id = COALESCE(excluded.installation_id, repos.installation_id),
         url = excluded.url,
         default_branch = excluded.default_branch`,
      [
        payload.installation?.id ?? null,
        repo.owner?.login ?? fullName.split('/')[0] ?? null,
        repo.name ?? fullName.split('/')[1] ?? null,
        fullName,
        repo.html_url ?? null,
        repo.default_branch ?? null,
      ]
    );
  } catch (error) {
    console.error('[ACIE] Repository not registered:', (error as Error).message);
  }
}

async function storeInstallation(payload: any, removed: boolean) {
  const installationId = payload.installation?.id;
  if (!installationId) return;

  try {
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
    console.error('[ACIE] Installation not persisted:', (error as Error).message);
  }

  // First claim wins: bind the installation to the authenticated user whose
  // GitHub identity performed the install (identities migrate over with the
  // account, so this stays valid across OAuth migrations).
  if (!removed && payload.sender?.id) {
    try {
      const sender = await get<{ id: number }>(
        'SELECT id FROM users WHERE github_id = ?',
        [payload.sender.id]
      );
      if (sender) {
        await run(
          'UPDATE installations SET setup_user_id = ? WHERE installation_id = ? AND setup_user_id IS NULL',
          [sender.id, installationId]
        );
      }
    } catch (error) {
      console.warn('[ACIE] Installation claim skipped:', (error as Error).message);
    }
  }
}

// ── Main handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // The raw body must be read once, before parsing, for signature checks.
  const rawBody = await req.text();
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  const event = req.headers.get('x-github-event') ?? 'unknown';
  const delivery = req.headers.get('x-github-delivery');

  if (webhookSecret) {
    const signature = req.headers.get('x-hub-signature-256');
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      console.warn(`[ACIE] Rejected webhook ${delivery}: signature mismatch`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === 'production') {
    // Fail closed: an unsigned webhook is indistinguishable from a forgery.
    console.error(
      '[ACIE] GITHUB_WEBHOOK_SECRET is unset in production — refusing to process webhooks.'
    );
    return NextResponse.json({ error: 'Webhook processing is not configured' }, { status: 503 });
  } else {
    console.warn('[ACIE] GITHUB_WEBHOOK_SECRET is unset — accepting an unsigned webhook (development only).');
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
  }

  const dryRun = new URL(req.url).searchParams.get('dryRun') === '1';

  // Delivery dedup — only meaningful once a database backs it.
  let deliveryClaimed = false;
  if (delivery && !dryRun && getDb()) {
    try {
      deliveryClaimed = await claimDelivery(delivery, event);
    } catch (error) {
      console.error('[ACIE] Delivery claim failed:', (error as Error).message);
      deliveryClaimed = true; // better a duplicate than a dropped delivery
    }
    if (!deliveryClaimed) {
      return NextResponse.json({ ok: true, duplicate: true, event, delivery });
    }
  }

  try {
    const response = await processEvent(payload, event, dryRun, delivery);
    if (deliveryClaimed && delivery) {
      await settleDelivery(
        delivery,
        response.status >= 500 ? 'failed' : 'completed',
        response.status >= 500 ? `responded ${response.status}` : undefined
      );
    }
    return response;
  } catch (error) {
    console.error('[ACIE] Webhook error:', error);
    if (deliveryClaimed && delivery) {
      await settleDelivery(delivery, 'failed', (error as Error).message);
    }
    // Never echo internals to the caller; the full error is logged above.
    return NextResponse.json({ ok: false, error: 'Internal error processing webhook' }, { status: 500 });
  }
}

/**
 * Fetch test files from the repository using GitHub code search.
 */
async function fetchTestFiles(repoFullName: string, token: string): Promise<string[]> {
  try {
    const results = await githubFetch<{ items?: Array<{ path: string }> }>(
      `/search/code?q=${encodeURIComponent(`repo:${repoFullName} (test OR spec) in:file extension:ts extension:tsx extension:js extension:jsx`)}&per_page=100`,
      {},
      token
    );
    return (results.items ?? []).map(i => i.path);
  } catch (error) {
    console.warn('[ACIE] Failed to fetch test files:', (error as Error).message);
    return [];
  }
}

/**
 * Fetch CODEOWNERS file content from the repository.
 */
async function fetchCodeowners(repoFullName: string, token: string, baseSha: string | null): Promise<string | null> {
  try {
    const ref = baseSha ?? 'HEAD';
    const response = await githubFetch<{ content?: string; encoding?: string }>(
      `/repos/${repoFullName}/contents/.github/CODEOWNERS?ref=${ref}`,
      {},
      token
    );
    if (response.content && response.encoding === 'base64') {
      return Buffer.from(response.content, 'base64').toString('utf-8');
    }
  } catch {
    // Try root level CODEOWNERS
    try {
      const response = await githubFetch<{ content?: string; encoding?: string }>(
        `/repos/${repoFullName}/contents/CODEOWNERS?ref=${baseSha ?? 'HEAD'}`,
        {},
        token
      );
      if (response.content && response.encoding === 'base64') {
        return Buffer.from(response.content, 'base64').toString('utf-8');
      }
    } catch (e) {
      // Ignore errors fetching from .github/CODEOWNERS, try root level below
    }
  }
  return null;
}

/**
 * Post a GitHub Check Run with the blast radius analysis.
 */
async function postCheckRun(
  repoFullName: string,
  headSha: string,
  prNumber: number,
  result: BlastRadiusResult,
  token: string
): Promise<void> {
  const conclusion = result.riskLevel === 'critical' ? 'failure' : 
                     result.riskLevel === 'high' ? 'failure' :
                     result.riskLevel === 'medium' ? 'neutral' : 'success';

  const output = {
    title: 'ACIE Blast Radius Analysis',
    summary: `Risk: **${result.riskLevel.toUpperCase()}** (${result.riskScore}/100)\n` +
             `Impacted: ${result.totalImpactedFiles} files, ${result.impactedServices.length} services\n` +
             `Entry points affected: ${result.entryPointsAffected ? 'Yes' : 'No'}`,
    text: [
      '### 📦 Impacted Services',
      result.impactedServices.map(s => `- **${s.name}**${s.entryPoints.length ? ` (${s.entryPoints.length} entry points)` : ''}`).join('\n') || '- No services affected',
      '',
      '### 🧪 Test Selection',
      result.testSelection?.length ? result.testSelection.map(t => 
        `- \`${t.testFile}\` — **${t.confidence}** confidence: ${t.reason}`
      ).join('\n') : '- No test files found or matched',
      '',
      '### 👥 Suggested Reviewers',
      result.reviewerSuggestions?.length ? result.reviewerSuggestions.map(r => 
        `- \`${r.file}\`: @${r.reviewers.join(', @')} (${r.source})`
      ).join('\n') : '- No CODEOWNERS or reviewers matched',
    ].join('\n'),
  };

  try {
    await githubFetch(
      `/repos/${repoFullName}/check-runs`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'ACIE Blast Radius',
          head_sha: headSha,
          status: 'completed',
          conclusion,
          output,
          details_url: `https://github.com/${repoFullName}/pull/${prNumber}`,
        }),
      },
      token
    );
  } catch (error) {
    console.warn('[ACIE] Failed to post Check Run:', (error as Error).message);
  }
}

async function processEvent(
  payload: any,
  event: string,
  dryRun: boolean,
  delivery: string | null
): Promise<NextResponse> {
  const startTime = Date.now();

  // Performance budget check
  function checkBudget(): boolean {
    return Date.now() - startTime < PERFORMANCE_BUDGET_MS;
  }

  {
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
    if (!token) {
      // Fail closed: with the GitHub App configured there is no installation
      // token for this repo, and the broad operator PAT is never substituted.
      return NextResponse.json(
        {
          error:
            'GitHub credentials unavailable for this repository (no installation token; PAT fallback is disabled when the GitHub App is configured).',
        },
        { status: 503 }
      );
    }

    // Changed files, paginated (GitHub caps this endpoint at 3000 files).
    const files: Array<{
      filename: string;
      status?: string;
      additions?: number;
      deletions?: number;
      patch?: string;
    }> = [];
    for (let page = 1; page <= MAX_FILE_PAGES; page++) {
      const batch = await githubFetch<
        Array<{
          filename: string;
          status?: string;
          additions?: number;
          deletions?: number;
          patch?: string;
        }>
      >(`/repos/${repoFullName}/pulls/${prNumber}/files?per_page=100&page=${page}`, {}, token);
      files.push(...batch);
      if (batch.length < 100) break;
    }

    const changedFiles = files.filter((file) => SOURCE_FILE.test(file.filename));

    if (changedFiles.length === 0) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'No source files changed' });
    }

    // Early performance budget check
    if (!checkBudget()) {
      console.warn(`[ACIE] Performance budget exceeded during file fetch for ${repoFullName}#${prNumber}`);
    }

    const changedSymbols = changedFiles.flatMap((file) =>
      analyzePatch(file.filename, file.patch ?? '')
    );
    const filenames = changedFiles.map((file) => file.filename);

    // Fetch test files and CODEOWNERS in parallel (only if budget allows)
    let testFiles: string[] = [];
    let codeowners: string | null = null;
    
    if (checkBudget()) {
      const [tf, co] = await Promise.all([
        fetchTestFiles(repoFullName, token),
        fetchCodeowners(repoFullName, token, pr.head?.sha ?? null),
      ]);
      testFiles = tf;
      codeowners = co;
    }

    // Another budget check after fetching test files
    if (!checkBudget()) {
      console.warn(`[ACIE] Performance budget exceeded after test/CODEOWNERS fetch for ${repoFullName}#${prNumber}`);
    }

    const edges = await findImporters(repoFullName, filenames, token);

    if (!checkBudget()) {
      console.warn(`[ACIE] Performance budget exceeded after importer search for ${repoFullName}#${prNumber}`);
    }

    const result = calculateBlastRadiusInMemory(filenames, changedSymbols, edges, testFiles, codeowners);
    const comment = formatPRComment(prNumber, filenames, result);

    // Post Check Run (async, don't wait)
    if (!dryRun && pr.head?.sha) {
      postCheckRun(repoFullName, pr.head.sha, prNumber, result, token).catch(e => 
        console.warn('[ACIE] Check Run post failed:', (e as Error).message)
      );
    }

    let commentAction: 'created' | 'updated' | 'skipped' = 'skipped';
    if (!dryRun) {
      try {
        commentAction = await upsertPrComment(repoFullName, prNumber, comment, token);
      } catch (error) {
        // A failed comment shouldn't lose the analysis.
        console.error('[ACIE] Comment failed:', (error as Error).message);
      }
    }

    let analysisStored = true;
    if (!dryRun) {
      await upsertRepoFromPayload(payload);
      analysisStored =
        (await storeAnalysis({
          repoFullName,
          prNumber,
          prUrl: pr.html_url,
          prTitle: pr.title,
          prAuthor: pr.user?.login ?? 'unknown',
          headSha: pr.head?.sha ?? null,
          prUpdatedAt: pr.updated_at ?? null,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          changedFiles: changedFiles.map((file) => ({
            filename: file.filename,
            status: file.status ?? 'modified',
            additions: file.additions ?? 0,
            deletions: file.deletions ?? 0,
          })),
          changedSymbols,
          blastRadius: result,
          recommendations: result.recommendations,
        })) === 'stored';
    }

    const durationMs = Date.now() - startTime;
    const budgetExceeded = durationMs > PERFORMANCE_BUDGET_MS;

    if (budgetExceeded) {
      console.warn(`[ACIE] Performance budget EXCEEDED: ${durationMs}ms for ${repoFullName}#${prNumber} (budget: ${PERFORMANCE_BUDGET_MS}ms)`);
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
      analysisStored,
      comment: commentAction,
      commentPreview: dryRun ? comment : undefined,
      // Phase 4 additions:
      durationMs,
      budgetExceeded,
      testSelection: result.testSelection?.slice(0, 20), // limit for response size
      reviewerSuggestions: result.reviewerSuggestions,
    });
  }
}

/** Health check — useful for confirming the endpoint is wired up correctly. */
export async function GET() {
  return NextResponse.json({
    status: 'ACIE webhook online',
    version: '2.1',
    signatureVerification: Boolean(process.env.GITHUB_WEBHOOK_SECRET),
    githubApp: isGitHubAppConfigured(),
    // PAT fallback only applies when the app is not configured; with the app
    // configured the operator PAT is never substituted for installation scope.
    patFallback: !isGitHubAppConfigured() && Boolean(process.env.GITHUB_TOKEN),
    hints: 'POST pull_request events here. Add ?dryRun=1 to preview without commenting.',
  });
}
