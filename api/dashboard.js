export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Inter:wght@400;500;600;700&display=swap');
  :root {
    --bg: #010409; --surface: rgba(13,17,23,0.8); --border: rgba(255,255,255,0.08);
    --cyan: #00d1ff; --purple: #7000ff; --green: #3fb950; --gold: #f2994a;
    --text-p: #ffffff; --text-s: #8b949e;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: var(--bg); color: var(--text-p); font-family: 'Inter', sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .glass { background: var(--surface); backdrop-filter: blur(24px); border: 1px solid var(--border); border-radius: 20px; transition: 0.3s cubic-bezier(0.2, 0, 0, 1); }
  .grad-text { background: linear-gradient(135deg, #fff 40%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .orb { position: fixed; border-radius: 50%; filter: blur(100px); z-index: -1; opacity: 0.4; pointer-events: none; }

  .layout { display: flex; height: 100vh; }
  .sidebar { width: 280px; background: #010409; border-right: 1px solid var(--border); padding: 40px 24px; display: flex; flex-direction: column; }
  .nav-link { display: block; padding: 14px 18px; color: var(--text-s); text-decoration: none; border-radius: 12px; margin-bottom: 6px; font-size: 14px; font-weight: 600; transition: 0.2s; }
  .nav-link.active { background: rgba(112, 0, 255, 0.12); color: #fff; border: 1px solid rgba(112, 0, 255, 0.2); }
  .main { flex: 1; padding: 50px; overflow-y: auto; background: radial-gradient(circle at 100% 100%, #0a001a 0%, transparent 40%); }
  .widget-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
  .w-card { padding: 25px; text-align: center; }
  .w-val { font-size: 34px; font-weight: 800; margin-bottom: 4px; letter-spacing: -1px; }
  .w-label { font-size: 11px; font-weight: 700; color: var(--text-s); text-transform: uppercase; letter-spacing: 1px; }
</style></head><body>
  <div class="layout">
    <div class="sidebar">
      <div style="font-weight:800; font-size:24px; margin-bottom:50px;">⚡ ACIE</div>
      <a href="#" class="nav-link active">Dashboard</a>
      <a href="#" class="nav-link">Repositories</a>
      <a href="#" class="nav-link">Security Scan</a>
      <a href="#" class="nav-link">AI Copilot</a>
      <a href="#" class="nav-link">Analytics</a>
      <a href="/pricing" class="nav-link" style="margin-top:auto; color:var(--gold);">🚀 Upgrade to Pro</a>
    </div>
    <div class="main">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:48px;">
        <h1 style="font-size:32px; font-weight:800; letter-spacing:-1px;">Intelligence Center</h1>
        <div class="glass" style="padding:10px 24px; font-size:12px; font-weight:800; color:var(--cyan); letter-spacing:1px;">REPOSTORY: ACIE_CORE</div>
      </div>
      <div class="widget-grid">
        <div class="glass w-card"><div class="w-val" style="color:var(--green)">98%</div><div class="w-label">Security Score</div></div>
        <div class="glass w-card"><div class="w-val">96%</div><div class="w-label">Code Quality</div></div>
        <div class="glass w-card"><div class="w-val" style="color:var(--purple)">99.2%</div><div class="w-label">Deployment Success</div></div>
        <div class="glass w-card"><div class="w-val" style="color:#ff0055">12</div><div class="w-label">Vulnerabilities</div></div>
      </div>
      <div class="glass" style="padding:40px;">
        <h3 style="margin-bottom:20px; font-family:'Plus Jakarta Sans';">Predictive Risk Engine</h3>
        <p style="color:var(--text-s); line-height:1.8;">ACIE is currently mapping architectural dependencies across your git infrastructure. No critical dependency loops detected in the last 24 hours.</p>
      </div>
    </div>
  </div>
</body></html>`);}