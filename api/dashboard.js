export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>ACIE Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',sans-serif;background:#080c14;color:#c9d1d9;}
.nav{border-bottom:1px solid #21262d;padding:16px 40px;display:flex;justify-content:space-between;align-items:center;}
.nav-logo{color:#fff;font-weight:700;font-size:18px;text-decoration:none;}
.nav-logo span{color:#58a6ff;}
.nav-links a{color:#8b949e;text-decoration:none;font-size:14px;margin-left:24px;}
.container{max-width:960px;margin:48px auto;padding:0 24px;}
.page-title{font-size:28px;font-weight:700;color:#fff;letter-spacing:-1px;margin-bottom:4px;}
.page-sub{color:#8b949e;font-size:14px;margin-bottom:36px;}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;}
.stat-card{background:#0d1117;border:1px solid #21262d;border-radius:12px;padding:20px 24px;}
.stat-card .num{font-size:32px;font-weight:700;color:#fff;}
.stat-card .num.green{color:#3fb950;}
.stat-card .num.blue{color:#58a6ff;}
.stat-card .lbl{color:#8b949e;font-size:13px;margin-top:4px;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.card{background:#0d1117;border:1px solid #21262d;border-radius:14px;padding:24px;}
.card h2{font-size:15px;font-weight:600;color:#fff;margin-bottom:16px;}
.card p,.card li{color:#8b949e;font-size:14px;line-height:1.8;}
.card ol{padding-left:18px;}
.risk-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #21262d22;}
.risk-row:last-child{border-bottom:none;}
.risk-badge{padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;}
.low{background:#0d2a14;color:#3fb950;}
.medium{background:#2a1f0d;color:#d29922;}
.high{background:#2a0d0d;color:#f85149;}
.full{grid-column:1/-1;}
.tag{display:inline-block;background:#0d1f35;border:1px solid #1e4a7a;border-radius:6px;padding:4px 12px;font-size:12px;color:#58a6ff;margin:4px 4px 0 0;}
.footer{text-align:center;padding:40px;color:#484f58;font-size:13px;border-top:1px solid #21262d;margin-top:60px;}
.footer a{color:#58a6ff;text-decoration:none;}
</style>
</head>
<body>
<nav class="nav">
  <a href="/" class="nav-logo">ACIE <span>Dashboard</span></a>
  <div class="nav-links">
    <a href="/">Home</a>
    <a href="/pricing">Pricing</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
  </div>
</nav>
<div class="container">
  <div class="page-title">Dashboard</div>
  <div class="page-sub">AI Change Impact Engine — monitoring your codebase in real time</div>
  <div class="stats-row">
    <div class="stat-card"><div class="num green">Live</div><div class="lbl">System status</div></div>
    <div class="stat-card"><div class="num blue">3</div><div class="lbl">Risk levels</div></div>
    <div class="stat-card"><div class="num">3s</div><div class="lbl">Avg response</div></div>
    <div class="stat-card"><div class="num">100%</div><div class="lbl">Uptime</div></div>
  </div>
  <div class="grid">
    <div class="card">
      <h2>Status</h2>
      <p>ACIE is actively monitoring all pull requests. Every PR gets an automatic blast radius report within seconds of opening.</p>
    </div>
    <div class="card">
      <h2>How it works</h2>
      <ol>
        <li>Developer opens a Pull Request</li>
        <li>ACIE scans all changed files</li>
        <li>Maps import and export relationships</li>
        <li>Posts a risk report as a PR comment</li>
      </ol>
    </div>
    <div class="card">
      <h2>Risk levels</h2>
      <div class="risk-row"><s
