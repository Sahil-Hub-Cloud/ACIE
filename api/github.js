/**
 * ACIE — AI Change Impact Engine
 * Vercel Serverless Webhook Handler
 *
 * Triggered by GitHub pull_request events.
 * For each changed JS/TS file it:
 *   1. Fetches & parses file content (imports / exports)
 *   2. Saves a dependency node to Neo4j
 *   3. Queries the blast radius (transitively affected files)
 *   4. Posts a structured report comment on the PR
 */

import axios from 'axios';
import 'dotenv/config';

import { parseFile } from '../src/parser/parser.js';
import {
  connectToGraph,
  saveFileNode,
  getBlastRadius,
  closeConnection,
} from '../src/graph/graph.js';

// ─── GitHub API Helpers ───────────────────────────────────────────────────────

const ghHeaders = () => ({
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'ACIE-Bot',
});

/**
 * Fetches the list of files changed in a pull request.
 * @param {string} repo        - "owner/repo"
 * @param {number} pullNumber
 * @returns {Promise<Array>}   - GitHub PR files array
 */
async function getPRFiles(repo, pullNumber) {
  const url = `https://api.github.com/repos/${repo}/pulls/${pullNumber}/files`;
  const { data } = await axios.get(url, { headers: ghHeaders() });
  return data;
}

/**
 * Fetches and base64-decodes the content of a file from a specific ref.
 * @param {string} repo
 * @param {string} filePath
 * @param {string} ref        - commit SHA or branch
 * @returns {Promise<string>} - decoded file content
 */
async function getFileContent(repo, filePath, ref) {
  const url = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${ref}`;
  const { data } = await axios.get(url, { headers: ghHeaders() });
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

/**
 * Posts a comment on a pull request.
 * @param {string} repo
 * @param {number} pullNumber
 * @param {string} body       - Markdown comment text
 */
async function postPRComment(repo, pullNumber, body) {
  const url = `https://api.github.com/repos/${repo}/issues/${pullNumber}/comments`;
  await axios.post(url, { body }, { headers: ghHeaders() });
}

// ─── Report Builders ──────────────────────────────────────────────────────────

/**
 * Builds the Markdown blast radius report to post as a PR comment.
 * @param {string[]} changedFiles
 * @param {string[]} blastRadius
 * @returns {string}
 */
function buildReport(changedFiles, blastRadius) {
  const changed = changedFiles.join(', ');

  if (blastRadius.length === 0) {
    return [
      '## ✅ ACIE — Blast Radius Report',
      `**Files changed:** ${changed}`,
      '**Blast Radius:** No other files affected.',
      '**Risk Level:** LOW',
      '*Powered by ACIE — AI Change Impact Engine*',
    ].join('\n');
  }

  const riskLevel = blastRadius.length >= 5 ? 'HIGH' : blastRadius.length >= 2 ? 'MEDIUM' : 'HIGH';
  const affected  = blastRadius.map((f) => `- ${f}`).join('\n');

  return [
    '## 🔍 ACIE — Blast Radius Report',
    '',
    `**Files changed:** ${changed}`,
    '',
    '**⚠️ Blast Radius — files that may be affected:**',
    affected,
    '',
    `**Risk Level:** ${riskLevel}`,
    '',
    '*Powered by ACIE — AI Change Impact Engine*',
  ].join('\n');
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Health-check for GET requests (Vercel preview / browser visits)
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ACIE is running!' });
  }

  const event = req.headers['x-github-event'];
  console.log(`Webhook received: ${event}`);

  // Only handle pull_request opened / synchronize (new commits pushed)
  if (event !== 'pull_request') {
    return res.status(200).json({ status: 'ok', message: `Ignored event: ${event}` });
  }

  const action     = req.body?.action;
  const pr         = req.body?.pull_request;
  const repo       = req.body?.repository?.full_name;
  const pullNumber = pr?.number;
  const headSha    = pr?.head?.sha;

  if (!['opened', 'synchronize', 'reopened'].includes(action)) {
    return res.status(200).json({ status: 'ok', message: `Ignored action: ${action}` });
  }

  console.log(`PR #${pullNumber} ${action}: "${pr.title}" in ${repo}`);

  // Respond to GitHub immediately — long processing happens below
  res.status(200).json({ status: 'ok' });

  // ── Process asynchronously so Vercel doesn't time out the webhook ──────────
  ;(async () => {
    try {
      // 1. Connect to Neo4j
      await connectToGraph();

      // 2. Get changed files
      const prFiles = await getPRFiles(repo, pullNumber);
      const jstsFiles = prFiles.filter(
        (f) => f.status !== 'removed' && /\.(js|ts|jsx|tsx)$/.test(f.filename)
      );

      console.log(`Found ${jstsFiles.length} JS/TS file(s) changed in PR #${pullNumber}`);

      if (jstsFiles.length === 0) {
        await postPRComment(
          repo,
          pullNumber,
          [
            '## ✅ ACIE — Blast Radius Report',
            '**Files changed:** *(no JS/TS files)*',
            '**Blast Radius:** No JS/TS files were modified.',
            '**Risk Level:** LOW',
            '*Powered by ACIE — AI Change Impact Engine*',
          ].join('\n')
        );
        return;
      }

      // 3. Parse each file and save to Neo4j
      const changedFilePaths = [];
      const allBlastRadius   = new Set();

      for (const file of jstsFiles) {
        const filePath = file.filename;

        try {
          // Fetch content from GitHub
          const content = await getFileContent(repo, filePath, headSha);

          // Parse imports / exports
          const parsed = parseFile(filePath, content);
          console.log(`Parsed ${filePath}: ${parsed.exports.length} export(s), ${parsed.imports.length} import(s)`);

          // Save to Neo4j graph
          await saveFileNode(filePath, parsed.exports, parsed.imports);
          changedFilePaths.push(filePath);

          // Query blast radius for this file
          const affected = await getBlastRadius(filePath);
          affected.forEach((f) => {
            // Don't include the changed files themselves in blast radius report
            if (!changedFilePaths.includes(f)) allBlastRadius.add(f);
          });
        } catch (fileErr) {
          console.error(`⚠️  Skipping ${filePath}: ${fileErr.message}`);
        }
      }

      // 4. Build and post the PR comment
      const blastRadius = Array.from(allBlastRadius);
      const report      = buildReport(changedFilePaths, blastRadius);

      await postPRComment(repo, pullNumber, report);
      console.log(`✅ Posted blast radius report on PR #${pullNumber}`);

    } catch (err) {
      console.error('❌ ACIE handler error:', err.message);
    } finally {
      await closeConnection();
    }
  })();
}
