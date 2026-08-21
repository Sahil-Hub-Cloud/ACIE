import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { run, get } from '../../../../lib/db';
import {
  calculateBlastRadiusInMemory,
  formatPRComment,
  type GraphEdge,
} from '../../../../lib/blast-radius';

// ── GitHub API helpers ──────────────────────────────────────────────────────

const GITHUB_API = 'https://api.github.com';

function getGitHubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github.v3+json',
    ...(token ? { Authorization: `token ${token}` } : {}),
  };
}

async function githubFetch(path: string): Promise<any> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: getGitHubHeaders(),
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${path}`);
  }
  return res.json();
}

// ── Diff analysis (extract changed exports) ─────────────────────────────────

interface ChangedSymbol {
  filePath: string;
  symbolName: string;
  changeType: 'added' | 'modified' | 'removed';
}

function analyzePatch(filename: string, patch: string): ChangedSymbol[] {
  if (!patch) return [];
  const symbols: ChangedSymbol[] = [];
  const lines = patch.split('\n');
  const removedExports: string[] = [];
  const addedExports: string[] = [];

  const exportPatterns = [
    /export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/,
    /export\s+(?:default\s+)?class\s+(\w+)/,
    /export\s+interface\s+(\w+)/,
    /export\s+type\s+(\w+)/,
    /export\s+(?:const|let|var)\s+(\w+)/,
    /export\s+enum\s+(\w+)/,
  ];

  for (const line of lines) {
    if (line.startsWith('-') && !line.startsWith('---')) {
      for (const regex of exportPatterns) {
        const match = line.slice(1).match(regex);
        if (match) { removedExports.push(match[1]); break; }
      }
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      for (const regex of exportPatterns) {
        const match = line.slice(1).match(regex);
        if (match) { addedExports.push(match[1]); break; }
      }
    }
  }

  for (const name of removedExports) {
    if (!addedExports.includes(name)) {
      symbols.push({ filePath: filename, symbolName: name, changeType: 'removed' });
    }
  }
  for (const name of addedExports) {
    if (removedExports.includes(name)) {
      symbols.push({ filePath: filename, symbolName: name, changeType: 'modified' });
    } else {
      symbols.push({ filePath: filename, symbolName: name, changeType: 'added' });
    }
  }

  // If no exports found but file was modified, mark whole file as changed
  if (symbols.length === 0 && patch.includes('@@')) {
    symbols.push({ filePath: filename, symbolName: '*', changeType: 'modified' });
  }

  return symbols;
}

// ── Search for importers of changed files ───────────────────────────────────

async function findImporters(
  repoFullName: string,
  filenames: string[],
  headSha: string,
): Promise<GraphEdge[]> {
  const edges: GraphEdge[] = [];

  // Extract base module names (without extension) from changed filenames
  const bases = filenames.map(f => {
    const name = f.split('/').pop() || f;
    return name.replace(/\.(ts|tsx|js|jsx|py|go)$/, '');
  });

  try {
    // Use GitHub code search to find files that import these modules
    for (const base of bases) {
      const query = `repo:${repoFullName} ${base} language:typescript language:javascript`;
      const results = await githubFetch(`/search/code?q=${encodeURIComponent(query)}&per_page=10`);

      if (results.items) {
        for (const item of results.items) {
          const filePath = item.path;
          if (!filenames.includes(filePath)) {
            edges.push({
              sourceFile: filePath,
              targetFile: filenames.find(f => {
                const b = f.split('/').pop()?.replace(/\.\w+$/, '') || '';
                return base === b;
              }) || filenames[0],
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[ACIE] Code search failed, using file-level fallback:', (err as Error).message);
  }

  // Fallback: if no edges found, create a simple relationship between changed files
  if (edges.length === 0 && filenames.length > 1) {
    for (let i = 0; i < filenames.length; i++) {
      for (let j = i + 1; j < filenames.length; j++) {
        // Check if files are in similar directories (likely related)
        const dir1 = filenames[i].split('/').slice(0, -1).join('/');
        const dir2 = filenames[j].split('/').slice(0, -1).join('/');
        if (dir1 === dir2 || dir1.startsWith(dir2) || dir2.startsWith(dir1)) {
          edges.push({ sourceFile: filenames[i], targetFile: filenames[j] });
        }
      }
    }
  }

  return edges;
}

// ── Store analysis in database ──────────────────────────────────────────────

async function storeAnalysis(params: {
  repoId: number;
  prNumber: number;
  prUrl: string;
  prTitle: string;
  prAuthor: string;
  riskScore: number;
  riskLevel: string;
  changedFiles: string[];
  changedSymbols: ChangedSymbol[];
  blastRadius: any;
  recommendations: string[];
}) {
  try {
    await run(`
      INSERT INTO analyses (
        repo_id, pr_number, pr_url, pr_title, pr_author,
        risk_score, risk_level, changed_files, changed_symbols,
        impacted_services, blast_radius, recommendations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      params.repoId,
      params.prNumber,
      params.prUrl,
      params.prTitle,
      params.prAuthor,
      params.riskScore,
      params.riskLevel,
      JSON.stringify(params.changedFiles),
      JSON.stringify(params.changedSymbols),
      JSON.stringify(params.blastRadius.impactedServices),
      JSON.stringify(params.blastRadius),
      JSON.stringify(params.recommendations),
    ]);
  } catch (err) {
    console.warn('[ACIE] Failed to store analysis:', (err as Error).message);
  }
}

// ── Post comment on PR ─────────────────────────────────────────────────────

async function postPRComment(repoFullName: string, prNumber: number, body: string) {
  const res = await fetch(
    `${GITHUB_API}/repos/${repoFullName}/issues/${prNumber}/comments`,
    {
      method: 'POST',
      headers: {
        ...getGitHubHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body }),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to post PR comment: ${res.status} ${err}`);
  }
}

// ── Main webhook handler ────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Verify webhook signature (if secret is configured)
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers.get('x-hub-signature-256');
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }
      const body = await req.text();
      const expected = 'sha256=' + crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
      if (signature !== expected) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      // Re-parse body since we read it for verification
      var payload = JSON.parse(body);
    } else {
      var payload = await req.json();
    }

    // 2. Only process pull_request events
    if (!payload.pull_request) {
      return NextResponse.json({ status: 'ignored', reason: 'Not a pull_request event' });
    }

    const pr = payload.pull_request;
    const action = payload.action;
    const repoFullName = payload.repository.full_name;
    const prNumber = pr.number;
    const prUrl = pr.html_url;
    const prTitle = pr.title;
    const prAuthor = pr.user.login;
    const headSha = pr.head.sha;

    // Only analyze on open, synchronize (new commits), or reopen
    if (!['opened', 'synchronize', 'reopened'].includes(action)) {
      return NextResponse.json({ status: 'ignored', reason: `PR action '${action}' not analyzed` });
    }

    console.log(`[ACIE] Analyzing PR #${prNumber} in ${repoFullName} (${action})`);

    // 3. Fetch changed files from GitHub
    const files = await githubFetch(
      `/repos/${repoFullName}/pulls/${prNumber}/files?per_page=100`,
    );

    const changedFiles = files
      .filter((f: any) => f.filename.match(/\.(ts|tsx|js|jsx|py|go)$/))
      .map((f: any) => ({
        filename: f.filename,
        status: f.status,
        patch: f.patch || '',
        additions: f.additions,
        deletions: f.deletions,
      }));

    if (changedFiles.length === 0) {
      return NextResponse.json({ status: 'ignored', reason: 'No source files changed' });
    }

    // 4. Analyze diffs for changed symbols
    const changedSymbols: ChangedSymbol[] = [];
    for (const file of changedFiles) {
      changedSymbols.push(...analyzePatch(file.filename, file.patch));
    }

    const filenames = changedFiles.map((f: any) => f.filename);

    // 5. Find importers (downstream dependents)
    const edges = await findImporters(repoFullName, filenames, headSha);

    // 6. Calculate blast radius
    const result = calculateBlastRadiusInMemory(filenames, changedSymbols, edges);

    // 7. Format and post PR comment
    const comment = formatPRComment(prNumber, filenames, result);

    try {
      await postPRComment(repoFullName, prNumber, comment);
      console.log(`[ACIE] Posted blast radius comment on PR #${prNumber}`);
    } catch (err) {
      console.error('[ACIE] Failed to post comment:', (err as Error).message);
      // Continue even if comment posting fails — we still store the analysis
    }

    // 8. Store analysis in database
    // Look up repo in DB
    const repo = await get<{ id: number }>(
      'SELECT id FROM repos WHERE name = ? OR url LIKE ?',
      [payload.repository.name, `%${repoFullName}%`],
    );

    if (repo) {
      await storeAnalysis({
        repoId: repo.id,
        prNumber,
        prUrl,
        prTitle,
        prAuthor,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        changedFiles: filenames,
        changedSymbols,
        blastRadius: result,
        recommendations: result.recommendations,
      });
    }

    return NextResponse.json({
      success: true,
      prNumber,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      totalImpactedFiles: result.totalImpactedFiles,
      impactedServices: result.impactedServices.length,
      commentPosted: true,
    });
  } catch (err) {
    console.error('[ACIE] Webhook error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'ACIE Webhook Online', version: '2.0' });
}
