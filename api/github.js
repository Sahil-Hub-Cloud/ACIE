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
  const prTitle = body.pull_request.title || "";
  const headSha = body.pull_request.head.sha;
  const token = process.env.GITHUB_TOKEN;
  const headers = { Authorization: "token " + token, Accept: 'application/vnd.github.v3+json' };

  try {
    const filesRes = await axios.get("https://api.github.com/repos/" + repo + "/pulls/" + prNumber + "/files", { headers });
    
    // NEW: Calculate Total Change Size
    let totalAdditions = 0;
    let totalDeletions = 0;
    filesRes.data.forEach(f => {
       totalAdditions += f.additions;
       totalDeletions += f.deletions;
    });
    const totalChanges = totalAdditions + totalDeletions;

    const supportedFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx|py|go)$/));
    if (supportedFiles.length === 0) return res.status(200).json({ status: 'no supported files' });

    let tableRows = "| File | Lines | Debt | Quality |\n| :--- | :--- | :--- | :--- |\n";
    let globalRiskPoints = 0;
    let findings = [];
    const hasTestFile = filesRes.data.some(f => f.filename.match(/test|spec/));

    for (const file of supportedFiles) {
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(file.filename, content);
        const loc = content.split('\n').length;
        const hasSecret = /password|secret|api_key|token|auth_key/i.test(content);
        const debtCount = (content.match(/TODO|FIXME/g) || []).length;
        
        if (hasSecret) { globalRiskPoints += 50; findings.push("🚨 **Critical:** Hardcoded secret found."); }
        if (loc > 300) globalRiskPoints += 5;

        tableRows += "| `" + file.filename + "` | " + loc + " | " + (debtCount > 0 ? "⚠️" : "✅") + " | " + (hasTestFile ? "✅" : "❌") + " |\n";
      } catch (e) { }
    }

    // Determine Review Effort
    let effort = "☕ Quick Review";
    if (totalChanges > 500) { effort = "🍱 Deep Focus Required"; globalRiskPoints += 20; }
    else if (totalChanges > 100) { effort = "🧘 Standard Review"; globalRiskPoints += 5; }

    let verdict = globalRiskPoints >= 50 ? "❌ **DO NOT MERGE**" : (globalRiskPoints >= 20 ? "⚠️ **PROCEED WITH CAUTION**" : "✅ **SAFE TO MERGE**");
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const comment = "# ⚡ ACIE Verdict: " + verdict + "\n" +
                    "### 🧠 Executive Insights\n" + 
                    "- **Review Effort:** " + effort + " (" + totalChanges + " lines changed)\n" +
                    "- **Key Finding:** " + (findings.length > 0 ? findings[0] : "Code structure is clean.") + "\n\n" +
                    "### 📊 Detailed Audit Log\n" + tableRows + "\n" +
                    "**Performance:** Intelligence Audit in " + duration + "s 🚀\n" +
                    "--- \n" +
                    "*Powered by [ACIE](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(200).json({ status: 'error_logged' });
  }
}