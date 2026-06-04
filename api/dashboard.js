export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>ACIE Dashboard — Intelligence Center</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#050505;color:#f1f5f9;display:flex;min-height:100vh}
    
    /* Sidebar */
    .sidebar{width:260px;background:#0a0a0a;border-right:1px solid #1a1a1a;padding:32px 24px;display:flex;flex-direction:column}
    .logo{display:flex;align-items:center;gap:12px;font-weight:800;font-size:18px;margin-bottom:48px}
    .logo-box{width:32px;height:32px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);border-radius:8px;display:grid;place-items:center}
    .nav-item{padding:12px 16px;color:#64748b;text-decoration:none;font-size:14px;font-weight:500;border-radius:8px;margin-bottom:8px;transition:0.2s}
    .nav-item.active{background:#1a1a1a;color:#fff}
    .nav-item:hover:not(.active){color:#fff;background:#111}

    /* Main Content */
    .main{flex:1;padding:40px 48px;overflow-y:auto}
    .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px}
    h1{font-size:24px;font-weight:800;letter-spacing:-0.5px}
    
    /* Stat Cards */
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:40px}
    .stat-card{background:rgba(255,255,255,0.03);border:1px solid #1a1a1a;padding:24px;border-radius:16px}
    .stat-val{font-size:28px;font-weight:800;margin-bottom:4px}
    .stat-lbl{color:#475569;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px}
    
    /* Activity Feed Area */
    .content-grid{display:grid;grid-template-columns:2fr 1fr;gap:24px}
    .panel{background:rgba(255,255,255,0.02);border:1px solid #1a1a1a;border-radius:20px;padding:32px}
    .panel-h{font-size:16px;font-weight:700;margin-bottom:24px;display:flex;align-items:center;gap:10px}
    .dot{width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 10px #10b981}
    
    .feed-item{padding:16px 0;border-bottom:1px solid #111;display:flex;justify-content:space-between;align-items:center}
    .feed-item:last-child{border:none}
    .f-info{display:flex;flex-direction:column;gap:4px}
    .f-title{font-size:14px;font-weight:600;color:#fff}
    .f-meta{font-size:12px;color:#475569}
    .badge{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700}
    .b-green{background:#064e3b;color:#10b981}
    .b-red{background:#451a1a;color:#ef4444}
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="logo"><div class="logo-box">A</div>ACIE</div>
    <a href="/dashboard" class="nav-item active">Dashboard</a>
    <a href="/history" class="nav-item">PR History</a>
    <a href="/pricing" class="nav-item">Usage & Plans</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="nav-item">Repository Settings</a>
  </div>
  <div class="main">
    <div class="header">
      <h1>Intelligence Center</h1>
      <div style="color:#64748b;font-size:14px">Sahil-Hub-Cloud / ACIE</div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-val" style="color:#10b981">Live</div><div class="stat-lbl">System</div></div>
      <div class="stat-card"><div class="stat-val">100%</div><div class="stat-lbl">Uptime</div></div>
      <div class="stat-card"><div class="stat-val">3s</div><div class="stat-lbl">Response</div></div>
      <div class="stat-card"><div class="stat-val" style="color:#8b5cf6">24</div><div class="stat-lbl">PRs Scanned</div></div>
    </div>

    <div class="content-grid">
      <div class="panel">
        <div class="panel-h"><span class="dot"></span>Recent Activity</div>
        <div class="feed-item">
          <div class="f-info"><div class="f-title">PR #12: Update landing page UI</div><div class="f-meta">2 minutes ago • sahilshaik</div></div>
          <span class="badge b-green">LOW RISK</span>
        </div>
        <div class="feed-item">
          <div class="f-info"><div class="f-title">PR #11: Fix database connection</div><div class="f-meta">1 hour ago • sahilshaik</div></div>
          <span class="badge b-red">HIGH RISK</span>
        </div>
        <div class="feed-item">
          <div class="f-info"><div class="f-title">PR #10: Add new parser logic</div><div class="f-meta">3 hours ago • sahilshaik</div></div>
          <span class="badge b-green">LOW RISK</span>
        </div>
      </div>
      
      <div class="panel">
        <div class="panel-h">Health Gauge</div>
        <div style="height:150px;display:grid;place-items:center;font-size:48px;font-weight:900;color:#10b981">92%</div>
        <p style="text-align:center;color:#475569;font-size:12px;font-weight:600">OVERALL REPO HEALTH</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}