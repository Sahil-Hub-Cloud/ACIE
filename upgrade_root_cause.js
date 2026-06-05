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
  const baseSha = body.pull_request.base.sha;
  const headers = { Authorization: "token " + process.env.GITHUB_TOKEN, Accept: 'application/vnd.github.v3+json' };

  try {
    const filesRes = await axios.get("https://api.github.com/repos/" + repo + "/pulls/" + prNumber + "/files", { headers });
    const changedFiles = filesRes.data.filter(f => f.filename.match(/\\.(js|ts|jsx|tsx)$/));
    
    let rootCause = "None Detected";
    let suggestedFix = "Standard review.";
    let confidence = "LOW";

    for (const file of changedFiles) {
      // Fetch Old Version (Base) vs New Version (Head)
      try {
        const baseRes = await axios.get(\`https://api.github.com/repos/\${repo}/contents/\${file.filename}?ref=\${baseSha}\`, { headers });
        const headRes = await axios.get(\`https://api.github.com/repos/\${repo}/contents/\${file.filename}?ref=\${headSha}\`, { headers });
        
        const baseContent = Buffer.from(baseRes.data.content, 'base64').toString('utf-8');
        const headContent = Buffer.from(headRes.data.content, 'base64').toString('utf-8');
        
        const baseParsed = parseFile(file.filename, baseContent);
        const headParsed = parseFile(file.filename, headContent);

        // Pattern 1: Missing Exports
        const missingExports = baseParsed.exports.filter(x => !headParsed.exports.includes(x));
        if (missingExports.length > 0) {
          rootCause = "Removed Export: " + missingExports[0];
          suggestedFix = "Restore export in " + file.filename + " or update all downstream imports.";
          confidence = "HIGH";
        }

        // Pattern 2: Renamed Functions (Heuristic)
        if (baseContent.includes('function') && !headContent.includes(missingExports[0]) && headParsed.exports.length === baseParsed.exports.length) {
          rootCause = "Renamed Export: " + missingExports[0];
          suggestedFix = "Update call-sites to use the new function name.";
          confidence = "MEDIUM";
        }

        // Pattern 3: Env Var Leak/Mismatch
        if (headContent.includes('process.env') && !baseContent.includes('process.env')) {
          rootCause = "New Environment Variable Dependency";
          suggestedFix = "Ensure the new variable is added to the production environment.";
          confidence = "HIGH";
        }
      } catch (e) { /* New file, skip comparison */ }
    }

    const historyRes = await axios.get("https://api.jsonbin.io/v3/b/" + JSONBIN_ID + "/latest", { headers: { "X-Master-Key": JSONBIN_KEY } });
    const records = historyRes.data.record.records || [];
    
    records.unshift({
      prNumber, repo, rootCause, suggestedFix, confidence,
      healthScore: confidence === "HIGH" ? 40 : 90,
      timestamp: new Date().toISOString()
    });

    await axios.put("https://api.jsonbin.io/v3/b/" + JSONBIN_ID, { records: records.slice(0, 50) }, { 
      headers: { "X-Master-Key": JSONBIN_KEY, "Content-Type": "application/json" } 
    });

    return res.status(200).json({ status: 'success', rootCause });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}`;

fs.writeFileSync('api/github.js', code);
console.log('✅ ROOT_CAUSE_ENGINE_UPGRADED');
