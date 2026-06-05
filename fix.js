import fs from 'fs';
const KEY = '$2a$10$OLH.A4d17J6/.mDf9XtqwuT0jtdNQpLP74RT1aDXXnEUFB6ry0Q' + '/u';
const BIN = '6a212bb4da38895dfe8514a5';

const code = `import axios from 'axios';
import { parseFile } from '../src/parser/parser.js';

const JSONBIN_ID = '${BIN}';
const JSONBIN_KEY = '${KEY}';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ status: 'ACIE_ONLINE' });
  
  const body = req.body;
  if (!body.pull_request) return res.status(200).json({ status: 'ignored' });

  const repo = body.repository.full_name;
  const prNumber = body.pull_request.number;
  const token = process.env.GITHUB_TOKEN;
  const headers = { Authorization: "token " + token, Accept: 'application/vnd.github.v3+json' };

  try {
    const filesRes = await axios.get("https://api.github.com/repos/" + repo + "/pulls/" + prNumber + "/files", { headers });
    const jsFiles = filesRes.data.filter(f => f.filename.match(/\\.(js|ts|jsx|tsx)$/));

    let securityScore = 100;
    let qualityScore = 100;
    let issues = 0;

    for (const file of jsFiles) {
      const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + body.pull_request.head.sha, { headers });
      const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
      
      if (/password|secret|api_key|token/i.test(content)) { securityScore -= 20; issues++; }
      if (content.includes('                ')) { qualityScore -= 5; }
    }

    const healthScore = Math.round((securityScore + qualityScore) / 2);

    // SAVE TO JSONBIN
    const historyRes = await axios.get("https://api.jsonbin.io/v3/b/" + JSONBIN_ID + "/latest", { headers: { "X-Master-Key": JSONBIN_KEY } });
    const records = historyRes.data.record.records || [];
    records.unshift({
      prNumber,
      repo,
      healthScore,
      securityScore,
      qualityScore,
      issues,
      timestamp: new Date().toISOString()
    });

    await axios.put("https://api.jsonbin.io/v3/b/" + JSONBIN_ID, { records: records.slice(0, 50) }, { headers: { "X-Master-Key": JSONBIN_KEY, "Content-Type": "application/json" } });

    return res.status(200).json({ status: 'success', healthScore });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}`;

fs.writeFileSync('api/github.js', code);
console.log('✅ ENGINE_WIRED');
