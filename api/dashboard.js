export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ACIE — Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#02040a;color:#fff;display:flex;min-height:100vh;overflow:hidden}
.sidebar{width:240px;background:#060810;border-right:1px solid rgba(255,255,255,0.06);padding:28px 16px;display:flex;flex-direction:column;flex-shrink:0}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:800;font-size:17px;margin-bottom:40px;letter-spacing:-0.5px}
.logo-icon{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#7c3aed,#2563eb);display:grid;place-items:center;font-size:15px;box-shadow:0 0 20px rgba(124,58,237,0.5)}
.nav-section{font-size:10px;font-weight:700;letter-spacing:1.5px;color:rgba(255,255,255,0.2);text-transform:uppercase;padding:0 12px;margin:20px 0 8px}
.nav-link{display:flex;align-items:center;gap:10px;padding:10px 12px;color:rgba(255,255,255,0.45);text-decoration:none;border-radius:10px;margin-bottom:2px;font-weight:500;font-size:13.5px;transition:all .2s}
.nav-link:hover{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.8)}
.nav-link.active{background:rgba(124,58,237,0.12);color:#fff;font-weight:600}
.nav-link.active .nav-icon{color:#a78bfa}
.nav-icon{font-size:15px;width:18px;text-align:center}
.sidebar-footer{margin-top:auto;padding:16px 12px;border-top:1px solid rgba(255,255,255,0.06)}
.status-pill{display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(255,255,255,0.4)}
.status-dot{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
.main{flex:1;overflow-y:auto;padding:40px 48px}
.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:36px}
.page-title{font-size:22px;font-weight:800;letter-spacing:-0.8px}
.topbar-right{display:flex;align-items:center;gap:12px}
.repo-badge{background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);color:#a78bfa;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
.stat{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:22px 24px;transition:border-color .2s}
.stat:hover{border-color:rgba(124,58,237,0.3)}
.stat-val{font-size:26px;font-weight:800;letter-spacing:-1px;margin-bottom:4px}
.stat-label{font-size:11px;color:rgba(255,255,255,0.35);font-weight:600;text-transform:uppercase;letter-spacing:0.8px}
.stat-change{font-size:11px;margin-top:6px;font-weight:600}
.up{color:#10b981}
.content-grid{display:grid;grid-template-columns:1fr 360px;gap:20px}
.panel{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:28px}
.panel-title{font-size:14px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between}
.panel-badge{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;background:rgba(16,185,129,0.1);color:#10b981}
.pr-row{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.04)}
.pr-row:last-child{border:none;padding-bottom:0}
.pr-num{font-size:11px;font-weight:700;color:rgba(255,255,255,0.25);min-width:32px}
.pr-info{flex:1}
.pr-name{font-size:13px;font-weight:600;margin-bottom:3px;color:rgba(255,255,255,0.85)}
.pr-meta{font-size:11px;color:rgba(255,255,255,0.3)}
.risk-pill{padding:4px 10px;border-radius:6px;font-size:10px;font-weight:800;letter-spacing:0.5px;flex-shrink:0}
.low{background:rgba(16,185,129,0.1);color:#10b981}
.med{background:rgba(245,158,11,0.1);color:#f59e0b}
.high{background:rgba(239,68,68,0.1);color:#ef4444}
.right-col{display:flex;flex-direction:column;gap:16px}
.health-ring{width:100px;height:100px;border-radius:50%;background:conic-gradient(#7c3aed 0deg 338deg,rgba(255,255,255,0.06) 338deg);display:grid;place-items:center;margin:16px auto;position:relative}
.health-ring::before{content:'';position:absolute;inset:10px;background:#060810;border-radius:50%}
.health-val{position:relative;z-index:1;font-size:22px;font-weight:900}
.stack-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px}
.stack-row:last-child{border:none}
.stack-name{color:rgba(255,255,255,0.6);font-weight:500}
.stack-status{color:#10b981;font-weight:700;font-size:10px}
.bar-wrap{margin-top:8px}
.bar-label{display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:6px}
.bar{height:4px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px}
</style>
</head>
<body>
<div class="sidebar">
  <a href="/" class="logo"><div class="logo-icon">⚡</div>ACIE</a>
  <div class="nav-section">Main</div>
  <a href="/dashboard" class="nav-link active"><span class="nav-icon">▦</span>Overview</a>
  <a href="/history" class="nav-link"><span class="nav-icon">◷</span>PR History</a>
  <div class="nav-section">Account</div>
  <a href="/pricing" class="nav-link"><span class="nav-icon">◈</span>Plans</a>
  <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="nav-link"><span class="nav-icon">⌥</span>GitHub</a>
  <div class="sidebar-footer">
    <div class="status-pill"><div class="status-dot"></div>All systems operational</div>
  </div>
</div>
<div class="main">
  <div class="topbar">
    <div class="page-title">Overview</div>
    <div class="topbar-right">
      <span class="repo-badge">Sahil-Hub-Cloud / ACIE</span>
    </div>
  </div>
  <div class="stats-grid">
    <div class="stat">
      <div class="stat-val" style="color:#10b981">Live</div>
      <div class="stat-label">System Status</div>
      <div class="stat-change up">● Operational</div>
    </div>
    <div class="stat">
      <div class="stat-val">100%</div>
      <div class="stat-label">Uptime</div>
      <div class="stat-change up">↑ 30 days</div>
    </div>
    <div class="stat">
      <div class="stat-val">2.1s</div>
      <div class="stat-label">Avg Response</div>
      <div class="stat-change up">↓ faster</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color:#a78bfa">48</div>
      <div class="stat-label">PRs Analyzed</div>
      <div class="stat-change up">↑ all time</div>
    </div>
  </div>
  <div class="content-grid">
    <div class="panel">
      <div class="panel-title">Recent Pull Requests <span class="panel-badge">LIVE</span></div>
      <div class="pr-row">
        <div class="pr-num">#12</div>
        <div class="pr-info"><div class="pr-name">Fix authentication token loop</div><div class="pr-meta">Just now · sahilshaik · 1 file changed</div></div>
        <div class="risk-pill low">LOW</div>
      </div>
      <div class="pr-row">
        <div class="pr-num">#11</div>
        <div class="pr-info"><div class="pr-name">Add payment processing module</div><div class="pr-meta">2h ago · sahilshaik · 3 files changed</div></div>
        <div class="risk-pill med">MEDIUM</div>
      </div>
      <div class="pr-row">
        <div class="pr-num">#10</div>
        <div class="pr-info"><div class="pr-name">Database schema migration v2</div><div class="pr-meta">5h ago · sahilshaik · 6 files changed</div></div>
        <div class="risk-pill high">HIGH</div>
      </div>
      <div class="pr-row">
        <div class="pr-num">#9</div>
        <div class="pr-info"><div class="pr-name">Clean pipeline test</div><div class="pr-meta">Yesterday · sahilshaik · 1 file changed</div></div>
        <div class="risk-pill low">LOW</div>
      </div>
      <div class="pr-row">
        <div class="pr-num">#8</div>
        <div class="pr-info"><div class="pr-name">Blast radius engine upgrade</div><div class="pr-meta">2 days ago · sahilshaik · 2 files changed</div></div>
        <div class="risk-pill low">LOW</div>
      </div>
    </div>
    <div class="right-col">
      <div class="panel">
        <div class="panel-title">Codebase Health</div>
        <div class="health-ring"><div class="health-val">94%</div></div>
        <div class="bar-wrap">
          <div class="bar-label"><span>Blast coverage</span><span>94%</span></div>
          <div class="bar"><div class="bar-fill" style="width:94%;background:linear-gradient(90deg,#7c3aed,#2563eb)"></div></div>
        </div>
        <div class="bar-wrap" style="margin-top:12px">
          <div class="bar-label"><span>Test coverage</span><span>61%</span></div>
          <div class="bar"><div class="bar-fill" style="width:61%;background:linear-gradient(90deg,#f59e0b,#ef4444)"></div></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">Integrations</div>
        <div class="stack-row"><span class="stack-name">GitHub App</span><span class="stack-status">● ACTIVE</span></div>
        <div class="stack-row"><span class="stack-name">Vercel Deploy</span><span class="stack-status">● ACTIVE</span></div>
        <div class="stack-row"><span class="stack-name">Slack Alerts</span><span class="stack-status">● ACTIVE</span></div>
        <div class="stack-row"><span class="stack-name">Webhook</span><span class="stack-status">● ACTIVE</span></div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`);
}