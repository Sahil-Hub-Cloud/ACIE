export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>ACIE Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; }
    .header { background: #161b22; border-bottom: 1px solid #30363d; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { color: #58a6ff; font-size: 24px; text-decoration: none; }
    .nav a { color: #58a6ff; text-decoration: none; margin-left: 20px; font-size: 14px; }
    .container { max-width: 900px; margin: 40px auto; padding: 0 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; }
    .card h2 { font-size: 16px; color: #58a6ff; margin-bottom: 12px; }
    .card p, .card li { color: #8b949e; font-size: 14px; line-height: 1.8; }
    .card ol { padding-left: 20px; }
    .stat { font-size: 36px; font-weight: 700; color: #c9d1d9; }
    .stat-label { color: #8b949e; font-size: 13px; margin-top: 4px; }
    .low { color: #3fb950; font-weight: 600; font-size: 14px; margin: 8px 0; }
    .medium { color: #d29922; font-weight: 600; font-size: 14px; margin: 8px 0; }
    .high { color: #f85149; font-weight: 600; font-size: 14px; margin: 8px 0; }
    .full { grid-column: 1 / -1; }
    .tag { display: inline-block; background: #21262d; border: 1px solid #30363d; border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #8b949e; margin: 4px 4px 0 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ACIE Dashboard</h1>
    <div class="nav">
      <a href="/">Home</a>
      <a href="/pricing">Pricing</a>
      <a href="/history">History</a>
    </div>
  </div>
  <div class="container">
    <div class="grid">
      <div class="card">
        <h2>Status</h2>
        <div class="stat">Live</div>
        <div class="stat-label">Actively monitoring GitHub Pull Requests</div>
      </div>
      <div class="card">
        <h2>What is ACIE?</h2>
        <p>ACIE automatically analyzes every Pull Request and tells developers exactly which files will be affected by their changes.</p>
      </div>
    </div>
    <div class="grid">
      <div class="card">
        <h2>How it works</h2>
        <ol>
          <li>Developer opens a Pull Request</li>
          <li>ACIE scans all changed files</li>
          <li>Maps import/export relationships</li>
          <li>Calculates blast radius</li>
          <li>Posts a risk report as a PR comment</li>
        </ol>
      </div>
      <div class="card">
        <h2>Risk Levels</h2>
        <p class="low">LOW - Safe to merge</p>
        <p class="medium">MEDIUM - Review before merging</p>
        <p class="high">HIGH - Carefully review all affected files</p>
      </div>
    </div>
    <div class="card full">
      <h2>Powered by</h2>
      <span class="tag">GitHub Apps</span>
      <span class="tag">Vercel</span>
      <span class="tag">Node.js</span>
      <span class="tag">Health Score</span>
      <span class="tag">Blast Radius</span>
      <span class="tag">Slack Alerts</span>
    </div>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}