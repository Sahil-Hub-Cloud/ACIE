import axios from 'axios';
import { parseFile } from '../src/parser/parser.js';
import { connectToGraph, saveFileNode, getBlastRadius, closeConnection } from '../src/graph/graph.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ACIE is running!' });
  }

  const event = req.headers['x-github-event'];

  if (event !== 'pull_request') {
    return res.status(200).json({ status: 'ignored' });
  }

  const action = req.body.action;
  if (!['opened', 'synchronize', 'reopened'].includes(action)) {
    return res.status(200).json({ status: 'ignored' });
  }

  res.status(200).json({ status: 'ok' });

  const repo = req.body.repository.full_name;
  const prNumber = req.body.pull_request.number;
  const token = process.env.GITHUB_TOKEN;
  const headers = { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' };

  try {
    await connectToGraph();

    const filesRes = await axios.get(`https://api.github.com/repos/${repo}/pulls/${prNumber}/files`, { headers });
    const jsFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx)$/));

    let allBlastRadius = [];
    let changedFiles = [];

    for (const file of jsFiles) {
      changedFiles.push(file.filename);
      try {
        const contentRes = await axios.get(`https://api.github.com/repos/${repo}/contents/${file.filename}`, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(file.filename, content);
        await saveFileNode(parsed.filePath, parsed.exports, parsed.imports);
        const blast = await getBlastRadius(parsed.filePath);
        allBlastRadius = [...new Set([...allBlastRadius, ...blast])];
      } catch (e) {
        console.error(`Error processing ${file.filename}:`, e.message);
      }
    }

    const riskLevel = allBlastRadius.length === 0 ? 'LOW' : allBlastRadius.length < 3 ? 'MEDIUM' : 'HIGH';
    const emoji = riskLevel === 'LOW' ? '✅' : riskLevel === 'MEDIUM' ? '⚠️' : '🔴';

    let comment;
    if (allBlastRadius.length === 0) {
      comment = `## ✅ ACIE — Blast Radius Report\n\n**Files changed:** ${changedFiles.join(', ') || 'none'}\n\n**Blast Radius:** No other files affected.\n\n**Risk Level:** LOW\n\n*Powered by ACIE — AI Change Impact Engine*`;
    } else {
      comment = `## 🔴 ACIE — Blast Radius Report\n\n**Files changed:** ${changedFiles.join(', ')}\n\n**⚠️ Blast Radius — files that may be affected:**\n${allBlastRadius.map(f => `- ${f}`).join('\n')}\n\n**Risk Level:** ${riskLevel}\n\n*Powered by ACIE — AI Change Impact Engine*`;
    }

    await axios.post(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, { body: comment }, { headers });
    await closeConnection();
  } catch (err) {
    console.error('ACIE error:', err.message);
  }
}
