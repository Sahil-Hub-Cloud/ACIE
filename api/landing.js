export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>ACIE — Google Maps for Codebases</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; }
    .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; background: radial-gradient(ellipse at top, #1f2d45 0%, #0d1117 70%); }
    .hero h1 { font-size: 64px; font-weight: 800; color: #fff; margin-bottom: 16px; }
    .hero h1 span { color: #58a6ff; }
    .hero p { font-size: 22px; color: #8b949e; max-width: 600px; line-height: 1.6; margin-bottom: 40px; }
    .buttons { display: flex; gap: 16px; }
    .btn-primary { background: #238636; color: #fff; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; text-decoration: none; }
    .btn-secondary { background: transparent; color: #58a6ff; border: 1px solid #58a6ff; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; text-decoration: none; }
    .features { padding: 80px 40px; max-width: 1000px; margin: 0 auto; }
    .features h2 { font-size: 36px; font-weight: 700; text-align: center; margin-bottom: 48px; color: #fff; }
    .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .feature { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 28px; }
    .feature .icon { font-size: 32px; margin-bottom: 16px; }
    .feature h3 { color: #fff; font-size: 18px; margin-bottom: 8px; }
    .feature p { color: #8b949e; font-size: 14px; line-height: 1.6; }
    .footer { text-align: center; padding: 40px; color: #484f58; font-size: 14px; border-top: 1px solid #21262d; }
    .footer a { color: #58a6ff; text-decoration: none; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>⚡ <span>ACIE</span></h1>
    <p>The AI-powered tool that tells developers exactly what will break before they merge — like Google Maps for your codebase.</p>
    <div class="buttons">
      <a href="/dashboard" class="btn-primary">View Dashboard</a>
      <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn-secondary">View on GitHub</a>
    </div>
  </div>
  <div class="features">
    <h2>Why ACIE?</h2>
    <div class="feature-grid">
      <div class="feature"><div class="icon">💥</div><h3>Blast Radius</h3><p>Instantly see every file affected by a code change.</p></div>
      <div class="feature"><div class="icon">🎯</div><h3>Risk Scoring</h3><p>Automatic risk scores based on real dependency analysis.</p></div>
      <div class="feature"><div class="icon">⚠️</div><h3>Test Warnings</h3><p>Flags files with no test coverage before you ship.</p></div>
    </div>
  </div>
  <div class="footer"><p>Built by Sahil-Hub-Cloud · <a href="/dashboard">Dashboard</a></p></div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}