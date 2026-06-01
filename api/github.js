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

    let filesSummary = "";
    
    for (const file of supportedFiles) {
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        
        // The Safety Shield: try to parse, but don't crash if it fails
        try {
          const parsed = parseFile(file.filename, content);
          filesSummary += "- `" + file.filename + "` (" + parsed.exports.length + " exports found)\n";
        } catch (parseError) {
          filesSummary += "- `" + file.filename + "` (⚠️ Could not parse structure)\n";
        }
      } catch (e) {
        filesSummary += "- `" + file.filename + "` (❌ Could not download file)\n";
      }
    }

    const comment = "## ⚡ ACIE — Change Impact Report\n\n" +
                    "### 📁 Analysis Summary\n" + filesSummary + 
                    "\n\n**Status:** Safety Shield Active. The engine is now crash-resistant. 🛡️";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    // Even if the whole thing fails, we log it instead of crashing the server
    console.error("ACIE Engine Error:", err.message);
    return res.status(200).json({ status: 'error_logged' });
  }
}