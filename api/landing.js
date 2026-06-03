export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>ACIE — AI Change Impact Engine</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; }
    nav { padding: 16px 40px; border-bottom: 1px solid #21262d; display: flex; justify-content: space-between; align-items: center; }
    .logo { color: #58a6ff; font-weight: 700; font-size: 18px; text-decoration: none; }
    nav a { color: #8b949e; text-decoration: none; font-size: 14px; margin-left: 24px; }
    .hero { text-align: center; padding: 80px 24px; }
    .badge { display: inline-block; background: #0d1f35; border: 1px solid #1e4a7a; color: #58a6ff; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; margin-bottom: 28px; }
    .hero h1 { font-size: 56px; font-weight: 800; color: #fff; margin-bottom: 16px; letter-spacing: -2px; }
    .hero h1 span { color: #58a6ff; }
    .hero p { font-size: 18px; color: #8b949e; max-width: 540px; margin: 0 auto 40px; line-height: 1.7; }
    .buttons { display: flex; gap: 14px; justify-content: center; }
    .btn1 { background: #238636; color: #fff; padding: 14px 30px; border-radius: 10px; font-size: 15px; font-weight: 600; text-decoration: none; }
    .btn2 { background: transparent; color: #58a6ff; border: 1px solid #21364f; padding: 14px 30px; border-radius: 10px; font-size: 15px; font-weight: 600; text-decoration: none; }
    .features { padding: 60px 24px; max-width: 960px; margin: 0 auto; }
    .features h2 { font-size: 32px; font-weight: 700; color: #fff; text-align: center; margin-bottom: 40px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .card { background: #0d1117; border: 1px solid #21262d; border-radius: 14px; padding: 24px; }
    .card .icon { font-size: 28px; margin-bottom: 12px; }
    .card h3 { color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .card p { color: #8b949e; font-size: 14px; line-height: 1.6; }
    .cta { text-align: center; padding: 60px 24px; }
    .cta h2 { font-size: 32px; font-weight: 700; color: #fff; margin-bottom: 16px; }
    .cta p { color: #8b949e; margin-bottom: 32px; }
    .footer { text-align: center; padding: 32px; border-top: 1px solid #21262d; color: #484f58; font-size: 13px; }
    .footer a { color: #58a6ff; text-decoration: none; }
  </style>
</head>
<body>
  <nav>
    <a href="/" class="logo">⚡ ACIE</a>
    <div>
      <a href="/dashboard">Dashboard</a>
      <a href="/pricing">Pricing</a>
      <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
    </div>
  </nav>
  <div class="hero">
    <div class="badge">Now live on GitHub</div>
    <h1>Google Maps for<br><span>your codebase</span></h1>
    <p>ACIE analyzes every Pull Request and tells developers exactly which files will break — before they merge.</p>
    <div class="buttons">
      <a href="https://github.com/apps/acie-bot" class="btn1">Install ACIE Free</a>
      <a href="/dashboard" class="btn2">View Dashboard</a>
    </div>
  </div>
  <div class="features">
    <h2>Everything your team needs</h2>
    <div class="grid">
      <div class="card"><div class="icon">💥</div><h3>Blast Radius</h3><p>Scans the entire repo to find every file affected by your change.</p></div>
      <div class="card"><div class="icon">🎯</div><h3>Risk Scoring</h3><p>Automatic LOW, MEDIUM, HIGH scores based on real dependency analysis.</p></div>
      <div class="card"><div class="icon">⚠️</div><h3>Test Warnings</h3><p>Flags files with no test coverage so nothing ships untested.</p></div>
      <div class="card"><div class="icon">🤖</div><h3>Fully Automatic</h3><p>Works silently on every PR with zero developer effort.</p></div>
      <div class="card"><div class="icon">📱</div><h3>Slack & Email Alerts</h3><p>Instant notifications for every HIGH risk PR.</p></div>
      <div class="card"><div class="icon">⚡</div><h3>Instant Reports</h3><p>Posts a detailed comment within seconds of a PR being opened.</p></div>
    </div>
  </div>
  <div class="cta">
    <h2>Ready to ship safer code?</h2>
    <p>Install ACIE on your GitHub repo in under 60 seconds.</p>
    <a href="https://github.com/apps/acie-bot" class="btn1">Install ACIE Free →</a>
  </div>
  <div class="footer">
    <p>Built by <a href="https://github.com/Sahil-Hub-Cloud">Sahil-Hub-Cloud</a> - <a href="/dashboard">Dashboard</a> - <a href="/pricing">Pricing</a></p>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}