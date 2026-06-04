export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  :root {
    --bg: #020617; --sidebar: #010409; --border: rgba(255,255,255,0.08);
    --purple: #7c3aed; --blue: #3b82f6; --text: #f8fafc; --sub: #94a3b8;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
  .glass { background: rgba(255,255,255,0.02); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: 16px; transition: 0.3s; }
  .btn { display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: 0.2s; cursor: pointer; }
  .btn-p { background: var(--purple); color: #fff; border: none; }
  .btn-p:hover { background: #6d28d9; transform: translateY(-1px); }
  .btn-s { background: transparent; color: #fff; border: 1px solid var(--border); }
  .btn-s:hover { background: rgba(255,255,255,0.05); }

  .layout { display: flex; height: 100vh; }
  .sidebar { width: 260px; background: var(--sidebar); border-right: 1px solid var(--border); padding: 32px 20px; }
  .main { flex: 1; padding: 48px; overflow-y: auto; }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
  .s-card { padding: 24px; text-align: center; }
  .nav-l { display: block; padding: 12px 16px; color: var(--sub); text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; margin-bottom: 4px; }
  .nav-l.active { background: rgba(124,58,237,0.1); color: #fff; }
</style></head><body>
  <div class="layout">
    <div class="sidebar">
      <div style="font-weight:800; font-size:20px; margin-bottom:40px;">⚡ ACIE</div>
      <a href="/dashboard" class="nav-l active">Overview</a>
      <a href="/history" class="nav-l">Analysis Logs</a>
      <a href="/pricing" class="nav-l">Settings & Plans</a>
    </div>
    <div class="main">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;"><h1>Intelligence Dashboard</h1><div class="glass" style="padding:8px 16px; font-size:12px; color:var(--purple); font-weight:600;">Sahil-Hub-Cloud / ACIE</div></div>
      <div class="stat-grid">
        <div class="glass s-card"><div style="font-size:24px; font-weight:800; color:#10b981">98%</div><div style="font-size:11px; color:var(--sub); margin-top:4px;">HEALTH</div></div>
        <div class="glass s-card"><div style="font-size:24px; font-weight:800;">48</div><div style="font-size:11px; color:var(--sub); margin-top:4px;">SCANS</div></div>
        <div class="glass s-card"><div style="font-size:24px; font-weight:800; color:var(--purple)">12ms</div><div style="font-size:11px; color:var(--sub); margin-top:4px;">LATENCY</div></div>
        <div class="glass s-card"><div style="font-size:24px; font-weight:800;">0</div><div style="font-size:11px; color:var(--sub); margin-top:4px;">LEAKS</div></div>
      </div>
      <div class="glass" style="padding:40px;"><h3 style="margin-bottom:20px;">Analysis Stream</h3><p style="color:var(--sub);">Listening for GitHub Webhooks... All systems operational.</p></div>
    </div>
  </div>
</body></html>`);}