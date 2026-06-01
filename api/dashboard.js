import fs from 'fs';
const code = `import axios from 'axios';
import { parseFile } from '../src/parser/parser.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ACIE is running' });
  }

  const event = req.headers['x-github-event'];
  const action = req.body?.action;

  if (event !== 'pull_request' || !['opened', 'synchronize', 'reopened'].includes(action)) {
    return res.status(200).json({ status: 'ignored' });
  }

  const repo = req.body.repository.full_name;
  const prNumber = req.body.pull_request.number;
  const prTitle = req.body.pull_request.title;
  const prAuthor = req.body.pull_request.user.login;
  const headSha = req.body.pull_request.head.sha;
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Authorization: \`token \${token}\`,
    Accept: 'application/vnd.github.v3+json'
  };

  try {
    const filesRes = await axios.get(
      \`https://api.github.com/repos/\${repo}/pulls/\${prNumber}/files\`,
      { headers }
    );
    const jsFiles = filesRes.data.filter(f => f.filename.match(/\\.(js|ts|jsx|tsx|py)$/));

    if (jsFiles.length === 0) {
      return res.status(200).json({ status: 'no supported files changed' });
    }

    const parsedFiles = [];
    for (const file of jsFiles) {
      try {
        const contentRes = await axios.get(
          \`https://api.github.com/repos/\${repo}/contents/\${file.filename}?ref=\${headSha}\`,
          { headers }
        );
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        parsedFiles.push(parseFile(file.filename, content));
      } catch (e) {
        parsedFiles.push({ filePath: file.filename, exports: [], imports: [] });
      }
    }

    const changedPaths = new Set(parsedFiles.map(f => f.filePath));

    const repoFilesRes = await axios.get(
      \`https://api.github.com/repos/\${repo}/git/trees/\${headSha}?recursive=1\`,
      { headers }
    );
    const allRepoFiles = repoFilesRes.data.tree
      .filter(f => f.type === 'blob' && f.path.match(/\\.(js|ts|jsx|tsx|py)$/))
      .map(f => f.path);

    const blastRadius = new Set();
    for (const repoFilePath of allRepoFiles) {
      if (changedPaths.has(repoFilePath)) continue;
      try {
        const contentRes = await axios.get(
          \`https://api.github.com/repos/\${repo}/contents/\${repoFilePath}?ref=\${headSha}\`,
          { headers }
        );
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(repoFilePath, content);
        for (const imp of parsed.imports) {
          for (const changed of changedPaths) {
            const impClean = imp.from.replace(/^\\.\\.\\//, '').replace(/^\\.\\//, '').replace(/\\.(js|ts|jsx|tsx)$/, '');
            const changedClean = changed.replace(/\\.(js|ts|jsx|tsx)$/, '');
            if (
              changedClean.endsWith(impClean) ||
              changedClean.includes('/' + impClean) ||
              impClean === changedClean.split('/').pop()
            ) {
              blastRadius.add(repoFilePath);
            }
          }
        }
      } catch (e) {}
    }

    const allFilenames = filesRes.data.map(f => f.filename);
    const missingTests = [];
    for (const file of parsedFiles) {
      if (!file.filePath.match(/\\.(test|spec)\\.(js|ts|jsx|tsx)$/)) {
        const base = file.filePath.replace(/\\.(js|ts|jsx|tsx)$/, '');
        const hasTest = allFilenames.some(f =>
          f.match(new RegExp(base.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '\\\\.(test|spec)'))
        );
        if (!hasTest) missingTests.push(file.filePath);
      }
    }

    const affectedCount = blastRadius.size;
    let risk = 'LOW';
    if (affectedCount >= 3) risk = 'HIGH';
    else if (affectedCount >= 1) risk = 'MEDIUM';
    if (missingTests.length > 0 && risk === 'LOW') risk = 'MEDIUM';

    const riskIcon = risk === 'HIGH' ? '🔴' : risk === 'MEDIUM' ? '🟡' : '🟢';
    const riskEmoji = risk === 'HIGH' ? '⛔' : risk === 'MEDIUM' ? '⚠️' : '✅';

    let comment = '';
    comment += '## ⚡ ACIE — Change Impact Report\\n\\n';
    comment += '> Automated analysis by [ACIE](https://acie-gamma.vercel.app) — AI Change Impact Engine\\n\\n';
    comment += '---\\n\\n';

    comment += '### 👤 PR Info\\n';
    comment += '| Field | Value |\\n';
    comment += '|-------|-------|\\n';
    comment += \`| Author | @\${prAuthor} |\\n\`;
    comment += \`| Files changed | \${parsedFiles.length} |\\n\`;
    comment += \`| Risk | \${riskIcon} **\${risk}** |\\n\\n\`;

    comment += '### 📁 Files Changed\\n';
    comment += '| File | Exports | Imports |\\n';
    comment += '|------|---------|---------|\\n';
    parsedFiles.forEach(f => {
      comment += \`| \\\`\${f.filePath}\\\` | \${f.exports.length} | \${f.imports.length} |\\n\`;
    });

    comment += '\\n### 💥 Blast Radius\\n';
    if (blastRadius.size === 0) {
      comment += '> ✅ No other files affected by this change.\\n';
    } else {
      blastRadius.forEach(f => { comment += \`- \\\`\${f}\\\`\\n\`; });
    }

    comment += \`\\n### \${riskIcon} Risk Score: **\${risk}**\\n\`;
    if (affectedCount > 0) comment += \`- \${affectedCount} file\${affectedCount !== 1 ? 's' : ''} in blast radius\\n\`;
    missingTests.forEach(f => { comment += \`- ⚠️ \\\`\${f}\\\` has no test coverage\\n\`; });

    comment += \`\\n### \${riskEmoji} Recommendation\\n\`;
    if (risk === 'HIGH') comment += '> ⛔ **High risk** — carefully review all affected files before merging.\\n';
    else if (risk === 'MEDIUM') comment += '> ⚠️ **Medium risk** — review affected files and ensure test coverage.\\n';
    else comment += '> ✅ **Low risk** — safe to merge.\\n';

    comment += '\\n---\\n';
    comment += '*Powered by [ACIE](https://acie-gamma.vercel.app) — [Dashboard](https://acie-gamma.vercel.app/dashboard) · [Pricing](https://acie-gamma.vercel.app/pricing)*';

    await axios.post(
      \`https://api.github.com/repos/\${repo}/issues/\${prNumber}/comments\`,
      { body: comment },
      { headers }
    );

    try {
      const slackWebhook = process.env.SLACK_WEBHOOK_URL;
      if (slackWebhook) {
        await axios.post(slackWebhook, {
          text: \`\${riskIcon} *ACIE Alert* — PR #\${prNumber} in *\${repo}*\\n*Title:* \${prTitle}\\n*Author:* @\${prAuthor}\\n*Risk:* \${risk}\\n*Blast radius:* \${affectedCount} file(s)\\n🔗 https://github.com/\${repo}/pull/\${prNumber}\`
        });
      }
    } catch (slackErr) {
      console.error('Slack error:', slackErr.message);
    }

    return res.status(200).json({ status: 'success', risk, affectedCount });

  } catch (error) {
    console.error('ACIE Error:', error.response?.data || error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}`;

fs.writeFileSync('api/github.js', code);
console.log('done');