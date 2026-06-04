export default async function handler(req,res){res.setHeader("Content-Type","text/html");const h=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>ACIE - AI Change Impact Engine</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0e1a;color:#e2e8f0;overflow-x:hidden}
:root{--purple:#7c3aed;--blue:#3b82f6;--cyan:#06b6d4;--green:#10b981;--pink:#ec4899}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,14,26,0.8);backdrop-filter:blur(20px);border-bottom:1px solid rgba(124,58,237,0.2);padding:16px 48px;display:flex;justify-content:space-between;align-items:center}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#7c3aed,#3b82f6);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff}
.logo-text{font-size:20px;font-weight:700;color:#fff}
.nav-links{display:flex;align-items:center;gap:32px}
.nav-links a{color:#94a3b8;text-decoration:none;font-size:14px;transition:color .2s}
.nav-links a:hover{color:#fff}
.nav-cta{background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;transition:opacity .2s}
.nav-cta:hover{opacity:.9}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;width:800px;height:800px;background:radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
.hero::after{content:'';position:absolute;width:400px;height:400px;background:radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%);top:20%;right:10%;pointer-events:none}
.badge{display:inline-flex;align-items:center;gap:8px;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.4);color:#a78bfa;font-size:12px;font-weight:600;padding:6px 16px;border-radius:20px;margin-bottom:32px;letter-spacing:.5px}
.badge-dot{width:6px;height:6px;border-radius:50%;background:#7c3aed;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}
.hero h1{font-size:clamp(40px,7vw,72px);font-weight:800;line-height:1.1;letter-spacing:-2px;color:#fff;margin-bottom:24px}
.hero h1 .grad{background:linear-gradient(135deg,#7c3aed,#3b82f6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p{font-size:18px;color:#94a3b8;max-width:560px;line-height:1.7;margin-bottom:48px}
.hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn-primary{background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;padding:16px 36px;border-radius:10px;font-size:16px;font-weight:600;text-decoration:none;transition:transform .2s,box-shadow .2s}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(124,58,237,0.4)}
.btn-secondary{background:rgba(255,255,255,0.05);color:#e2e8f0;border:1px solid rgba(255,255,255,0.1);padding:16px 36px;border-radius:10px;font-size:16px;font-weight:600;text-decoration:none;transition:all .2s}
.btn-secondary:hover{background:rgba(255,255,255,0.1);border-color:rgba(124,58,237,0.5)}
.stats{display:flex;justify-content:center;gap:0;margin:80px auto;max-width:800px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden}
.stat{flex:1;padding:32px 24px;text-align:center;border-right:1px solid rgba(255,255,255,0.08)}
.stat:last-child{border-right:none}
.stat-num{font-size:36px;font-weight:800;background:linear-gradient(135deg,#7c3aed,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.stat-label{color:#64748b;font-size:13px;margin-top:6px}
.section{padding:80px 24px;max-width:1100px;margin:0 auto}
.section-tag{color:#7c3aed;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;text-align:center}
.section-title{font-size:clamp(28px,4vw,42px);font-weight:700;color:#fff;text-align:center;margin-bottom:16px;letter-spacing:-1px}
.section-sub{color:#64748b;font-size:16px;text-align:center;margin-bottom:56px;max-width:500px;margin-left:auto;margin-right:auto}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feature-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;transition:all .3s;position:relative;overflow:hidden}
.feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent);opacity:0;transition:opacity .3s}
.feature-card:hover{border-color:rgba(124,58,237,0.3);transform:translateY(-4px);background:rgba(124,58,237,0.05)}
.feature-card:hover::before{opacity:1}
.feature-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:18px;background:rgba(124,58,237,0.15)}
.feature-card h3{color:#fff;font-size:17px;font-weight:600;margin-bottom:10px}
.feature-card p{color:#64748b;font-size:14px;line-height:1.7}
.demo-section{padding:80px 24px;background:rgba(124,58,237,0.03);border-top:1px solid rgba(124,58,237,0.1);border-bottom:1px solid rgba(124,58,237,0.1)}
.demo-inner{max-width:900px;margin:0 auto}
.demo-window{background:#0d1117;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;box-shadow:0 32px 64px rgba(0,0,0,0.5)}
.demo-bar{background:#161b22;padding:12px 20px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,0.08)}
.dot{width:12px;height:12px;border-radius:50%}
.demo-title{color:#64748b;font-size:13px;margin-left:8px}
.demo-body{padding:28px;font-family:'Courier New',monospace;font-size:13px;line-height:2}
.c1{color:#58a6ff;font-weight:600}.c2{color:#3fb950}.c3{color:#d29922}.c4{color:#f85149}.c5{color:#8b949e}
.cta-section{padding:100px 24px;text-align:center}
.cta-box{max-width:600px;margin:0 auto;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:24px;padding:60px 48px}
.cta-box h2{font-size:36px;font-weight:700;color:#fff;margin-bottom:16px;letter-spacing:-1px}
.cta-box p{color:#64748b;margin-bottom:36px;font-size:16px}
footer{text-align:center;padding:32px;border-top:1px solid rgba(255,255,255,0.06);color:#475569;font-size:13px}
footer a{color:#7c3aed;text-decoration:none}
</style>
</head>
<body>
<nav class="nav">
  <a href="/" class="nav-logo"><div class="logo-icon">A</div><span class="logo-text">ACIE</span></a>
  <div class="nav-links">
    <a href="/dashboard">Dashboard</a>
    <a href="/pricing">Pricing</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="nav-cta">Get Started Free</a>
  </div>
</nav>
<div class="hero">
  <div class="badge"><span class="badge-dot"></span>AI-Powered Code Intelligence</div>
  <h1>Google Maps for<br><span class="grad">your codebase</span></h1>
  <p>ACIE analyzes every Pull Request and tells developers exactly which files will break before they merge. Instant blast radius reports, risk scoring, and health checks.</p>
  <div class="hero-btns">
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn-primary">Get Started Free →</a>
    <a href="/dashboard" class="btn-secondary">View Dashboard</a>
  </div>
</div>
<div style="max-width:1100px;margin:0 auto;padding:0 24px">
  <div class="stats">
    <div class="stat"><div class="stat-num">∞</div><div class="stat-label">PRs Analyzed</div></div>
    <div class="stat"><div class="stat-num">3</div><div class="stat-label">Risk Levels</div></div>
    <div class="stat"><div class="stat-num">&lt;3s</div><div class="stat-label">Report Speed</div></div>
    <div class="stat"><div class="stat-num">100%</div><div class="stat-label">Automatic</div></div>
  </div>
</div>
<div class="section">
  <div class="section-tag">Features</div>
  <div class="section-title">Everything your team needs</div>
  <div class="section-sub">Built for modern engineering teams who ship fast and need to ship safe.</div>
  <div class="features-grid">
    <div class="feature-card"><div class="feature-icon">💥</div><h3>Blast Radius Detection</h3><p>Scans the entire repository to find every file affected by your change before merging.</p></div>
    <div class="feature-card"><div class="feature-icon">🎯</div><h3>Risk Scoring</h3><p>Automatic LOW, MEDIUM, HIGH scores based on real dependency and complexity analysis.</p></div>
    <div class="feature-card"><div class="feature-icon">📊</div><h3>Health Score</h3><p>0-100% code health score per file — like Google Lighthouse but for your pull requests.</p></div>
    <div class="feature-card"><div class="feature-icon">🛡️</div><h3>Security Scanner</h3><p>Detects hardcoded secrets, API keys, and passwords before they reach production.</p></div>
    <div class="feature-card"><div class="feature-icon">📱</div><h3>Slack Alerts</h3><p>Instant Slack notifications the second a risky PR is opened by your team.</p></div>
    <div class="feature-card"><div class="feature-icon">⚡</div><h3>Instant Reports</h3><p>Detailed PR comment posted within 3 seconds of opening. Zero developer effort.</p></div>
  </div>
</div>
<div class="demo-section">
  <div class="demo-inner">
    <div class="section-tag" style="text-align:center;margin-bottom:12px">Live Example</div>
    <div class="section-title" style="margin-bottom:32px">What ACIE posts on your PR</div>
    <div class="demo-window">
      <div class="demo-bar"><div class="dot" style="background:#f85149"></div><div class="dot" style="background:#d29922"></div><div class="dot" style="background:#3fb950"></div><span class="demo-title">ACIE — Change Impact Report</span></div>
      <div class="demo-body">
        <div class="c1">## ACIE — Change Impact Report</div>
        <div class="c5">### Health Score: 75%</div>
        <div class="c5">| Metric | Value |</div>
        <div class="c5">| Risk Level | MEDIUM |</div>
        <div class="c5">| Files Analyzed | 2 |</div>
        <div class="c5">| Blast Radius | 1 file |</div>
        <div class="c1">### File Analysis</div>
        <div class="c2">src/auth.ts — 100% — 3 exports — 2 imports — none</div>
        <div class="c3">src/payment.ts — 50% — 1 export — 4 imports — deep nesting</div>
        <div class="c1">### Blast Radius</div>
        <div class="c4">src/checkout.ts</div>
        <div class="c1">### Recommendation</div>
        <div class="c3">Medium risk — review before merging.</div>
      </div>
    </div>
  </div>
</div>
<div class="cta-section">
  <div class="cta-box">
    <h2>Ready to ship safer code?</h2>
    <p>Install ACIE on your GitHub repo in under 60 seconds. Free forever for solo developers.</p>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn-primary">Get Started Free →</a>
  </div>
</div>
<footer>Built by <a href="https://github.com/Sahil-Hub-Cloud">Sahil-Hub-Cloud</a> · <a href="/dashboard">Dashboard</a> · <a href="/pricing">Pricing</a> · <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a></footer>
</body>
</html>return res.status(200).send(h);}