export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>ACIE Dashboard</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #0d1117; color: #c9d1d9; }
    h1 { color: #58a6ff; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .low { color: #3fb950; }
    .medium { color: #d29922; }
    .high { color: #f85149; }
    a { color: #58a6ff; }
  </style>
</head>
<body>
  <h1>ACIE Dashboard</h1>
  <p>AI Change Impact Engine</p>
  <div class="card">
    <h2>Status: Live</h2>
    <p>ACIE is actively monitoring pull requests on GitHub.</p>
  </div>
  <div class="card">
    <h2>How it works</h2>
    <ol>
      <li>Developer opens a Pull Request</li>
      <li>ACIE scans all changed files</li>
      <li>Detects which other files are affected</li>
      <li>Posts a risk report as a PR comment</li>
    </ol>
  </div>
  <div class="card">
    <h2>Risk Levels</h2>
    <p class="low">LOW - Safe to merge</p>
    <p class="medium">MEDIUM - Review before merging</p>
    <p class="high">HIGH - Carefully review all affected files</p>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}