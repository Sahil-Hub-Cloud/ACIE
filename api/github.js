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

    let tableRows = "| File | Lines | Security | Risk |\n| :--- | :--- | :--- | :--- |\n";
    let securityAlerts = [];
    
    for (const file of changedFiles) {
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(file.filename, content);
        
        // Logic: Search for hardcoded secrets or sensitive keywords
        const hasSecret = /password|secret|api_key|token|auth_key/i.test(content);
        const securityStatus = hasSecret ? "🚨 **Warning**" : "✅ Clean";
        if (hasSecret) securityAlerts.push(file.filename);

        const loc = content.split('\n').length;
        const complexity = parsed.exports.length > 8 || loc > 300 || hasSecret ? "🔴 High" : "🟢 Low";

        tableRows += "| `" + file.filename + "` | " + loc + " | " + securityStatus + " | " + complexity + " |\n";
      } catch (e) {
        tableRows += "| `" + file.filename + "` | - | - | ⚠️ Skipped |\n";
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    let securityAdvice = securityAlerts.length > 0 
      ? "> 🚨 **Security Alert:** Possible hardcoded secrets or keys found in `" + securityAlerts[0] + "`. Please review immediately!" 
      : "> 🛡️ **Security Scan:** No common secrets or tokens detected in changed lines.";

    const comment = "## ⚡ ACIE — Change Impact Report\n\n" +
                    "### 📊 Automated Audit Summary\n" + tableRows + "\n" +
                    securityAdvice + "\n\n" +
                    "**Performance:** Audit completed in " + duration + "s 🚀\n" +
                    "--- \n" +
                    "*Powered by [ACIE](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(200).json({ status: 'error_logged' });
  }
}