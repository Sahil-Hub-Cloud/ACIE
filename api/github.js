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

    let tableRows = "| File | Score | Style | Logic |\n| :--- | :--- | :--- | :--- |\n";
    let totalDeductions = 0;
    let styleWarnings = 0;

    for (const file of supportedFiles) {
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(file.filename, content);
        
        let fileScore = 100;
        
        // Logic: Consistency Check
        const isJS = file.filename.match(/\.[jt]sx?$/);
        const hasSnakeCase = /[a-z]+_[a-z]+/.test(content);
        
        let styleStatus = "✅ Uniform";
        if (isJS && hasSnakeCase) {
            styleStatus = "⚠️ Mixed";
            fileScore -= 10;
            styleWarnings++;
        }

        if (content.includes('password') || content.includes('api_key')) fileScore -= 50;
        if (content.includes('                ')) fileScore -= 10;

        totalDeductions += (100 - fileScore);
        const color = fileScore > 80 ? "🟢" : (fileScore > 50 ? "🟡" : "🔴");
        tableRows += "| `" + file.filename + "` | " + color + " " + Math.max(0, fileScore) + "% | " + styleStatus + " | " + (parsed.exports.length > 8 ? "Complex" : "Simple") + " |\n";
      } catch (e) { }
    }

    const finalHealth = Math.max(0, 100 - (totalDeductions / supportedFiles.length));
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const comment = "# ⚡ ACIE Health Score: " + Math.round(finalHealth) + "%\n" +
                    "### 🧠 Style Audit\n" + 
                    (styleWarnings > 0 ? "- ⚠️ **Convention Warning:** Detected mixed naming styles (Snake Case in JS). Consider sticking to camelCase." : "- ✅ **Style Consistent:** Naming conventions look correct for this language stack.") + "\n\n" +
                    "### 📁 Analysis Detail\n" + tableRows + "\n" +
                    "**Performance:** Health + Style Audit in " + duration + "s 🚀\n" +
                    "--- \n" +
                    "*Powered by [ACIE Intelligence](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(200).json({ status: 'error' });
  }
}