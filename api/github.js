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
  const prTitle = body.pull_request.title || ""; // Get the PR Title
  const headSha = body.pull_request.head.sha;
  const token = process.env.GITHUB_TOKEN;
  const headers = { Authorization: "token " + token, Accept: 'application/vnd.github.v3+json' };

  try {
    const filesRes = await axios.get("https://api.github.com/repos/" + repo + "/pulls/" + prNumber + "/files", { headers });
    const supportedFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx|py|go)$/));

    if (supportedFiles.length === 0) return res.status(200).json({ status: 'no supported files' });

    let tableRows = "| File | Lines | Security | Quality |\n| :--- | :--- | :--- | :--- |\n";
    let globalRiskPoints = 0;
    const hasTestFile = filesRes.data.some(f => f.filename.match(/test|spec/));

    for (const file of supportedFiles) {
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.filename + "?ref=" + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(file.filename, content);
        
        const loc = content.split('\n').length;
        const hasSecret = /password|secret|api_key|token|auth_key/i.test(content);
        const isTest = file.filename.match(/test|spec/);
        
        if (hasSecret) globalRiskPoints += 50;
        if (loc > 300) globalRiskPoints += 10;
        if (!hasTestFile && !isTest) globalRiskPoints += 20;

        tableRows += "| `" + file.filename + "` | " + loc + " | " + (hasSecret ? "🚨" : "✅") + " | " + (hasTestFile || isTest ? "✅" : "❌") + " |\n";
      } catch (e) { }
    }

    // NEW: Context Analysis
    const isWIP = /wip|draft|experimental/i.test(prTitle);
    const isUrgent = /urgent|hotfix|fix!|emergency/i.test(prTitle);
    
    // If it's a WIP, we lower the risk points (it's not ready yet)
    if (isWIP) globalRiskPoints = Math.max(0, globalRiskPoints - 30);
    // If it's Urgent, we add a priority flag
    if (isUrgent) globalRiskPoints += 10;

    let verdict = globalRiskPoints >= 50 ? "❌ **DO NOT MERGE**" : (globalRiskPoints >= 20 ? "⚠️ **PROCEED WITH CAUTION**" : "✅ **SAFE TO MERGE**");
    let label = globalRiskPoints >= 50 ? "acie:high-risk" : (globalRiskPoints >= 20 ? "acie:caution" : "acie:safe");
    
    if (isUrgent) {
        verdict = "🚨 **URGENT: " + verdict + "**";
        label = "acie:urgent";
    }
    if (isWIP) {
        verdict = "🚧 **DRAFT: " + verdict + "**";
        label = "acie:wip";
    }

    try {
      await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/labels", { labels: [label] }, { headers });
    } catch (labelErr) { }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const comment = "# ⚡ ACIE Verdict: " + verdict + "\n" +
                    "> **Context:** Analysis for PR: *\"" + prTitle + "\"*" + (isUrgent ? " (High Priority Mode)" : "") + "\n\n" +
                    "### 📊 Detailed Audit Log\n" + tableRows + "\n" +
                    "**Performance:** Context-Aware Analysis in " + duration + "s 🚀\n" +
                    "--- \n" +
                    "*Powered by [ACIE](https://acie-gamma.vercel.app)*";

    await axios.post("https://api.github.com/repos/" + repo + "/issues/" + prNumber + "/comments", { body: comment }, { headers });

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(200).json({ status: 'error_logged' });
  }
}