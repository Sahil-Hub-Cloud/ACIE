import axios from 'axios';
import { parseFile } from '../src/parser/parser.js';

export default async function handler(req, res) {
  // ─── GET Request: Dashboard ───────────────────────────────────────────────
  if (req.method !== 'POST') {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>ACIE Dashboard</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #0d1117; color: #c9d1d9; }
    h1 { color: #58a6ff; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .low { color: #3fb950; }
    .medium { color: #d29922; }
    .high { color: #f85149; }
    a { color: #58a6ff; }
  </style>
</head>
<body>
  <h1>⚡ ACIE Dashboard</h1>
  <p>AI Change Impact Engine — Google Maps for your codebase</p>
  <div class="card">
    <h2>✅ Status: Live</h2>
    <p>ACIE is actively monitoring pull requests on GitHub.</p>
    <p>Every PR gets an automatic blast radius report.</p>
  </div>
  <div class="card">
    <h2>🔍 How it works</h2>
    <ol>
      <li>Developer opens a Pull Request</li>
      <li>ACIE scans all changed files</li>
      <li>Detects which other files are affected</li>
      <li>Posts a risk report as a PR comment</li>
    </ol>
  </div>
  <div class="card">
    <h2>📊 Risk Levels</h2>
    <p class="low">● LOW — Safe to merge</p>
    <p class="medium">● MEDIUM — Review before merging</p>
    <p class="high">● HIGH — Carefully review all affected files</p>
  </div>
  <div class="card">
    <h2>🚀 Powered by</h2>
    <p>GitHub Apps · Vercel · Node.js</p>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE">View on GitHub</a>
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  // ─── POST Request: Webhook ────────────────────────────────────────────────
  const event = req.headers['x-github-event'];
  const action = req.body?.action;

  if (event !== 'pull_request' || !['opened', 'synchronize', 'reopened'].includes(action)) {
    return res.status(200).json({ status: 'ignored' });
  }

  const repo = req.body.repository.full_name;
  const prNumber = req.body.pull_request.number;
  const headSha = req.body.pull_request.head.sha;
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json'
  };

  try {
    // 1. Get changed files in the PR
    const filesRes = await axios.get(
      `https://api.github.com/repos/${repo}/pulls/${prNumber}/files`,
      { headers }
    );
    const jsFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx)$/));

    if (jsFiles.length === 0) {
      return res.status(200).json({ status: 'no js files changed' });
    }

    // 2. Parse all changed files
    const parsedFiles = [];
    for (const file of jsFiles) {
      try {
        const contentRes = await axios.get(
          `https://api.github.com/repos/${repo}/contents/${file.filename}?ref=${headSha}`,
          { headers }
        );
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(file.filename, content);
        parsedFiles.push(parsed);
      } catch (e) {
        parsedFiles.push({ filePath: file.filename, exports: [], imports: [] });
      }
    }

    const changedPaths = new Set(parsedFiles.map(f => f.filePath));

    // 3. Get all JS/TS files in the repo to check for impact
    const repoFilesRes = await axios.get(
      `https://api.github.com/repos/${repo}/git/trees/${headSha}?recursive=1`,
      { headers }
    );
    const allRepoFiles = repoFilesRes.data.tree
      .filter(f => f.type === 'blob' && f.path.match(/\.(js|ts|jsx|tsx)$/))
      .map(f => f.path);

    // 4. Calculate blast radius: for each repo file, check if it imports any changed file
    const blastRadius = new Set();
    for (const repoFilePath of allRepoFiles) {
      if (changedPaths.has(repoFilePath)) continue;
      try {
        const contentRes = await axios.get(
          `https://api.github.com/repos/${repo}/contents/${repoFilePath}?ref=${headSha}`,
          { headers }
        );
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(repoFilePath, content);
        for (const imp of parsed.imports) {
          for (const changed of changedPaths) {
            const changedBase = changed.replace(/\.(js|ts|jsx|tsx)$/, '');
            // Check if import path includes the filename (simple heuristic)
            if (imp.from.includes(changedBase.split('/').pop())) {
              blastRadius.add(repoFilePath);
            }
          }
        }
      } catch (e) {
        // Skip files that fail to load or parse
      }
    }

    // 5. Check for missing tests
    const allFilenames = filesRes.data.map(f => f.filename);
    const missingTests = [];
    for (const file of parsedFiles) {
      const isTest = file.filePath.match(/\.(test|spec)\.(js|ts|jsx|tsx)$/);
      if (!isTest) {
        const base = file.filePath.replace(/\.(js|ts|jsx|tsx)$/, '');
        const hasTest = allFilenames.some(f => f.match(new RegExp(`${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.(test|spec)`)));
        if (!hasTest) missingTests.push(file.filePath);
      }
    }

    // 6. Calculate Risk Score
    const affectedCount = blastRadius.size;
    let risk = 'LOW';
    if (affectedCount >= 3) risk = 'HIGH';
    else if (affectedCount >= 1) risk = 'MEDIUM';
    if (missingTests.length > 0 && risk === 'LOW') risk = 'MEDIUM';

    // 7. Build Markdown Comment
    let comment = `## ${affectedCount === 0 ? '✅' : '🔍'} ACIE — Change Impact Report\n\n`;
    comment += `### 📁 Files Changed\n`;
    parsedFiles.forEach(f => {
      comment += `- \`${f.filePath}\` (${f.exports.length} exports, ${f.imports.length} imports)\n`;
    });

    comment += `\n### 💥 Blast Radius\n`;
    if (blastRadius.size === 0) {
      comment += `No other files affected by this change.\n`;
    } else {
      blastRadius.forEach(f => { comment += `- \`${f}\`\n`; });
    }

    comment += `\n### 🎯 Risk Score: **${risk}**\n`;
    if (affectedCount > 0) comment += `- ${affectedCount} file${affectedCount !== 1 ? 's' : ''} affected\n`;
    if (missingTests.length > 0) {
      missingTests.forEach(f => { comment += `- ⚠️ \`${f}\` has no test coverage\n`; });
    }
    if (affectedCount === 0 && missingTests.length === 0) comment += `Safe to merge.\n`;

    comment += `\n### 💡 Recommendation\n`;
    if (risk === 'HIGH') {
      comment += `⛔ High risk — carefully review all affected files before merging.\n`;
    } else if (risk === 'MEDIUM') {
      comment += `⚠️ Medium risk — review affected files and ensure test coverage.\n`;
    } else {
      comment += `✅ Low risk — safe to merge.\n`;
    }

    comment += `\n*Powered by [ACIE](https://github.com/Sahil-Hub-Cloud/ACIE) — AI Change Impact Engine*`;

    // 8. Post Comment to GitHub
    await axios.post(
      `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`,
      { body: comment },
      { headers }
    );

    return res.status(200).json({ status: 'success', risk, affectedCount })
// Send Slack notification
    try {
      const slackWebhook = process.env.SLACK_WEBHOOK_URL;
      if (slackWebhook) {
        await axios.post(slackWebhook, {
          text: '⚡ *ACIE Alert* — PR #' + prNumber + ' in *' + repo + '*\n*Risk:* ' + risk + '\n*Files changed:* ' + parsedFiles.length + '\n*Blast radius:* ' + affectedCount + ' file(s) affected\n🔗 https://github.com/' + repo + '/pull/' + prNumber
        });
      }
    } catch(slackErr) {
      console.error('Slack error:', slackErr.message);
    }

    return res.status(200).json({ status: 'success', risk, affectedCount });;
  } catch (error) {
    console.error('ACIE Error:', error.response?.data || error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}