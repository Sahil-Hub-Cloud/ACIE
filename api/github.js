import axios from 'axios';

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

    let tableRows = "| File | Score | Style | Complexity |\n| :--- | :--- | :--- | :--- |\n";
    let totalDeductions = 0;
    let styleWarnings = 0;

    for (const file of supportedFiles) {
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        
        let fileScore = 100;
        
        // Style Check
        const isJS = file.filename.match(/\.[jt]sx?$/);
        const hasSnakeCase = /[a-z]+_[a-z]+/.test(content);
        let styleStatus = "✅ Uniform";
        if (isJS && hasSnakeCase) {
            styleStatus = "⚠️ Mixed";
            fileScore -= 10;
            styleWarnings++;
        }

        // Complexity Check (Cyclomatic)
        const conditions = (content.match(/if|else|for|while|&&|\|\|/g) || []).length;
        let complexityStatus = conditions > 20 ? "🔴 High" : (conditions > 10 ? "🟡 Medium" : "🟢 Low");
        if (conditions > 20) { fileScore -= 15; }

        // Security / Best Practice Check
        if (content.includes('password') || content.includes('api_key')) fileScore -= 50;
        if (content.includes('                ')) fileScore -= 10;

        totalDeductions += (100 - fileScore);
        const color = fileScore > 80 ? "🟢" : (fileScore > 50 ? "🟡" : "🔴");
        tableRows += "| `" + file.filename + "` | " + color + " " + Math.max(0, fileScore) + "% | " + styleStatus + " | " + complexityStatus + " (" + conditions + ") |\n";
      } catch (e) { }
    }

    const finalHealth = Math.max(0, 100 - (totalDeductions / supportedFiles.length));
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const comment = "# ⚡ ACIE Health Score: " + Math.round(finalHealth) + "%\n" +
                    "### 🧠 Style & Complexity Audit\n" + 
                    (styleWarnings > 0 ? "- ⚠️ **Convention Warning:** Detected mixed naming styles (Snake Case in JS). Consider sticking to camelCase.\n" : "- ✅ **Style Consistent:** Naming conventions look correct for this language stack.\n") +
                    "- 🔍 **Complexity:** Measured decision points (if/else/loops) per file.\n\n" +
                    "### 📁 Analysis Detail\n" + tableRows + "\n" +
                    "**Performance:** Deep Scan finished in " + duration + "s 🚀\n" +
                    "--- \n" +
                    "*Powered by [ACIE Intelligence](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(200).json({ status: 'error' });
  }
}