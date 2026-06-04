export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ACIE — Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0b14;--bg2:#0f1020;--bg3:#141528;--border:rgba(255,255,255,0.07);--purple:#7c3aed;--blue:#3b82f6;--green:#10b981;--yellow:#f59e0b;--red:#ef4444;--text:rgba(255,255,255,0.85);--muted:rgba(255,255,255,0.35)}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);display:flex;min-height:100vh;font-size:13px}

/* SIDEBAR */
.sidebar{width:220px;background:var(--bg2);border-right:1px solid var(--border);padding:20px 12px;display:flex;flex-direction:column;flex-shrink:0}
.logo{display:flex;align-items:center;gap:9px;text-decoration:none;color:#fff;font-weight:800;font-size:16px;margin-bottom:32px;padding:0 8px}
.logo-icon{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--purple),var(--blue));display:grid;place-items:center;font-size:14px;flex-shrink:0;box-shadow:0 0 16px rgba(124,58,237,0.5)}
.nav-label{font-size:10px;font-weight:700;letter-spacing:1.2px;color:var(--muted);text-transform:uppercase;padding:0 10px;margin:16px 0 6px}
.nav-item{display:flex;align-items:center;gap:9px;padding:9px 10px;color:var(--muted);text-decoration:none;border-radius:8px;margin-bottom:1px;font-weight:500;transition:all .15s;cursor:pointer}
.nav-item:hover{background:rgba(255,255,255,0.05);color:var(--text)}
.nav-item.active{background:rgba(124,58,237,0.12);color:#fff}
.nav-item.active .ni{color:var(--purple)}
.ni{font-size:14px;width:16px;text-align:center;flex-shrink:0}
.nav-count{margin-left:auto;background:rgba(124,58,237,0.2);color:#a78bfa;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px}
.sidebar-bottom{margin-top:auto;padding-top:16px;border-top:1px solid var(--border)}
.user-row{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px}
.avatar{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--purple),var(--blue));display:grid;place-items:center;font-size:11px;font-weight:700;flex-shrink:0}
.user-name{font-size:12px;font-weight:600}
.user-role{font-size:10px;color:var(--muted)}
.status-row{display:flex;align-items:center;gap:6px;padding:6px 10px;font-size:11px;color:var(--muted);margin-top:4px}
.sdot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:pulse 2s infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* MAIN */
.main{flex:1;overflow-y:auto;display:flex;flex-direction:column;height:100vh}
.topbar{padding:16px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--bg2);flex-shrink:0}
.search{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:8px;padding:7px 14px;width:260px}
.search input{background:none;border:none;outline:none;color:var(--text);font-size:12px;font-family:'Inter',sans-serif;width:100%}
.search input::placeholder{color:var(--muted)}
.search-icon{color:var(--muted);font-size:13px}
.topbar-right{display:flex;align-items:center;gap:10px}
.icon-btn{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid var(--border);display:grid;place-items:center;cursor:pointer;font-size:14px;color:var(--muted);transition:all .15s}
.icon-btn:hover{background:rgba(255,255,255,0.08);color:var(--text)}
.notif{position:relative}
.notif-dot{position:absolute;top:6px;right:6px;width:5px;height:5px;border-radius:50%;background:var(--red)}
.avatar-btn{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--purple),var(--blue));display:grid;place-items:center;font-size:11px;font-weight:700;cursor:pointer}
.content{padding:24px 28px;flex:1}
.page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.page-title{font-size:20px;font-weight:800;letter-spacing:-0.5px}
.page-sub{font-size:12px;color:var(--muted);margin-top:2px}
.header-right{display:flex;gap:8px}
.btn-sm{padding:7px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:none;font-family:'Inter',sans-serif;transition:all .15s}
.btn-outline{background:transparent;border:1px solid var(--border);color:var(--muted)}
.btn-outline:hover{border-color:var(--purple);color:#fff}
.btn-primary{background:linear-gradient(135deg,var(--purple),var(--blue));color:#fff;box-shadow:0 0 20px rgba(124,58,237,0.3)}
.btn-primary:hover{opacity:.9}

/* STATS */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
.stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:18px 20px;transition:border-color .2s;cursor:default}
.stat-card:hover{border-color:rgba(124,58,237,0.3)}
.stat-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
.stat-icon{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;font-size:15px}
.stat-trend{font-size:10px;font-weight:700;padding:3px 7px;border-radius:6px}
.trend-up{background:rgba(16,185,129,0.1);color:var(--green)}
.trend-down{background:rgba(239,68,68,0.1);color:var(--red)}
.stat-val{font-size:26px;font-weight:800;letter-spacing:-1px;margin-bottom:3px}
.stat-label{font-size:11px;color:var(--muted);font-weight:500}
.stat-sub{font-size:10px;color:var(--muted);margin-top:4px}

/* GRID */
.grid-main{display:grid;grid-template-columns:1fr 1fr 320px;gap:14px;margin-bottom:14px}
.grid-bottom{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.panel{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:20px}
.panel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.panel-title{font-size:13px;font-weight:700}
.panel-action{font-size:11px;color:var(--purple);cursor:pointer;font-weight:600}
.panel-action:hover{text-decoration:underline}
.live-badge{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:var(--green)}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}

/* PR ROWS */
.pr-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04)}
.pr-row:last-child{border:none;padding-bottom:0}
.pr-avatar{width:26px;height:26px;border-radius:7px;display:grid;place-items:center;font-size:10px;font-weight:700;flex-shrink:0;background:linear-gradient(135deg,#4f46e5,#7c3aed)}
.pr-info{flex:1;min-width:0}
.pr-name{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.pr-meta{font-size:10px;color:var(--muted)}
.risk-badge{padding:3px 9px;border-radius:6px;font-size:9px;font-weight:800;letter-spacing:.5px;flex-shrink:0}
.r-low{background:rgba(16,185,129,0.1);color:var(--green)}
.r-med{background:rgba(245,158,11,0.1);color:var(--yellow)}
.r-high{background:rgba(239,68,68,0.1);color:var(--red)}

/* HEATMAP */
.heatmap{display:grid;grid-template-columns:repeat(26,1fr);gap:3px;margin-top:8px}
.hcell{aspect-ratio:1;border-radius:2px;background:rgba(255,255,255,0.04)}
.h1{background:rgba(124,58,237,0.2)}
.h2{background:rgba(124,58,237,0.4)}
.h3{background:rgba(124,58,237,0.65)}
.h4{background:rgba(124,58,237,0.9)}
.heatmap-labels{display:flex;justify-content:space-between;font-size:9px;color:var(--muted);margin-bottom:4px}

/* HEALTH GAUGE */
.gauge-wrap{display:flex;flex-direction:column;align-items:center;padding:8px 0}
.gauge-ring{width:110px;height:110px;border-radius:50%;background:conic-gradient(var(--purple) 0deg 310deg,rgba(255,255,255,0.05) 310deg);display:grid;place-items:center;position:relative;margin-bottom:12px}
.gauge-ring::before{content:'';position:absolute;inset:10px;background:var(--bg2);border-radius:50%}
.gauge-val{position:relative;z-index:1;font-size:22px;font-weight:800}
.gauge-label{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.progress-row{margin-bottom:10px}
.progress-top{display:flex;justify-content:space-between;font-size:10px;margin-bottom:5px}
.progress-name{color:var(--muted)}
.progress-val{font-weight:700}
.bar{height:3px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px;transition:width .5s}

/* PIPELINE */
.pipeline-row{display:flex;align-items:center;gap:6px;margin-bottom:10px;font-size:11px}
.pipe-step{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1}
.pipe-dot{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:10px;font-weight:700}
.pipe-done{background:rgba(16,185,129,0.15);border:1.5px solid var(--green);color:var(--green)}
.pipe-run{background:rgba(59,130,246,0.15);border:1.5px solid var(--blue);color:var(--blue)}
.pipe-label{font-size:9px;color:var(--muted);font-weight:600;text-align:center}
.pipe-line{flex:1;height:1px;background:rgba(255,255,255,0.08);margin-bottom:12px}
.pipe-time{font-size:9px;color:var(--muted);text-align:center;margin-top:2px}

/* TEAM */
.team-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04)}
.team-row:last-child{border:none}
.team-avatar{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;font-size:11px;font-weight:700;flex-shrink:0}
.team-name{font-size:12px;font-weight:600}
.team-handle{font-size:10px;color:var(--muted)}
.team-role{margin-left:auto;font-size:9px;font-weight:700;padding:2px 8px;border-radius:6px}
.role-owner{background:rgba(124,58,237,0.15);color:#a78bfa}
.role-dev{background:rgba(59,130,246,0.15);color:#60a5fa}
.role-test{background:rgba(16,185,129,0.15);color:var(--green)}

/* ANALYTICS CHART */
.chart-area{height:80px;display:flex;align-items:flex-end;gap:3px;margin-top:8px}
.bar-col{flex:1;border-radius:3px 3px 0 0;min-height:4px;transition:opacity .2s;cursor:pointer}
.bar-col:hover{opacity:.8}
.chart-labels{display:flex;justify-content:space-between;font-size:9px;color:var(--muted);margin-top:6px}

/* QUICK ACTIONS */
.action-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;background:rgba(255,255,255,0.03);border:1px solid var(--border);margin-bottom:8px;cursor:pointer;transition:all .15s}
.action-item:hover{background:rgba(124,58,237,0.08);border-color:rgba(124,58,237,0.3)}
.action-item:last-child{margin:0}
.action-icon{font-size:14px}
.action-text{font-size:12px;font-weight:600}
.action-arrow{margin-left:auto;color:var(--muted);font-size:12px}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.stat-card{animation:fadeUp .4s ease both}
.stat-card:nth-child(1){animation-delay:.05s}
.stat-card:nth-child(2){animation-delay:.1s}
.stat-card:nth-child(3){animation-delay:.15s}
.stat-card:nth-child(4){animation-delay:.2s}
.panel{animation:fadeUp .5s .2s ease both}
.pr-row{transition:background .15s}
.pr-row:hover{background:rgba(255,255,255,0.03);border-radius:8px;padding-left:8px}
.action-item{transition:all .2s}
.nav-item{transition:all .15s}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.2)}
</style>
</head>
<body>

<!-- SIDEBAR -->
<div class="sidebar">
  <a href="/" class="logo"><div class="logo-icon">⚡</div>ACIE</a>
  <div class="nav-label">Main</div>
  <a href="/dashboard" class="nav-item active"><span class="ni">▦</span>Dashboard<span class="nav-count">4</span></a>
  <a href="/history" class="nav-item"><span class="ni">◷</span>PR History</a>
  <a href="#" class="nav-item"><span class="ni">⚙</span>Pipelines</a>
  <a href="#" class="nav-item"><span class="ni">◈</span>Analytics</a>
  <a href="#" class="nav-item"><span class="ni">⚑</span>Issues</a>
  <div class="nav-label">Settings</div>
  <a href="#" class="nav-item"><span class="ni">◉</span>Security</a>
  <a href="#" class="nav-item"><span class="ni">◎</span>Team</a>
  <a href="/pricing" class="nav-item"><span class="ni">◈</span>Plans</a>
  <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="nav-item"><span class="ni">⌥</span>GitHub</a>
  <div class="sidebar-bottom">
    <div class="user-row">
      <div class="avatar">S</div>
      <div><div class="user-name">Sahil Shaik</div><div class="user-role">Pro Plan</div></div>
    </div>
    <div class="status-row"><div class="sdot"></div>All systems operational</div>
  </div>
</div>

<!-- MAIN -->
<div class="main">
  <!-- TOPBAR -->
  <div class="topbar">
    <div class="search">
      <span class="search-icon">🔍</span>
      <input placeholder="Search anything... &nbsp;&nbsp;⌘K"/>
    </div>
    <div class="topbar-right">
      <div class="icon-btn">⚙</div>
      <div class="icon-btn notif">🔔<div class="notif-dot"></div></div>
      <div class="avatar-btn">S</div>
    </div>
  </div>

  <!-- CONTENT -->
  <div class="content">
    <div class="page-header">
      <div><div class="page-title">Dashboard</div><div class="page-sub">Sahil-Hub-Cloud / ACIE · Last updated just now</div></div>
      <div class="header-right">
        <button class="btn-sm btn-outline">Export</button>
        <button class="btn-sm btn-primary">+ New Analysis</button>
      </div>
    </div>

    <!-- STATS -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-top"><div class="stat-icon" style="background:rgba(16,185,129,0.1)">📊</div><span class="stat-trend trend-up">↑ 20%</span></div>
        <div class="stat-val">48</div>
        <div class="stat-label">PRs Analyzed</div>
        <div class="stat-sub">↑ 8 from last month</div>
      </div>
      <div class="stat-card">
        <div class="stat-top"><div class="stat-icon" style="background:rgba(124,58,237,0.1)">🤖</div><span class="stat-trend trend-up">↑ 35%</span></div>
        <div class="stat-val">94%</div>
        <div class="stat-label">Detection Rate</div>
        <div class="stat-sub">↑ 5% from last month</div>
      </div>
      <div class="stat-card">
        <div class="stat-top"><div class="stat-icon" style="background:rgba(59,130,246,0.1)">⚡</div><span class="stat-trend trend-up">↑ 12%</span></div>
        <div class="stat-val">2.1s</div>
        <div class="stat-label">Avg Response</div>
        <div class="stat-sub">↓ faster than last week</div>
      </div>
      <div class="stat-card">
        <div class="stat-top"><div class="stat-icon" style="background:rgba(245,158,11,0.1)">👥</div><span class="stat-trend trend-up">↑ 3 new</span></div>
        <div class="stat-val">5</div>
        <div class="stat-label">Team Members</div>
        <div class="stat-sub">↑ 3 new this week</div>
      </div>
    </div>

    <!-- MAIN GRID -->
    <div class="grid-main">
      <!-- PR FEED -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Recent Activity</div>
          <span class="panel-action">View all</span>
        </div>
        <div class="pr-row">
          <div class="pr-avatar" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">S</div>
          <div class="pr-info"><div class="pr-name">Fix authentication token loop</div><div class="pr-meta">Pushed by Sahil · 2m ago · 1 file</div></div>
          <div class="risk-badge r-low">LOW</div>
        </div>
        <div class="pr-row">
          <div class="pr-avatar" style="background:linear-gradient(135deg,#0891b2,#3b82f6)">S</div>
          <div class="pr-info"><div class="pr-name">Add payment processing module</div><div class="pr-meta">Pushed by Sahil · 1h ago · 3 files</div></div>
          <div class="risk-badge r-med">MEDIUM</div>
        </div>
        <div class="pr-row">
          <div class="pr-avatar" style="background:linear-gradient(135deg,#059669,#10b981)">S</div>
          <div class="pr-info"><div class="pr-name">Database schema migration v2</div><div class="pr-meta">Pushed by Sahil · 3h ago · 6 files</div></div>
          <div class="risk-badge r-high">HIGH</div>
        </div>
        <div class="pr-row">
          <div class="pr-avatar" style="background:linear-gradient(135deg,#b45309,#f59e0b)">S</div>
          <div class="pr-info"><div class="pr-name">Refactor: improve performance</div><div class="pr-meta">Pushed by Sahil · 5h ago · 2 files</div></div>
          <div class="risk-badge r-low">LOW</div>
        </div>
      </div>

      <!-- GITHUB HEATMAP -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">GitHub Activity</div>
          <div class="live-badge"><div class="live-dot"></div>Live</div>
        </div>
        <div class="heatmap-labels"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>
        <div class="heatmap" id="heatmap"></div>
      </div>

      <!-- HEALTH -->
      <div class="panel">
        <div class="panel-header"><div class="panel-title">Project Health</div></div>
        <div class="gauge-wrap">
          <div class="gauge-ring"><div class="gauge-val">94%</div></div>
          <div class="gauge-label">Excellent</div>
        </div>
        <div class="progress-row">
          <div class="progress-top"><span class="progress-name">Performance</span><span class="progress-val" style="color:var(--green)">95</span></div>
          <div class="bar"><div class="bar-fill" style="width:95%;background:var(--green)"></div></div>
        </div>
        <div class="progress-row">
          <div class="progress-top"><span class="progress-name">Security</span><span class="progress-val" style="color:var(--blue)">90</span></div>
          <div class="bar"><div class="bar-fill" style="width:90%;background:var(--blue)"></div></div>
        </div>
        <div class="progress-row">
          <div class="progress-top"><span class="progress-name">Code Quality</span><span class="progress-val" style="color:var(--purple)">93</span></div>
          <div class="bar"><div class="bar-fill" style="width:93%;background:var(--purple)"></div></div>
        </div>
        <div class="progress-row">
          <div class="progress-top"><span class="progress-name">Test Coverage</span><span class="progress-val" style="color:var(--yellow)">61</span></div>
          <div class="bar"><div class="bar-fill" style="width:61%;background:var(--yellow)"></div></div>
        </div>
      </div>
    </div>

    <!-- BOTTOM GRID -->
    <div class="grid-bottom">
      <!-- PIPELINE -->
      <div class="panel">
        <div class="panel-header"><div class="panel-title">CI/CD Pipeline</div><span class="panel-action">View Pipeline</span></div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:12px">Production Pipeline · #245 · main</div>
        <div class="pipeline-row">
          <div class="pipe-step"><div class="pipe-dot pipe-done">✓</div><div class="pipe-label">Build</div><div class="pipe-time">2m 15s</div></div>
          <div class="pipe-line"></div>
          <div class="pipe-step"><div class="pipe-dot pipe-done">✓</div><div class="pipe-label">Test</div><div class="pipe-time">4m 30s</div></div>
          <div class="pipe-line"></div>
          <div class="pipe-step"><div class="pipe-dot pipe-done">✓</div><div class="pipe-label">Scan</div><div class="pipe-time">1m 45s</div></div>
          <div class="pipe-line"></div>
          <div class="pipe-step"><div class="pipe-dot pipe-run">→</div><div class="pipe-label">Deploy</div><div class="pipe-time">3m 20s</div></div>
        </div>
        <div style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:6px;margin-top:4px"><span style="color:var(--green)">●</span>Build passing · Deployed to Vercel</div>
      </div>

      <!-- ANALYTICS -->
      <div class="panel">
        <div class="panel-header"><div class="panel-title">Analytics</div><span class="panel-action">This Month ▾</span></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
          <div><div style="font-size:16px;font-weight:800">48</div><div style="font-size:9px;color:var(--muted)">PRs</div><div style="font-size:9px;color:var(--green)">↑18%</div></div>
          <div><div style="font-size:16px;font-weight:800">12</div><div style="font-size:9px;color:var(--muted)">HIGH risk</div><div style="font-size:9px;color:var(--red)">↑12%</div></div>
          <div><div style="font-size:16px;font-weight:800">28</div><div style="font-size:9px;color:var(--muted)">MEDIUM</div><div style="font-size:9px;color:var(--green)">↑26%</div></div>
          <div><div style="font-size:16px;font-weight:800">8</div><div style="font-size:9px;color:var(--muted)">LOW</div><div style="font-size:9px;color:var(--green)">↑9%</div></div>
        </div>
        <div class="chart-area" id="chart"></div>
        <div class="chart-labels"><span>May 1</span><span>May 8</span><span>May 15</span><span>May 22</span><span>May 29</span></div>
      </div>

      <!-- QUICK ACTIONS -->
      <div class="panel">
        <div class="panel-header"><div class="panel-title">Quick Actions</div></div>
        <div class="action-item"><span class="action-icon">📁</span><span class="action-text">New Repository</span><span class="action-arrow">→</span></div>
        <div class="action-item"><span class="action-icon">⬆</span><span class="action-text">Import from GitHub</span><span class="action-arrow">→</span></div>
        <div class="action-item"><span class="action-icon">⚙</span><span class="action-text">Create Pipeline</span><span class="action-arrow">→</span></div>
        <div class="action-item"><span class="action-icon">☁</span><span class="action-text">Deploy to Vercel</span><span class="action-arrow">→</span></div>
        <div class="action-item"><span class="action-icon">🤖</span><span class="action-text">Run AI Analysis</span><span class="action-arrow">→</span></div>
      </div>
    </div>
  </div>
</div>

<script>
// Heatmap
const hm=document.getElementById('heatmap');
const levels=['','h1','h2','h3','h4'];
for(let i=0;i<156;i++){const d=document.createElement('div');d.className='hcell '+(Math.random()<0.3?'':levels[Math.floor(Math.random()*5)]);hm.appendChild(d);}

// Chart
const chart=document.getElementById('chart');
const vals=[30,45,28,60,42,55,38,70,48,65,52,80,45,72,58,85,42,68,55,78,45,82,60,90,48,75,55,88,42,70];
const max=Math.max(...vals);
const colors=['var(--purple)','var(--blue)','var(--purple)','var(--blue)','var(--purple)','var(--purple)','var(--blue)'];
vals.forEach((v,i)=>{const b=document.createElement('div');b.className='bar-col';b.style.height=(v/max*100)+'%';b.style.background=colors[i%colors.length];b.style.opacity='0.7';chart.appendChild(b);});
</script>
</body>
</html>`);
}