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

    let tableRows = "| File | Type | Quality | Risk |\n| :--- | :--- | :--- | :--- |\n";
    let untestedFiles = [];
    
    // Logic: Look for test files in the PR
    const hasTestFile = filesRes.data.some(f => f.filename.includes('test') || f.filename.includes('spec'));

    for (const file of changedFiles) {
      const isTest = file.filename.includes('test') || file.filename.includes('spec');
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(file.filename, content);
        
        // Quality check: Is this file missing a corresponding test?
        const qualityStatus = (isTest || hasTestFile) ? "✅ Tested" : "⚠️ Untested";
        if (!isTest && !hasTestFile) untestedFiles.push(file.filename);

        const ext = file.filename.split('.').pop().toUpperCase();
        const complexity = parsed.exports.length > 8 ? "🔴 High" : "🟢 Low";

        tableRows += "| `" + file.filename + "` | " + ext + " | " + qualityStatus + " | " + complexity + " |\n";
      } catch (e) {
        tableRows += "| `" + file.filename + "` | - | - | ⚠️ Skipped |\n";
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    let qualityAdvice = untestedFiles.length > 0 
      ? "> 🧪 **Quality Gap:** No test files detected in this PR. Consider adding unit tests for your changes." 
      : "> ✨ **Quality Check:** Tests detected. Great job maintaining coverage!";

    const comment = "## ⚡ ACIE — Change Impact Report\n\n" +
                    "### 📊 Intelligence Audit\n" + tableRows + "\n" +
                    qualityAdvice + "\n\n" +
                    "**Performance:** AI Audit finished in " + duration + "s 🚀\n" +
                    "--- \n" +
                    "*Powered by [ACIE](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(200).json({ status: 'error_logged' });
  }
}