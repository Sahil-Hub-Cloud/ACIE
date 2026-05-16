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
    .demo { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 32px; max-width: 700px; margin: 0 auto 80px; }
    .demo h2 { color: #fff; font-size: 24px; margin-bottom: 20px; text-align: center; }
    .comment { background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 20px; font-family: monospace; font-size: 13px; line-height: 1.8; }
    .low { color: #3fb950; }
    .medium { color: #d29922; }
    .high { color: #f85149; }
    .blue { color: #58a6ff; }
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
      <div class="feature">
        <div class="icon">💥</div>
        <h3>Blast Radius Detection</h3>
        <p>Instantly see every file affected by a code change before merging.</p>
      </div>
      <div class="feature">
        <div class="icon">🎯</div>
        <h3>Risk Scoring</h3>
        <p>Automatic LOW, MEDIUM, HIGH risk scores based on real dependency analysis.</p>
      </div>
      <div class="feature">
        <div class="icon">⚠️</div>
        <h3>Test Coverage Warnings</h3>
        <p>Flags files with no test coverage so nothing ships untested.</p>
      </div>
      <div class="feature">
        <div class="icon">🤖</div>
        <h3>Fully Automatic</h3>
        <p>Works silently in the background. No setup needed for developers.</p>
      </div>
      <div class="feature">
        <div class="icon">⚡</div>
        <h3>Instant Reports</h3>
        <p>Posts a detailed comment on every PR within seconds of opening.</p>
      </div>
      <div class="feature">
        <div class="icon">🔍</div>
        <h3>Deep Analysis</h3>
        <p>Scans the entire repository to find hidden dependencies.</p>
      </div>
    </div>
  </div>
  <div class="demo">
    <h2>Example PR Comment</h2>
    <div class="comment">
      <span class="blue">## 🔍 ACIE — Change Impact Report</span><br/><br/>
      <span class="blue">### 📁 Files Changed</span><br/>
      - src/auth.ts (3 exports, 2 imports)<br/><br/>
      <span class="blue">### 💥 Blast Radius</span><br/>
      - src/payment.ts<br/>
      - src/checkout.ts<br/><br/>
      <span class="blue">### 🎯 Risk Score:</span> <span class="high">HIGH</span><br/>
      - 2 files affected<br/>
      - ⚠️ src/auth.ts has no test coverage<br/><br/>
      <span class="blue">### 💡 Recommendation</span><br/>
      <span class="high">⛔ High risk — carefully review all affected files.</span>
    </div>
  </div>
  <div class="footer">
    <p>Built by <a href="https://github.com/Sahil-Hub-Cloud">Sahil-Hub-Cloud</a> · <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a> · <a href="/dashboard">Dashboard</a></p>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}