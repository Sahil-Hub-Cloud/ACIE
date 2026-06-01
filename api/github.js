import axios from 'axios';
import { parseFile } from '../src/parser/parser.js';

export default async function handler(req, res) {
  const startTime = Date.now();
  if (req.method !== 'POST') return res.status(200).json({ status: 'ACIE is running' });

  const event = req.headers['x-github-event'];
  const body = req.body;

  if (event !== 'pull_request' || !['opened', 'synchronize', 'reopened'].includes(body.action)) {
    return res.status(200).json({ status: 'ignored' });
  }

  const repo = body.repository.full_name;
  const prNumber = body.pull_request.number;
  const headSha = body.pull_request.head.sha;
  const token = process.env.GITHUB_TOKEN;
  const headers = { Authorization: "token " + token, Accept: 'application/vnd.github.v3+json' };

  try {
    const filesRes = await axios.get("https://api.github.com/repos/" + repo + "/pulls/" + prNumber + "/files", { headers });
    const changedFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx|py)$/));

    if (changedFiles.length === 0) return res.status(200).json({ status: 'no supported files' });

    const changedNames = changedFiles.map(f => f.filename.split('/').pop().replace(/\.(js|ts|jsx|tsx|py)$/, ''));
    
    // 1. Get the entire repo tree to find dependencies
    const treeRes = await axios.get("https://api.github.com/repos/" + repo + "/git/trees/" + headSha + "?recursive=1", { headers });
    const allRepoFiles = treeRes.data.tree.filter(f => f.type === 'blob' && f.path.match(/\.(js|ts|jsx|tsx|py)$/));

    const impactZone = new Set();
    
    // 2. Deep Scan: Check every file in the repo
    for (const repoFile of allRepoFiles) {
      if (changedFiles.find(f => f.filename === repoFile.path)) continue; // Skip files already in the PR
      
      try {
        const fileContentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + repoFile.path + "?ref=" + headSha, { headers });
        const content = Buffer.from(fileContentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(repoFile.path, content);
        
        // Check if this repo file imports any of our changed files
        for (const imp of parsed.imports) {
           if (changedNames.some(name => imp.from.includes(name))) {
             impactZone.add(repoFile.path);
           }
        }
      } catch (e) { /* skip files that fail to download */ }
    }

    // 3. Build Report
    let impactList = impactZone.size > 0 
      ? Array.from(impactZone).map(f => "- `" + f + "`").join("\n")
      : "✅ No external files affected.";

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const riskBadge = impactZone.size > 5 ? "🔴 HIGH" : (impactZone.size > 0 ? "🟡 MEDIUM" : "🟢 LOW");

    const comment = "## ⚡ ACIE — Change Impact Report\n\n" +
                    "### 🎯 Risk Assessment: " + riskBadge + "\n" +
                    "**Impact Zone (Files that might break):**\n" + impactList + "\n\n" +
                    "--- \n" +
                    "**Performance:** Deep Scan completed in " + duration + "s 🚀\n" +
                    "*Powered by [ACIE](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(200).json({ status: 'error_logged' });
  }
}