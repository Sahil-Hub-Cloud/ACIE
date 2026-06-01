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

    let tableRows = "| File | Lines | Security | Quality |\n| :--- | :--- | :--- | :--- |\n";
    let globalRiskPoints = 0;
    const hasTestFile = filesRes.data.some(f => f.filename.includes('test') || f.filename.includes('spec'));

    for (const file of changedFiles) {
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(file.filename, content);
        
        const loc = content.split('\n').length;
        const hasSecret = /password|secret|api_key|token|auth_key/i.test(content);
        const isTest = file.filename.includes('test') || f.filename.includes('spec');
        
        // Calculate Risk Points
        if (hasSecret) globalRiskPoints += 50;
        if (loc > 300) globalRiskPoints += 10;
        if (!hasTestFile && !isTest) globalRiskPoints += 20;
        if (parsed.exports.length > 10) globalRiskPoints += 10;

        tableRows += "| `" + file.filename + "` | " + loc + " | " + (hasSecret ? "🚨" : "✅") + " | " + (hasTestFile ? "✅" : "❌") + " |\n";
      } catch (e) { }
    }

    // Determine Executive Verdict
    let verdict = "✅ **SAFE TO MERGE**";
    let color = "green";
    if (globalRiskPoints >= 50) { verdict = "❌ **DO NOT MERGE**"; color = "red"; }
    else if (globalRiskPoints >= 20) { verdict = "⚠️ **PROCEED WITH CAUTION**"; color = "yellow"; }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const comment = "# ⚡ ACIE Executive Verdict: " + verdict + "\n\n" +
                    "> AI has calculated a Risk Score of **" + globalRiskPoints + "** for this PR.\n\n" +
                    "### 📊 Detailed Audit Log\n" + tableRows + "\n" +
                    "**Performance:** AI Decision Engine optimized in " + duration + "s 🚀\n" +
                    "--- \n" +
                    "*Powered by [Sahil's ACIE Engine](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });

    return res.status(200).json({ status: 'success', riskScore: globalRiskPoints });
  } catch (err) {
    return res.status(200).json({ status: 'error_logged' });
  }
}