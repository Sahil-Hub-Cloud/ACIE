export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ACIE Dashboard</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#030712;color:#fff;display:flex;min-height:100vh}
.sidebar{width:260px;background:#080b1a;border-right:1px solid rgba(255,255,255,0.05);padding:32px 20px;display:flex;flex-direction:column;flex-shrink:0}
.logo{display:flex;align-items:center;gap:10px;font-weight:900;font-size:18px;margin-bottom:48px;text-decoration:none;color:#fff}
.logo-box{width:32px;height:32px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);border-radius:8px;display:grid;place-items:center;font-size:14px;box-shadow:0 0 15px rgba(139,92,246,0.4)}
.nav-link{display:block;padding:12px 16px;color:#64748b;text-decoration:none;border-radius:10px;margin-bottom:6px;font-weight:600;font-size:14px;transition:0.2s}
.nav-link:hover,.nav-link.active{background:rgba(139,92,246,0.1);color:#fff}
.main{flex:1;padding:48px;overflow-y:auto}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px}
h1{font-size:28px;font-weight:900;letter-spacing:-1px}
.repo-tag{background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);color:#c4b5fd;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
.stat-c{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);padding:24px;border-radius:20px}
.val{font-size:28px;font-weight:900;margin-bottom:4px}
.lbl{color:#475569;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
.grid-2{display:grid;grid-template-columns:2fr 1fr;gap:20px}
.panel{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:32px}
.panel-h{font-size:16px;font-weight:800;margin-bottom:24px;display:flex;align-items:center;gap:10px}
.dot{width:8px;height:8px;background:#10b981;border-radius:50%;box-shadow:0 0 10px #10b981;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
.feed-item{padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.04);display:flex;justify-content:space-between;align-items:center}
.feed-item:last-child{border:none}
.f-title{font-size:13px;font-weight:700;margin-bottom:3px}
.f-meta{font-size:11px;color:#475569}
.badge{padding:4px 12px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:0.5px}
.b-green{background:rgba(16,185,129,0.1);color:#10b981}
.b-yellow{background:rgba(245,158,11,0.1);color:#f59e0b}
.b-red{background:rgba(239,68,68,0.1);color:#ef4444}
.gauge-wrap{text-align:center}
.gauge{width:120px;height:120px;border-radius:50%;border:8px solid rgba(255,255,255,0.05);border-top-color:#8b5cf6;border-right-color:#8b5cf6;display:grid;place-items:center;margin:0 auto 16px;font-size:28px;font-weight:900}
.stack-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;color:#94a3b8}
.stack-item:last-child{border:none}
.stack-dot{width:6px;height:6px;border-radius:50%;background:#8b5cf6}
</style>
</head>
<body>
<div class="sidebar">
  <a href="/" class="logo"><div class="logo-box">A</div>ACIE</a>
  <a href="/dashboard" class="nav-link active">Overview</a>
  <a href="/history" class="nav-link">PR History</a>
  <a href="/pricing" class="nav-link">Plans</a>
  <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="nav-link">GitHub</a>
</div>
<div class="main">
  <div class="header">
    <h1>Intelligence Center</h1>
    <span class="repo-tag">Sahil-Hub-Cloud / ACIE</span>
  </div>
  <div class="stats">
    <div class="stat-c"><div class="val" style="color:#10b981">Active</div><div class="lbl">System</div></div>
    <div class="stat-c"><div class="val">100%</div><div class="lbl">Uptime</div></div>
    <div class="stat-c"><div class="val">2.1s</div><div class="lbl">Latency</div></div>
    <div class="stat-c"><div class="val" style="color:#8b5cf6">48</div><div class="lbl">Analyses</div></div>
  </div>
  <div class="grid-2">
    <div class="panel">
      <div class="panel-h"><div class="dot"></div>Live PR Stream</div>
      <div class="feed-item">
        <div><div class="f-title">PR #12 — Fix authentication loop</div><div class="f-meta">Just now · sahilshaik</div></div>
        <span class="badge b-green">LOW</span>
      </div>
      <div class="feed-item">
        <div><div class="f-title">PR #11 — Add payment module</div><div class="f-meta">2h ago · sahilshaik</div></div>
        <span class="badge b-yellow">MEDIUM</span>
      </div>
      <div class="feed-item">
        <div><div class="f-title">PR #10 — Database migration</div><div class="f-meta">5h ago · sahilshaik</div></div>
        <span class="badge b-red">HIGH</span>
      </div>
      <div class="feed-item">
        <div><div class="f-title">PR #9 — Clean pipeline test</div><div class="f-meta">Yesterday · sahilshaik</div></div>
        <span class="badge b-green">LOW</span>
      </div>
    </div>
    <div>
      <div class="panel" style="margin-bottom:20px">
        <div class="panel-h">Health Index</div>
        <div class="gauge-wrap">
          <div class="gauge">94%</div>
          <div class="lbl">Codebase Health</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-h">Tech Stack</div>
        <div class="stack-item"><div class="stack-dot"></div>GitHub Apps</div>
        <div class="stack-item"><div class="stack-dot"></div>Vercel Serverless</div>
        <div class="stack-item"><div class="stack-dot"></div>Node.js</div>
        <div class="stack-item"><div class="stack-dot"></div>Slack API</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`);
}