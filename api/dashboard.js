export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
  :root {
    --bg: #010409; --surface: rgba(13,17,23,0.7); --border: rgba(255,255,255,0.06);
    --cyan: #00d1ff; --purple: #7000ff; --green: #3fb950; --gold: #f2994a;
    --text-p: #ffffff; --text-s: #8b949e;
  }
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: var(--bg); color: var(--text-p); font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
  .glass { background: var(--surface); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 16px; }
  .grad-text { background: linear-gradient(135deg, #fff 40%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  .layout { display: flex; height: 100vh; }
  .sidebar { width: 260px; background: #010409; border-right: 1px solid var(--border); padding: 30px 20px; display: flex; flex-direction: column; }
  .nav-link { padding: 12px 15px; color: var(--text-s); text-decoration: none; border-radius: 8px; margin-bottom: 5px; font-size: 13px; font-weight: 600; }
  .nav-link.active { background: rgba(112, 0, 255, 0.1); color: #fff; }
  .main { flex: 1; padding: 40px; overflow-y: auto; background: radial-gradient(circle at 100% 100%, #0a001a 0%, transparent 40%); }
  .widget-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
  .w-card { padding: 25px; }
  .w-val { font-size: 32px; font-weight: 800; margin-bottom: 5px; }
  .w-label { font-size: 10px; font-weight: 800; color: var(--text-s); text-transform: uppercase; }
  .panel { padding: 30px; }
</style></head><body>
  <div class="layout">
    <div class="sidebar">
      <div style="font-weight:800; font-size:22px; margin-bottom:40px;">⚡ ACIE</div>
      <a href="#" class="nav-link active">Dashboard</a>
      <a href="#" class="nav-link">Repositories</a>
      <a href="#" class="nav-link">Security Scan</a>
      <a href="#" class="nav-link">AI Copilot</a>
      <a href="#" class="nav-link">Compliance</a>
      <a href="/pricing" class="nav-link" style="margin-top:auto;">Upgrade</a>
    </div>
    <div class="main">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
        <h1>Intelligence Center</h1>
        <div class="glass" style="padding:10px 20px; font-size:12px; font-weight:800; color:var(--cyan);">Sahil-Hub-Cloud / ACIE</div>
      </div>
      <div class="widget-grid">
        <div class="glass w-card"><div class="w-val" style="color:var(--green)">98%</div><div class="w-label">Security Score</div></div>
        <div class="glass w-card"><div class="w-val">96%</div><div class="w-label">Code Quality</div></div>
        <div class="glass w-card"><div class="w-val" style="color:var(--purple)">99.2%</div><div class="w-label">Deployment Success</div></div>
        <div class="glass w-card"><div class="w-val" style="color:#ff0055">12</div><div class="w-label">Open Vulnerabilities</div></div>
      </div>
      <div class="glass panel">
        <h3 style="margin-bottom:20px;">Predictive Risk Engine</h3>
        <div style="color:var(--text-s);">All systems scanning. Neural network is mapping dependencies across 250+ nodes...</div>
      </div>
    </div>
  </div>
</body></html>`);}