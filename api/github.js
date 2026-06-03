import axios from 'axios';
import { parseFile } from '../src/parser/parser.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ status: 'ACIE is running' });
  const event = req.headers['x-github-event'];
  const action = req.body?.action;
  if (event !== 'pull_request' || !['opened','synchronize','reopened'].includes(action)) {
    return res.status(200).json({ status: 'ignored' });
  }
  const repo = req.body.repository.full_name;
  const prNumber = req.body.pull_request.number;
  const headSha = req.body.pull_request.head.sha;
  const token = process.env.GITHUB_TOKEN;
  const headers = { Authorization: 'token ' + token, Accept: 'application/vnd.github.v3+json' };
  try {
    const filesRes = await axios.get('https://api.github.com/repos/' + repo + '/pulls/' + prNumber + '/files', { headers });
    const jsFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx)$/));
    if (jsFiles.length === 0) return res.status(200).json({ status: 'no js files' });
    const parsedFiles = [];
    const fileScores = [];
    for (const file of jsFiles) {
      try {
        const contentRes = await axios.get('https://api.github.com/repos/' + repo + '/contents/' + file.filename + '?ref=' + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(file.filename, content);
        parsedFiles.push(parsed);
        let score = 100;
        const issues = [];
        if (/password|api_key|secret/i.test(content)) { score -= 50; issues.push('hardcoded secret'); }
        const deepLines = content.split('\n').filter(l => l.match(/^\s{8,}/)).length;
        if (deepLines > 3) { score -= 10; issues.push('deep nesting'); }
        const decisions = (content.match(/if|else|for|while/g) || []).length;
        if (decisions > 20) { score -= 15; issues.push('high complexity'); }
        score = Math.max(0, score);
        fileScores.push({ path: file.filename, score, issues, exports: parsed.exports.length, imports: parsed.imports.length });
      } catch(e) {
        fileScores.push({ path: file.filename, score: 100, issues: [], exports: 0, imports: 0 });
      }
    }
    const changedPaths = new Set(parsedFiles.map(f => f.filePath));
    const repoFilesRes = await axios.get('https://api.github.com/repos/' + repo + '/git/trees/' + headSha + '?recursive=1', { headers });
    const allRepoFiles = repoFilesRes.data.tree.filter(f => f.type === 'blob' && f.path.match(/\.(js|ts|jsx|tsx)$/)).map(f => f.path);
    const blastRadius = new Set();
    for (const repoFilePath of allRepoFiles) {
      if (changedPaths.has(repoFilePath)) continue;
      try {
        const contentRes = await axios.get('https://api.github.com/repos/' + repo + '/contents/' + repoFilePath + '?ref=' + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        const parsed = parseFile(repoFilePath, content);
        for (const imp of parsed.imports) {
          for (const changed of changedPaths) {
            const impClean = imp.from.replace(/^\.\.\//, '').replace(/^\.\//, '').replace(/\.(js|ts|jsx|tsx)$/, '');
            const changedClean = changed.replace(/\.(js|ts|jsx|tsx)$/, '');
            if (changedClean.endsWith(impClean) || changedClean.includes('/' + impClean) || impClean === changedClean.split('/').pop()) {
              blastRadius.add(repoFilePath);
            }
          }
        }
      } catch(e) {}
    }
    const allFilenames = filesRes.data.map(f => f.filename);
    const missingTests = [];
    for (const file of parsedFiles) {
      if (!file.filePath.match(/\.(test|spec)\.(js|ts|jsx|tsx)$/)) {
        const base = file.filePath.replace(/\.(js|ts|jsx|tsx)$/, '');
        const hasTest = allFilenames.some(f => f.includes(base + '.test') || f.includes(base + '.spec'));
        if (!hasTest) missingTests.push(file.filePath);
      }
    }
    const affectedCount = blastRadius.size;
    let risk = 'LOW';
    if (affectedCount >= 3) risk = 'HIGH';
    else if (affectedCount >= 1) risk = 'MEDIUM';
    if (missingTests.length > 0 && risk === 'LOW') risk = 'MEDIUM';
    const avgScore = Math.round(fileScores.reduce((a, b) => a + b.score, 0) / fileScores.length);
    let comment = '## ACIE - Change Impact Report\n\n';
    comment += '### Health Score: ' + avgScore + '%\n\n';
    comment += '| Metric | Value |\n|--------|-------|\n';
    comment += '| Risk Level | ' + risk + ' |\n';
    comment += '| Files Analyzed | ' + fileScores.length + ' |\n';
    comment += '| Blast Radius | ' + affectedCount + ' file(s) |\n\n';
    comment += '### File Analysis\n\n';
    comment += '| File | Health | Exports | Imports | Issues |\n';
    comment += '|------|--------|---------|---------|--------|\n';
    fileScores.forEach(f => {
      comment += '| ' + f.path + ' | ' + f.score + '% | ' + f.exports + ' | ' + f.imports + ' | ' + (f.issues.length ? f.issues.join(', ') : 'none') + ' |\n';
    });
    comment += '\n### Blast Radius\n';
    if (blastRadius.size === 0) comment += 'No other files affected.\n';
    else blastRadius.forEach(f => { comment += '- ' + f + '\n'; });
    if (missingTests.length > 0) {
      comment += '\n### Missing Tests\n';
      missingTests.forEach(f => { comment += '- ' + f + '\n'; });
    }
    comment += '\n### Recommendation\n';
    if (risk === 'HIGH') comment += 'High risk - review carefully before merging.\n';
    else if (risk === 'MEDIUM') comment += 'Medium risk - review before merging.\n';
    else comment += 'Low risk - safe to merge.\n';
    comment += '\nPowered by ACIE - https://acie-gamma.vercel.app';
    await axios.post('https://api.github.com/repos/' + repo + '/issues/' + prNumber + '/comments', { body: comment }, { headers });    // Auto-Labeling Logic
    const labels = [];
    if (risk === 'HIGH') labels.push('high-risk');
    else if (risk === 'LOW' && missingTests.length === 0) labels.push('ready-to-merge');
    if (missingTests.length > 0) labels.push('missing-tests');
    if (fileScores.some(f => f.issues.includes('hardcoded secret'))) labels.push('security-risk');
    
    if (labels.length > 0) {
      try {
        await axios.post('https://api.github.com/repos/' + repo + '/issues/' + prNumber + '/labels', { labels: labels }, { headers });
      } catch(e) { console.error('Label error:', e.message); }
    }

    try {
      const slack = process.env.SLACK_WEBHOOK_URL;
      if (slack) await axios.post(slack, { text: 'ACIE Alert - PR #' + prNumber + ' in ' + repo + ' | Health: ' + avgScore + '% | Risk: ' + risk });
    } catch(e) {}
    return res.status(200).json({ status: 'success', risk, avgScore });
  } catch(err) {
    console.error('ACIE Error:', err.message);
    return res.status(500).json({ status: 'error' });
  }
}