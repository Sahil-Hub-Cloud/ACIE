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
    const supportedFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx|py|go|json|txt|mod)$/));

    if (supportedFiles.length === 0) return res.status(200).json({ status: 'no supported files' });

    let tableRows = "| File | Type | Status | Risk |\n| :--- | :--- | :--- | :--- |\n";
    let globalRiskPoints = 0;
    let criticalChanges = [];
    const criticalPatterns = [/package\.json$/, /requirements\.txt$/, /go\.mod$/, /App\.[jt]sx?$/, /main\.go$/, /index\.[jt]s$/];

    for (const file of supportedFiles) {
      const isCritical = criticalPatterns.some(pattern => pattern.test(file.filename));
      if (isCritical) {
        globalRiskPoints += 40;
        criticalChanges.push(file.filename);
      }

      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(file.filename, content);
        const hasSecret = /password|secret|api_key/i.test(content);
        if (hasSecret) globalRiskPoints += 50;
        
        const ext = file.filename.split('.').pop().toUpperCase();
        const riskLevel = isCritical || hasSecret ? "🔴 High" : "🟢 Low";
        tableRows += "| `" + file.filename + "` | " + ext + " | " + (isCritical ? "❤️ **Heart**" : "📄 File") + " | " + riskLevel + " |\n";
      } catch (e) { }
    }

    let verdict = globalRiskPoints >= 50 ? "❌ **DO NOT MERGE**" : (globalRiskPoints >= 20 ? "⚠️ **PROCEED WITH CAUTION**" : "✅ **SAFE TO MERGE**");
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const comment = "# ⚡ ACIE Verdict: " + verdict + "\n" +
                    "### 🧠 Intelligence Summary\n" + 
                    (criticalChanges.length > 0 ? "- ⚠️ **Critical Change:** Modification to project core: `" + criticalChanges[0] + "`\n" : "- ✅ **Safe Scope:** No core infrastructure files modified.\n") +
                    "- **Recommendation:** " + (globalRiskPoints >= 50 ? "Seek senior approval before merging." : "Standard review process applies.") + "\n\n" +
                    "### 📊 Detailed Audit Log\n" + tableRows + "\n" +
                    "**Performance:** Deep Scan + Heart Check in " + duration + "s 🚀\n" +
                    "--- \n" +
                    "*Powered by [ACIE](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(200).json({ status: 'error_logged' });
  }
}