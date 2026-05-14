import crypto from 'crypto';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ACIE is running!' });
  }

  const signature = req.headers['x-hub-signature-256'];
  const event = req.headers['x-github-event'];
  const body = JSON.stringify(req.body);

  console.log(`Webhook received: ${event}`);

  if (event === 'pull_request') {
    const action = req.body.action;
    const prTitle = req.body.pull_request.title;
    const prNumber = req.body.pull_request.number;
    const repo = req.body.repository.full_name;
    console.log(`PR #${prNumber} ${action}: "${prTitle}" in ${repo}`);
  }

  return res.status(200).json({ status: 'ok' });
}
