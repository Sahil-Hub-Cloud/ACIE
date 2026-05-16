import axios from 'axios';
import { parseFile } from '../src/parser/parser.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ status: 'ACIE is running!' });
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
    console.log('Fetching files for PR #' + prNumber);
    const filesRes = await axios.get('https://api.github.com/repos/' + repo + '/pulls/' + prNumber + '/files', { headers });
    const jsFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx)$/));
    console.log('JS files found:', jsFiles.length);
    if (jsFiles.length === 0) return res.status(200).json({ status: 'no js files' });
    const parsedFiles = [];
    for (const file of jsFiles) {
      try {
        const contentRes = await axios.get('https://api.github.com/repos/' + repo + '/contents/' + file.filename + '?ref=' + headSha, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        parsedFiles.push(parseFile(file.filename, content));
      } catch(e) {
        parsedFiles.push({ filePath: file.filename, exports: [], imports: [] });
      }
    }
    const changedPaths = new Set(parsedFiles.map(f => f.filePath));
    const blastRadius = new Set();
    for (const file of parsedFiles) {
      for (const imp of file.imports) {
        for (const changed of changedPaths) {
          if (changed.includes(imp.from.replace('./','').replace('../',''))) blastRadius.add(file.filePath);
        }
      }
    }
    const allFilenames = filesRes.data.map(f => f.filename);
    const missingTests = [];
    for (const file of parsedFiles) {
      if (!file.filePath.match(/\.(test|spec)\.(js|ts|jsx|tsx)$/)) {
        const base = file.filePath.replace(/\.(js|ts|jsx|tsx)$/, '');
        if (!allFilenames.some(f => f.match(new RegExp(base + '\\.(test|spec)')))) {
          missingTests.push(file.filePath);
        }
      }
    }
    const affectedCount = blastRadius.size;
    let risk = 'LOW';
    if (affectedCount >= 3) risk = 'HIGH';
    else if (affectedCount >= 1) risk = 'MEDIUM';
    if (missingTests.length > 0 && risk === 'LOW') risk = 'MEDIUM';
    let comment = '## ' + (affectedCount === 0 ? 'OK' : 'ACIE') + ' ACIE - Change Impact Report\n\n### Files Changed\n';
    parsedFiles.forEach(f => { comment += '- ' + f.filePath + ' (' + f.exports.length + ' exports, ' + f.imports.length + ' imports)\n'; });
    comment += '\n### Blast Radius\n';
    if (blastRadius.size === 0) comment += 'No other files affected.\n';
    else blastRadius.forEach(f => { comment += '- ' + f + '\n'; });
    comment += '\n### Risk Score: ' + risk + '\n';
    if (affectedCount > 0) comment += '- ' + affectedCount + ' files affected\n';
    missingTests.forEach(f => { comment += '- WARNING: ' + f + ' has no test coverage\n'; });
    comment += '\n### Recommendation\n';
    if (risk === 'HIGH') comment += 'High risk - review carefully.\n';
    else if (risk === 'MEDIUM') comment += 'Medium risk - review before merging.\n';
    else comment += 'Low risk - safe to merge.\n';
    comment += '\nPowered by ACIE - AI Change Impact Engine';
    console.log('Posting comment...');
    await axios.post('https://api.github.com/repos/' + repo + '/issues/' + prNumber + '/comments', { body: comment }, { headers });
    console.log('Comment posted!');
    return res.status(200).json({ status: 'ok' });
  } catch(err) {
    console.error('ACIE error:', err.message);
    return res.status(200).json({ status: 'error' });
  }
}