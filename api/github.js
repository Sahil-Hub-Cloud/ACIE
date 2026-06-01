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
    const supportedFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx|py|go)$/));

    if (supportedFiles.length === 0) return res.status(200).json({ status: 'no supported files' });

    let tableRows = "| File | Lines | Logic | Score |\n| :--- | :--- | :--- | :--- |\n";
    let totalDeductions = 0;
    const hasTestFile = filesRes.data.some(f => f.filename.match(/test|spec/));

    for (const file of supportedFiles) {
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        
        let fileScore = 100;
        const loc = content.split('\n').length;
        const hasSecret = /password|secret|api_key/i.test(content);
        const hasNesting = content.includes('                ');
        
        if (hasSecret) { fileScore -= 50; totalDeductions += 50; }
        if (!hasTestFile) { fileScore -= 20; totalDeductions += 20; }
        if (hasNesting) { fileScore -= 10; totalDeductions += 10; }
        if (loc > 300) { fileScore -= 10; totalDeductions += 10; }

        const color = fileScore > 80 ? "🟢" : (fileScore > 50 ? "🟡" : "🔴");
        tableRows += "| `" + file.filename + "` | " + loc + " | " + (hasNesting ? "Complex" : "Simple") + " | " + color + " " + Math.max(0, fileScore) + "% |\n";
      } catch (e) { }
    }

    const finalHealth = Math.max(0, 100 - (totalDeductions / supportedFiles.length));
    let verdict = finalHealth > 80 ? "✅ **EXCELLENT**" : (finalHealth > 60 ? "⚠️ **STABLE**" : "❌ **CRITICAL**");
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const comment = "# ⚡ ACIE Health Score: " + Math.round(finalHealth) + "%\n" +
                    "### 📊 Verdict: " + verdict + "\n\n" +
                    "### 📁 File-by-File Analysis\n" + tableRows + "\n" +
                    "**Performance:** Health Scan finished in " + duration + "s 🚀\n" +
                    "--- \n" +
                    "*Powered by [ACIE Intelligence](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });
    return res.status(200).json({ status: 'success', health: finalHealth });
  } catch (err) {
    return res.status(200).json({ status: 'error' });
  }
}