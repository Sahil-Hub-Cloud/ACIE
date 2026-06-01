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

    let tableRows = "| File | Type | Logic | Maintainability |\n| :--- | :--- | :--- | :--- |\n";
    let globalRiskPoints = 0;
    let antiPatternsFound = 0;

    for (const file of supportedFiles) {
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        
        // Logic: Scan for deep nesting (lines starting with 16+ spaces or 4+ tabs)
        const lines = content.split('\n');
        const deepLines = lines.filter(line => line.startsWith('                ') || line.startsWith('\t\t\t\t')).length;
        
        const hasAntiPattern = deepLines > 0;
        if (hasAntiPattern) {
            globalRiskPoints += 15;
            antiPatternsFound++;
        }

        const ext = file.filename.split('.').pop().toUpperCase();
        const status = hasAntiPattern ? "🟠 Deep Nesting" : "✅ Modular";

        tableRows += "| `" + file.filename + "` | " + ext + " | " + (hasAntiPattern ? "Complex" : "Clean") + " | " + status + " |\n";
      } catch (e) { }
    }

    let verdict = globalRiskPoints >= 50 ? "❌ **DO NOT MERGE**" : (globalRiskPoints >= 20 ? "⚠️ **PROCEED WITH CAUTION**" : "✅ **SAFE TO MERGE**");
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const comment = "# ⚡ ACIE Verdict: " + verdict + "\n" +
                    "### 🧠 Anti-Pattern Report\n" + 
                    (antiPatternsFound > 0 ? "- ⚠️ **Complexity Alert:** Found deeply nested logic blocks. Consider flattening the code using guard clauses." : "- ✅ **Logic Flow:** No significant deep nesting detected. Code is readable.") + "\n\n" +
                    "### 📊 Detailed Audit Log\n" + tableRows + "\n" +
                    "**Performance:** Anti-Pattern Scanner finished in " + duration + "s 🚀\n" +
                    "--- \n" +
                    "*Powered by [ACIE](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(200).json({ status: 'error_logged' });
  }
}