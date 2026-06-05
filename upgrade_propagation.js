import fs from 'fs';
const BIN = '6a212bb4da38895dfe8514a5';
const KEY = '$2a$10$OLH.A4d17J6/.mDf9XtqwuT0jtdNQpLP74RT1aDXXnEUFB6ry0Q/u';

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
  const headSha = body.pull_request.head.sha;
  const headers = { Authorization: "token " + process.env.GITHUB_TOKEN, Accept: 'application/vnd.github.v3+json' };

  try {
    const filesRes = await axios.get("https://api.github.com/repos/" + repo + "/pulls/" + prNumber + "/files", { headers });
    const changedFiles = filesRes.data.map(f => f.filename);
    const changedBases = changedFiles.map(f => f.split('/').pop().replace(/\\.[jt]sx?$/, ''));

    // SCAN REPOSITORY FOR DEPENDENTS
    const treeRes = await axios.get("https://api.github.com/repos/" + repo + "/git/trees/" + headSha + "?recursive=1", { headers });
    const allFiles = treeRes.data.tree.filter(f => f.path.match(/\\.(js|ts|jsx|tsx)$/));
    
    let dependentFiles = new Set();
    let systems = new Set();

    for (const file of allFiles) {
      if (changedFiles.includes(file.path)) continue;
      const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.path + "?ref=" + headSha, { headers });
      const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
      
      changedBases.forEach(base => {
        if (content.includes(base)) {
          dependentFiles.add(file.path);
          if (file.path.includes('auth')) systems.add('Authentication');
          if (file.path.includes('pay')) systems.add('Payments');
        }
      });
    }

    const depCount = dependentFiles.size;
    const depRisk = depCount > 10 ? 'CRITICAL' : depCount > 5 ? 'HIGH' : depCount > 0 ? 'MEDIUM' : 'LOW';

    const historyRes = await axios.get("https://api.jsonbin.io/v3/b/" + JSONBIN_ID + "/latest", { headers: { "X-Master-Key": JSONBIN_KEY } });
    const records = historyRes.data.record.records || [];
    
    records.unshift({
      prNumber, repo, 
      healthScore: Math.round(100 - (depCount * 2)),
      impactedFiles: changedFiles,
      impactedSystems: [...systems],
      dependentFiles: [...dependentFiles].slice(0, 5),
      dependencyCount: depCount,
      dependencyRisk: depRisk,
      severity: depRisk,
      timestamp: new Date().toISOString()
    });

    await axios.put("https://api.jsonbin.io/v3/b/" + JSONBIN_ID, { records: records.slice(0, 50) }, { 
      headers: { "X-Master-Key": JSONBIN_KEY, "Content-Type": "application/json" } 
    });

    return res.status(200).json({ status: 'success', depRisk });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}`;

fs.writeFileSync('api/github.js', code);
console.log('✅ PROPAGATION_ENGINE_UPGRADED');
