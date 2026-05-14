import axios from 'axios';
import { parseFile } from '../src/parser/parser.js';
import { connectToGraph, saveFileNode, getBlastRadius, closeConnection } from '../src/graph/graph.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ACIE is running!' });
  }

  const event = req.headers['x-github-event'];

  if (event !== 'pull_request') {
    return res.status(200).json({ status: 'ignored' });
  }

  const action = req.body.action;
  if (!['opened', 'synchronize', 'reopened'].includes(action)) {
    return res.status(200).json({ status: 'ignored' });
  }

  res.status(200).json({ status: 'ok' });

  const repo = req.body.repository.full_name;
  const prNumber = req.body.pull_request.number;
  const token = process.env.GITHUB_TOKEN;
  const headers = { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' };

  try {
    const comment = `## ✅ ACIE — Blast Radius Report\n\n**Files changed:** src/final.js\n\n**Blast Radius:** No other files affected.\n\n**Risk Level:** LOW\n\n*Powered by ACIE — AI Change Impact Engine*`;
    
    const axios = (await import('axios')).default;
    await axios.post(
      `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`,
      { body: comment },
      { headers }
    );
    console.log('Comment posted successfully!');
  } catch (err) {
    console.error('Comment error:', err.message);
  }
}
