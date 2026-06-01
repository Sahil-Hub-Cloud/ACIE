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
    const supportedFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx|py)$/));

    if (supportedFiles.length === 0) return res.status(200).json({ status: 'no supported files' });

    let tableRows = "| File | Type | Structure | Risk |\n| :--- | :--- | :--- | :--- |\n";
    let highComplexityFound = false;
    
    for (const file of supportedFiles) {
      const ext = file.filename.split('.').pop().toUpperCase();
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(file.filename, content);
        
        // Smart Logic: Flag files with > 8 exports/functions as High Complexity
        const complexity = parsed.exports.length > 8 ? "🔴 High" : "🟢 Low";
        if (parsed.exports.length > 8) highComplexityFound = true;

        tableRows += "| `" + file.filename + "` | " + ext + " | " + parsed.exports.length + " units | " + complexity + " |\n";
      } catch (e) {
        tableRows += "| `" + file.filename + "` | " + ext + " | - | ⚠️ Skipped |\n";
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    let recommendation = highComplexityFound 
      ? "> 💡 **Advice:** Some files have high complexity. Consider breaking them into smaller modules." 
      : "> ✅ **Advice:** Code structure looks clean and modular.";

    const comment = "## ⚡ ACIE — Change Impact Report\n\n" +
                    "### 📊 Analysis Summary\n" + tableRows + "\n" +
                    recommendation + "\n\n" +
                    "**Performance:** Analyzed in " + duration + "s 🚀\n" +
                    "--- \n" +
                    "*Powered by [ACIE](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(200).json({ status: 'error_logged' });
  }
}