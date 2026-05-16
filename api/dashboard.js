export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>ACIE — AI Change Impact Engine</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; min-height: 100vh; }
    .header { background: linear-gradient(135deg, #1f2937, #111827); border-bottom: 1px solid #30363d; padding: 24px 40px; display: flex; align-items: center; gap: 16px; }
    .header h1 { color: #58a6ff; font-size: 28px; font-weight: 700; }
    .header p { color: #8b949e; font-size: 14px; margin-top: 4px; }
    .badge { background: #238636; color: #fff; font-size: 12px; padding: 4px 12px; border-radius: 20px; font-weight: 600; }
    .container { max-width: 900px; margin: 40px auto; padding: 0 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; }
    .card h2 { font-size: 16px; color: #58a6ff; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .card p, .card li { color: #8b949e; font-size: 14px; line-height: 1.8; }
    .card ol { padding-left: 20px; }
    .stat { font-size: 36px; font-weight: 700; color: #c9d1d9; }
    .stat-label { color: #8b949e; font-size: 13px; margin-top: 4px; }
    .risk-low { color: #3fb950; font-weight: 600; font-size: 14px; margin: 8px 0; }
    .risk-medium { color: #d29922; font-weight: 600; font-size: 14px; margin: 8px 0; }
    .risk-high { color: #f85149; font-weight: 600; font-size: 14px; margin: 8px 0; }
    .full { grid-column: 1 / -1; }
    .footer { text-align: center; color: #484f58; font-size: 13px; margin-top: 40px; padding-bottom: 40px; }
    .footer a { color: #58a6ff; text-decoration: none; }
    .tag { display: inline-block; background: #21262d; border: 1px solid #30363d; border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #8b949e; margin: 4px 4px 0 0; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>⚡ ACIE</h1>
      <p>AI Change Impact Engine — Google Maps for your codebase</p>
    </div>
    <span class="badge">● LIVE</span>
  </div>
  <div class="container">
    <div class="grid">
      <div class="card">
        <h2>🤖 What is ACIE?</h2>
        <p>ACIE automatically analyzes every Pull Request and tells developers exactly which files will be affected by their changes — before they merge.</p>
      </div>
      <div class="card">
        <h2>📡 Status</h2>
        <div class="stat">✅</div>
        <div class="stat-label">Actively monitoring GitHub Pull Requests</div>
      </div>
    </div>
    <div class="grid">
      <div class="card">
        <h2>🔍 How it works</h2>
        <ol>
          <li>Developer opens a Pull Request</li>
          <li>ACIE scans all changed files</li>
          <li>Maps import/export relationships</li>
          <li>Calculates blast radius across the repo</li>
          <li>Posts a risk report as a PR comment</li>
        </ol>
      </div>
      <div class="card">
        <h2>🎯 Risk Levels</h2>
        <p class="risk-low">● LOW — Safe to merge</p>
        <p>No other files affected by the change.</p>
        <br/>
        <p class="risk-medium">● MEDIUM — Review before merging</p>
        <p>1-2 files affected, or missing test coverage.</p>
        <br/>
        <p class="risk-high">● HIGH — Review carefully</p>
        <p>3+ files affected by the change.</p>
      </div>
    </div>
    <div class="card full">
      <h2>🛠️ Powered by</h2>
      <span class="tag">GitHub Apps</span>
      <span class="tag">Vercel</span>
      <span class="tag">Node.js</span>
      <span class="tag">JavaScript Parser</span>
      <span class="tag">Blast Radius Detection</span>
      <span class="tag">Risk Scoring</span>
    </div>
  </div>
  <div class="footer">
    <p>Built by <a href="https://github.com/Sahil-Hub-Cloud">Sahil-Hub-Cloud</a> · <a href="https://github.com/Sahil-Hub-Cloud/ACIE">View on GitHub</a></p>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}