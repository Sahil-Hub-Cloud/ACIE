import fs from 'fs';
const KEY = '$2a$10$OLH.A4d17J6/.mDf9XtqwuT0jtdNQpLP74RT1aDXXnEUFB6ry0Q/u';
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
    const parsedFiles = [];

    for (const file of jsFiles) {
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + body.pull_request.head.sha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        
        if (/password|secret|api_key|token/i.test(content)) { securityScore -= 20; issues++; }
        if (content.includes('                ')) { qualityScore -= 5; }
        
        parsedFiles.push(parseFile(file.filename, content));
      } catch (e) {
        parsedFiles.push({ filePath: file.filename, exports: [], imports: [] });
      }
    }

    const changedPaths = new Set(parsedFiles.map(f => f.filePath));
    const blastRadius = new Set();

    if (jsFiles.length > 0) {
      const repoFilesRes = await axios.get("https://api.github.com/repos/" + repo + "/git/trees/" + body.pull_request.head.sha + "?recursive=1", { headers });
      const allRepoFiles = repoFilesRes.data.tree
        .filter(f => f.type === 'blob' && f.path.match(/\\.(js|ts|jsx|tsx)$/))
        .map(f => f.path);

      for (const repoFilePath of allRepoFiles) {
        if (changedPaths.has(repoFilePath)) continue;
        try {
          const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + repoFilePath + "?ref=" + body.pull_request.head.sha, { headers });
          const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
          const parsed = parseFile(repoFilePath, content);
          for (const imp of parsed.imports) {
            for (const changed of changedPaths) {
              const impClean = imp.from.replace(/^\\.\\.\\//, '').replace(/^\\.\\//, '').replace(/\\.(js|ts|jsx|tsx)$/, '');
              const changedClean = changed.replace(/\\.(js|ts|jsx|tsx)$/, '');
              if (changedClean.endsWith(impClean) || changedClean.includes('/' + impClean) || impClean === changedClean.split('/').pop()) {
                blastRadius.add(repoFilePath);
              }
            }
          }
        } catch (e) {}
      }
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
      blastRadius: [...blastRadius],
      timestamp: new Date().toISOString()
    });

    await axios.put("https://api.jsonbin.io/v3/b/" + JSONBIN_ID, { records: records.slice(0, 50) }, { headers: { "X-Master-Key": JSONBIN_KEY, "Content-Type": "application/json" } });

    return res.status(200).json({ status: 'success', healthScore, blastRadius: [...blastRadius] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}`;

fs.writeFileSync('api/github.js', code);
console.log('Engine Updated');
