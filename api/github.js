import axios from 'axios';
import { parseFile } from '../src/parser/parser.js';

const JSONBIN_ID = '6a212bb4da38895dfe8514a5';
const JSONBIN_KEY = '$2a$10$OLH.A4d17J6/.mDf9XtqwuT0jtdNQpLP74RT1aDXXnEUFB6ry0Q/u';

async function saveRecord(record) {
  try {
    const res = await axios.get(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    const records = res.data.record.records || [];
    records.unshift(record);
    if (records.length > 100) records.splice(100);
    await axios.put(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, { records }, {
      headers: { 'X-Master-Key': JSONBIN_KEY, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('JSONBin save error:', e.message);
  }
}

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
  const prUrl = req.body.pull_request.html_url;
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json'
  };

  try {
    const filesRes = await axios.get(
      `https://api.github.com/repos/${repo}/pulls/${prNumber}/files`,
      { headers }
    );
    const jsFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx)$/));

    if (jsFiles.length === 0) {
      return res.status(200).json({ status: 'no js files changed' });
    }

    const parsedFiles = [];
    for (const file of jsFiles) {
      try {
        const contentRes = await axios.get(
          `https://api.github.com/repos/${repo}/contents/${file.filename}?ref=${headSha}`,
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
      `https://api.github.com/repos/${repo}/git/trees/${headSha}?recursive=1`,
      { headers }
    );
    const allRepoFiles = repoFilesRes.data.tree
      .filter(f => f.type === 'blob' && f.path.match(/\.(js|ts|jsx|tsx)$/))
      .map(f => f.path);

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
            const impClean = imp.from.replace(/^\.\.\//, '').replace(/^\.\//, '').replace(/\.(js|ts|jsx|tsx)$/, '');
            const changedClean = changed.replace(/\.(js|ts|jsx|tsx)$/, '');
            if (changedClean.endsWith(impClean) || changedClean.includes('/' + impClean) || impClean === changedClean.split('/').pop()) {
              blastRadius.add(repoFilePath);
            }
          }
        }
      } catch (e) {}
    }

    const affectedCount = blastRadius.size;
    let risk = 'LOW';
    if (affectedCount >= 3) risk = 'HIGH';
    else if (affectedCount >= 1) risk = 'MEDIUM';

    const riskIcon = risk === 'HIGH' ? '🔴' : risk === 'MEDIUM' ? '🟡' : '🟢';

    let comment = '## ⚡ ACIE — Change Impact Report\n\n';
    comment += '| Field | Value |\n|-------|-------|\n';
    comment += `| Author | @${prAuthor} |\n`;
    comment += `| Files changed | ${parsedFiles.length} |\n`;
    comment += `| Risk | ${riskIcon} **${risk}** |\n\n`;
    comment += '### 📁 Files Changed\n';
    comment += '| File | Exports | Imports |\n|------|---------|---------|\n';
    parsedFiles.forEach(f => { comment += `| \`${f.filePath}\` | ${f.exports.length} | ${f.imports.length} |\n`; });
    comment += '\n### 💥 Blast Radius\n';
    if (blastRadius.size === 0) {
      comment += '> ✅ No other files affected.\n';
    } else {
      blastRadius.forEach(f => { comment += `- \`${f}\`\n`; });
    }
    comment += `\n### ${riskIcon} Risk: **${risk}**\n`;
    if (risk === 'HIGH') comment += '> ⛔ High risk — review all affected files before merging.\n';
    else if (risk === 'MEDIUM') comment += '> ⚠️ Medium risk — review affected files.\n';
    else comment += '> ✅ Low risk — safe to merge.\n';
    comment += '\n*Powered by [ACIE](https://acie-gamma.vercel.app)*';

    await axios.post(
      `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`,
      { body: comment },
      { headers }
    );

    await saveRecord({
      id: `${repo}-${prNumber}`,
      repo,
      prNumber,
      prTitle,
      prAuthor,
      prUrl,
      risk,
      affectedCount,
      filesChanged: parsedFiles.length,
      blastRadius: [...blastRadius],
      timestamp: new Date().toISOString()
    });

    try {
      const slackWebhook = process.env.SLACK_WEBHOOK_URL;
      if (slackWebhook) {
        await axios.post(slackWebhook, {
          text: `${riskIcon} *ACIE* — PR #${prNumber} in *${repo}*\nRisk: ${risk} · ${affectedCount} files affected\n${prUrl}`
        });
      }
    } catch (e) {}

    return res.status(200).json({ status: 'success', risk, affectedCount });

  } catch (error) {
    console.error('ACIE Error:', error.response?.data || error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}