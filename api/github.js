import axios from 'axios';
import crypto from 'node:crypto';
import { parseFile } from '../src/parser/parser.js';
import { supabaseAdmin } from '../src/db/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ status: 'ACIE_ONLINE' });
  const body = req.body;
  
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  if (webhookSecret) {
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = 'sha256=' + hmac.update(JSON.stringify(body)).digest('hex');
    if (req.headers['x-hub-signature-256'] !== digest) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  if (!body.pull_request) return res.status(200).json({ status: 'ignored' });
  if (!process.env.GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN environment variable is not configured');
    return res.status(500).json({ error: 'GitHub integration is not configured' });
  }

  const installationId = body.installation?.id;
  const githubRepoId = body.repository?.id;

  if (!installationId || !githubRepoId) {
    return res.status(200).json({ status: 'ignored, missing installation info' });
  }

  const { data: repository } = await supabaseAdmin
    .from('repositories')
    .select('id, workspace_id')
    .eq('installation_id', installationId)
    .eq('github_repo_id', githubRepoId)
    .single();

  if (!repository) {
    return res.status(200).json({ status: 'unregistered installation' });
  }

  const repo = body.repository.full_name;
  const prNumber = body.pull_request.number;
  const headSha = body.pull_request.head.sha;
  const baseSha = body.pull_request.base.sha;
  const headers = { Authorization: "token " + process.env.GITHUB_TOKEN, Accept: 'application/vnd.github.v3+json' };

  try {
    const filesRes = await axios.get("https://api.github.com/repos/" + repo + "/pulls/" + prNumber + "/files", { headers, timeout: 5000 });
    const changedFiles = filesRes.data.filter(f => f.filename.match(/\.(js|ts|jsx|tsx)$/));
    
    // 1. DEP PROPAGATION
    const changedBases = changedFiles.map(f => f.filename.split('/').pop().replace(/\.[jt]sx?$/, ''));
    const treeRes = await axios.get("https://api.github.com/repos/" + repo + "/git/trees/" + headSha + "?recursive=1", { headers, timeout: 5000 });
    const allFiles = treeRes.data.tree.filter(f => f.path.match(/\.(js|ts|jsx|tsx)$/));
    
    let dependentFiles = new Set();
    let systems = new Set();

    for (const file of allFiles) {
      if (changedFiles.some(f => f.filename === file.path)) continue;
      try {
        const contentRes = await axios.get("https://api.github.com/repos/" + repo + "/contents/" + file.path + "?ref=" + headSha, { headers, timeout: 5000 });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        
        changedBases.forEach(base => {
          if (content.includes(base)) {
            dependentFiles.add(file.path);
            if (file.path.includes('auth')) systems.add('Authentication');
            if (file.path.includes('pay')) systems.add('Payments');
          }
        });
      } catch (e) { /* skip */ }
    }

    // 2. ROOT CAUSE HEURISTICS
    let rootCause = "None Detected";
    let suggestedFix = "Standard review.";
    let confidence = "LOW";

    for (const file of changedFiles) {
      try {
        const baseRes = await axios.get(`https://api.github.com/repos/${repo}/contents/${file.filename}?ref=${baseSha}`, { headers, timeout: 5000 });
        const headRes = await axios.get(`https://api.github.com/repos/${repo}/contents/${file.filename}?ref=${headSha}`, { headers, timeout: 5000 });
        
        const baseContent = Buffer.from(baseRes.data.content, 'base64').toString('utf-8');
        const headContent = Buffer.from(headRes.data.content, 'base64').toString('utf-8');
        
        const baseParsed = parseFile(file.filename, baseContent);
        const headParsed = parseFile(file.filename, headContent);

        // Pattern 1: Missing Exports
        const missingExports = baseParsed.exports.filter(x => !headParsed.exports.includes(x));
        if (missingExports.length > 0) {
          rootCause = "Removed Export: " + missingExports[0];
          suggestedFix = "Restore export in " + file.filename + " or update all downstream imports.";
          confidence = "HIGH";
        }

        // Pattern 2: Renamed Functions (Heuristic)
        if (baseContent.includes('function') && !headContent.includes(missingExports[0]) && headParsed.exports.length === baseParsed.exports.length) {
          rootCause = "Renamed Export: " + missingExports[0];
          suggestedFix = "Update call-sites to use the new function name.";
          confidence = "MEDIUM";
        }

        // Pattern 3: Env Var Leak/Mismatch
        if (headContent.includes('process.env') && !baseContent.includes('process.env')) {
          rootCause = "New Environment Variable Dependency";
          suggestedFix = "Ensure the new variable is added to the production environment.";
          confidence = "HIGH";
        }
      } catch (e) { /* skip */ }
    }

    // 3. PERSIST TO SUPABASE
    const depCount = dependentFiles.size;
    const depRisk = depCount > 5 ? 'HIGH' : 'LOW';
    const severity = (confidence === 'HIGH' || depCount > 5) ? 'CRITICAL' : 'LOW';
    const risk = severity === 'CRITICAL' ? 'HIGH' : severity; // Map to LOW/MEDIUM/HIGH
    
    await supabaseAdmin.from('telemetry').insert({
      repository_id: repository.id,
      pr_number: prNumber,
      pr_title: body.pull_request.title,
      pr_author: body.pull_request.user.login,
      pr_url: body.pull_request.html_url,
      risk: risk,
      affected_count: depCount,
      blast_radius: {
        impactedSystems: [...systems],
        impactedFiles: changedFiles.map(f => f.filename),
        dependentFiles: [...dependentFiles].slice(0, 5)
      },
      files_changed: changedFiles.length,
      health_score: confidence === "HIGH" ? 40 : Math.round(100 - (depCount * 2)),
      security_score: 98,
      root_cause: rootCause,
      suggested_fix: suggestedFix
    });

    return res.status(200).json({ status: 'success' });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
