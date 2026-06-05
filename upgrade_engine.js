import fs from 'fs';
const BIN = '6a212bb4da38895dfe8514a5';
const KEY = '$2a$10$OLH.A4d17J6/.mDf9XtqwuT0jtdNQpLP74RT1aDXXnEUFB6ry0Q/u';

const engineCode = `import axios from 'axios';
import { parseFile } from '../src/parser/parser.js';
const JSONBIN_ID = '${BIN}';
const JSONBIN_KEY = '${KEY}';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ status: 'ACIE_ONLINE' });
  const body = req.body;
  if (!body.pull_request) return res.status(200).json({ status: 'ignored' });

  const repo = body.repository.full_name;
  const prNumber = body.pull_request.number;
  const headers = { Authorization: "token " + process.env.GITHUB_TOKEN, Accept: 'application/vnd.github.v3+json' };

  try {
    const filesRes = await axios.get("https://api.github.com/repos/" + repo + "/pulls/" + prNumber + "/files", { headers });
    const changedFiles = filesRes.data.map(f => f.filename);
    
    let systems = new Set();
    let securityScore = 100;
    let qualityScore = 100;

    changedFiles.forEach(f => {
      if (f.includes('auth')) systems.add('Authentication');
      if (f.includes('pay')) systems.add('Payments');
      if (f.includes('api')) systems.add('API Layer');
      if (f.includes('db') || f.includes('model')) systems.add('Database');
      if (f.includes('ui') || f.includes('src/')) systems.add('Frontend');
    });

    const affectedCount = changedFiles.length;
    let severity = 'LOW';
    if (systems.has('Payments') || systems.has('Authentication')) severity = 'CRITICAL';
    else if (affectedCount > 5) severity = 'HIGH';
    else if (affectedCount > 2) severity = 'MEDIUM';

    const healthScore = Math.round((securityScore + (affectedCount > 5 ? 70 : 100)) / 2);

    const historyRes = await axios.get("https://api.jsonbin.io/v3/b/" + JSONBIN_ID + "/latest", { headers: { "X-Master-Key": JSONBIN_KEY } });
    const records = historyRes.data.record.records || [];
    
    records.unshift({
      prNumber, repo, securityScore, qualityScore, healthScore,
      impactedFiles: changedFiles,
      impactedSystems: [...systems],
      severity,
      timestamp: new Date().toISOString()
    });

    await axios.put("https://api.jsonbin.io/v3/b/" + JSONBIN_ID, { records: records.slice(0, 50) }, { 
      headers: { "X-Master-Key": JSONBIN_KEY, "Content-Type": "application/json" } 
    });

    return res.status(200).json({ status: 'success', severity });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}`;

fs.writeFileSync('api/github.js', engineCode);
console.log('✅ ENGINE_INTELLIGENCE_UPGRADED');
