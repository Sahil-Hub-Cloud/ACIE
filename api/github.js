import axios from 'axios';
import { parseFile } from '../src/parser/parser.js';

export default async function handler(req, res) {
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

    // Build a professional Markdown Table
    let tableRows = "| File | Type | Exports | Status |\n| :--- | :--- | :--- | :--- |\n";
    
    for (const file of supportedFiles) {
      const ext = file.filename.split('.').pop().toUpperCase();
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        
        try {
          const parsed = parseFile(file.filename, content);
          tableRows += "| `" + file.filename + "` | " + ext + " | " + parsed.exports.length + " | ✅ Analyzed |\n";
        } catch (e) {
          tableRows += "| `" + file.filename + "` | " + ext + " | - | ⚠️ Parsing Error |\n";
        }
      } catch (e) {
        tableRows += "| `" + file.filename + "` | " + ext + " | - | ❌ Download Failed |\n";
      }
    }

    const comment = "## ⚡ ACIE — Change Impact Report\n\n" +
                    "> Automated codebase analysis for **" + repo + "**\n\n" +
                    "### 📊 Analysis Summary\n" + tableRows + 
                    "\n\n**Recommendation:** review the exports above for unexpected breaking changes.\n" +
                    "--- \n" +
                    "*Powered by [ACIE Dashboard](https://acie-gamma.vercel.app/dashboard)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(200).json({ status: 'error_logged' });
  }
}