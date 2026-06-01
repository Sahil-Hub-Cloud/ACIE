export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ACIE — Google Maps for Codebases</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Inter',sans-serif;background:#080c14;color:#c9d1d9;overflow-x:hidden;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
    @keyframes glow{0%,100%{opacity:.5}50%{opacity:1}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

    .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px;position:relative;overflow:hidden;}
    .hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,#1a2d4d 0%,transparent 70%);pointer-events:none;}
    .hero::after{content:'';position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,#1e3a5f22 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;}

    .badge{display:inline-flex;align-items:center;gap:6px;background:#0d1f35;border:1px solid #1e4a7a;color:#58a6ff;font-size:12px;font-weight:600;padding:6px 14px;border-radius:20px;margin-bottom:28px;animation:fadeUp .6s ease both;}
    .badge-dot{width:7px;height:7px;border-radius:50%;background:#3fb950;animation:glow 2s ease-in-out infinite;}

    .hero h1{font-size:clamp(42px,8vw,80px);font-weight:800;line-height:1.1;letter-spacing:-2px;color:#fff;margin-bottom:20px;animation:fadeUp .7s .1s ease both;}
    .hero h1 span{background:linear-gradient(135deg,#58a6ff,#a78bfa,#58a6ff);background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradShift 4s ease infinite;}

    .hero p{font-size:18px;color:#8b949e;max-width:540px;line-height:1.7;margin-bottom:40px;animation:fadeUp .7s .2s ease both;}

    .buttons{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;animation:fadeUp .7s .3s ease both;}
    .btn-primary{background:linear-gradient(135deg,#1f6feb,#388bfd);color:#fff;padding:14px 30px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;transition:transform .2s,box-shadow .2s;}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px #1f6feb44;}
    .btn-secondary{background:transparent;color:#58a6ff;border:1px solid #21364f;padding:14px 30px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;transition:all .2s;}
    .btn-secondary:hover{background:#0d1f35;border-color:#58a6ff;}

    .pr-demo{max-width:620px;margin:60px auto 0;background:#0d1117;border:1px solid #21262d;border-radius:14px;overflow:hidden;animation:fadeUp .8s .4s ease both;box-shadow:0 24px 48px #00000066;}
    .pr-demo-header{background:#161b22;padding:12px 18px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #21262d;}
    .dot{width:12px;height:12px;border-radius:50%;}
    .pr-demo-body{padding:20px 24px;font-family:'Courier New',monospace;font-size:13px;line-height:2;}
    .c-blue{color:#58a6ff;font-weight:600;}
    .c-green{color:#3fb950;}
    .c-yellow{color:#d29922;}
    .c-red{color:#f85149;}
    .c-gray{color:#8b949e;}

    .features{padding:80px 24px;max-width:1000px;margin:0 auto;}
    .section-label{text-align:center;color:#58a6ff;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;}
    .section-title{text-align:center;font-size:clamp(28px,5vw,40px);font-weight:700;color:#fff;margin-bottom:48px;letter-spacing:-1px;}

    .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;}
    .feature{background:#0d1117;border:1px solid #21262d;border-radius:14px;padding:28px;transition:border-color .2s,transform .2s;}
    .feature:hover{border-color:#58a6ff44;transform:translateY(-3px);}
    .feature-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px;}
    .feature h3{color:#fff;font-size:16px;font-weight:600;margin-bottom:8px;}
    .feature p{color:#8b949e;font-size:14px;line-height:1.6;}

    .stats{display:flex;justify-content:center;gap:48px;padding:60px 24px;border-top:1px solid #21262d;border-bottom:1px solid #21262d;flex-wrap:wrap;}
    .stat-item{text-align:center;}
    .stat-num{font-size:40px;font-weight:800;color:#fff;letter-spacing:-2px;}
    .stat-num span{background:linear-gradient(135deg,#58a6ff,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .stat-label{color:#8b949e;font-size:14px;margin-top:4px;}

    .cta{text-align:center;padding:80px 24px;}
    .cta h2{font-size:clamp(28px,5vw,40px);font-weight:700;color:#fff;margin-bottom:16px;letter-spacing:-1px;}
    .cta p{color:#8b949e;margin-bottom:32px;font-size:16px;}

    .footer{text-align:center;padding:32px;border-top:1px solid #21262d;color:#484f58;font-size:13px;}
    .footer a{color:#58a6ff;text-decoration:none;}
    .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:#080c14cc;backdrop-filter:blur(12px);border-bottom:1px solid #21262d22;padding:16px 40px;display:flex;justify-content:space-between;align-items:center;}
    .nav-logo{color:#fff;font-weight:700;font-size:18px;text-decoration:none;}
    .nav-logo span{color:#58a6ff;}
    .nav-links{display:flex;gap:24px;}
    .nav-links a{color:#8b949e;text-decoration:none;font-size:14px;transition:color .2s;}
    .nav-links a:hover{color:#fff;}
  </style>
</head>
<body>

<nav class="nav">
  <a href="/" class="nav-logo">⚡ <span>ACIE</span></a>
  <div class="nav-links">
    <a href="/dashboard">Dashboard</a>
    <a href="/pricing">Pricing</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
  </div>
</nav>

<div class="hero">
  <div class="badge"><span class="badge-dot"></span> Now live on GitHub</div>
  <h1>Google Maps for<br/><span>your codebase</span></h1>
  <p>ACIE analyzes every Pull Request and tells developers exactly which files will break — before they merge.</p>
  <div class="buttons">
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn-primary">Get Started Free</a>
    <a href="/dashboard" class="btn-secondary">View Dashboard</a>
  </div>
  <div class="pr-demo">
    <div class="pr-demo-header">
      <div class="dot" style="background:#f85149"></div>
      <div class="dot" style="background:#d29922"></div>
      <div class="dot" style="background:#3fb950"></div>
      <span style="color:#8b949e;font-size:12px;margin-left:8px">ACIE — Change Impact Report</span>
    </div>
    <div class="pr-demo-body">
      <div class="c-blue">## 🔍 ACIE — Change Impact Report</div>
      <div class="c-blue">### 📁 Files Changed</div>
      <div class="c-gray">- src/auth.ts (3 exports, 2 imports)</div>
      <div class="c-blue">### 💥 Blast Radius</div>
      <div class="c-yellow">- src/payment.ts</div>
      <div class="c-yellow">- src/checkout.ts</div>
      <div class="c-red">### 🎯 Risk Score: HIGH</div>
      <div class="c-red">⛔ Carefully review all affected files.</div>
    </div>
  </div>
</div>

<div class="stats">
  <div class="stat-item"><div class="stat-num"><span>∞</span></div><div class="stat-label">PRs analyzed</div></div>
  <div class="stat-item"><div class="stat-num"><span>3</span></div><div class="stat-label">Risk levels</div></div>
  <div class="stat-item"><div class="stat-num"><span>&lt;3s</span></div><div class="stat-label">Comment speed</div></div>
  <div class="stat-item"><div class="stat-num"><span>0</span></div><div class="stat-label">Setup needed</div></div>
</div>

<div class="features">
  <div class="section-label">Features</div>
  <div class="section-title">Everything your team needs</div>
  <div class="feature-grid">
    <div class="feature"><div class="feature-icon" style="background:#0d2137">💥</div><h3>Blast Radius Detection</h3><p>Scans the entire repo to find every file affected by your change.</p></div>
    <div class="feature"><div class="feature-icon" style="background:#0d2137">🎯</div><h3>Risk Scoring</h3><p>Automatic LOW, MEDIUM, HIGH scores based on real dependency analysis.</p></div>
    <div class="feature"><div class="feature-icon" style="background:#0d2137">⚠️</div><h3>Test Coverage Warnings</h3><p>Flags files with no test coverage so nothing ships untested.</p></div>
    <div class="feature"><div class="feature-icon" style="background:#0d2137">🤖</div><h3>Fully Automatic</h3><p>Installs in seconds. Works silently on every PR with zero developer effort.</p></div>
    <div class="feature"><div class="feature-icon" style="background:#0d2137">📱</div><h3>Slack Alerts</h3><p>Instant Slack notifications for every HIGH risk PR your team opens.</p></div>
    <div class="feature"><div class="feature-icon" style="background:#0d2137">⚡</div><h3>Instant Reports</h3><p>Posts a detailed comment within seconds of a PR being opened.</p></div>
  </div>
</div>

<div class="cta">
  <h2>Ready to ship safer code?</h2>
  <p>Install ACIE on your GitHub repo in under 60 seconds.</p>
  <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn-primary">Get Started Free →</a>
</div>

<div class="footer">
  <p>Built by <a href="https://github.com/Sahil-Hub-Cloud">Sahil-Hub-Cloud</a> · <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a> · <a href="/dashboard">Dashboard</a> · <a href="/pricing">Pricing</a></p>
</div>

</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}