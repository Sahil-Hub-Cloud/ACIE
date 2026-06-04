export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=Inter:wght@400;500;600&display=swap');
  :root {
    --bg: #020617; --card: rgba(255,255,255,0.03); --border: rgba(255,255,255,0.08);
    --purple: #7c3aed; --cyan: #06b6d4; --gold: #fbbf24; --green: #10b981;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: var(--bg); color: #f8fafc; font-family: 'Inter', sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  
  /* Aurora Background */
  .aurora { position: fixed; inset: 0; filter: blur(100px); z-index: -1; opacity: 0.5; pointer-events: none; }
  .orb { position: absolute; border-radius: 50%; animation: float 20s infinite alternate; }
  .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, var(--purple), transparent 70%); top: -200px; left: -100px; }
  .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, var(--cyan), transparent 70%); bottom: -100px; right: -100px; opacity: 0.4; }
  @keyframes float { from { transform: translate(0,0); } to { transform: translate(100px, 50px); } }

  /* Premium Glass Cards */
  .glass { background: var(--card); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 24px; transition: 0.4s cubic-bezier(0.2, 0, 0, 1); }
  .glass:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }

  /* Typography */
  h1, h2, h3 { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.04em; }
  .grad-text { background: linear-gradient(135deg, #fff 30%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  .layout { display: flex; height: 100vh; }
  .sidebar { width: 280px; background: #010409; border-right: 1px solid var(--border); padding: 40px 24px; }
  .main { flex: 1; padding: 60px; overflow-y: auto; }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 48px; }
  .s-card { padding: 30px; text-align: center; }
  .s-val { font-size: 36px; font-weight: 800; color: #fff; }
  .feed { padding: 40px; }
  .nav-l { display: block; padding: 14px 20px; color: #64748b; text-decoration: none; border-radius: 12px; font-weight: 600; margin-bottom: 8px; }
  .nav-l.active { background: rgba(124,58,237,0.1); color: #fff; border: 1px solid rgba(124,58,237,0.2); }
</style></head><body>
  <div class="layout">
    <div class="sidebar">
      <div style="font-weight:800; font-size:22px; margin-bottom:60px;">⚡ ACIE</div>
      <a href="#" class="nav-l active">Dashboard</a>
      <a href="/history" class="nav-l">Security Logs</a>
      <a href="/pricing" class="nav-l">Billing</a>
    </div>
    <div class="main">
      <h1 style="margin-bottom:40px;">Intelligence Center</h1>
      <div class="stat-grid">
        <div class="glass s-card"><div class="s-val" style="color:var(--green)">98%</div><div style="font-size:12px; color:#475569; margin-top:8px;">HEALTH SCORE</div></div>
        <div class="glass s-card"><div class="s-val">42</div><div style="font-size:12px; color:#475569; margin-top:8px;">TOTAL SCANS</div></div>
        <div class="glass s-card"><div class="s-val" style="color:var(--purple)">12ms</div><div style="font-size:12px; color:#475569; margin-top:8px;">AI LATENCY</div></div>
        <div class="glass s-card"><div class="s-val" style="color:var(--gold)">0</div><div style="font-size:12px; color:#475569; margin-top:8px;">VULNERABILITIES</div></div>
      </div>
      <div class="glass feed">
        <h3 style="margin-bottom:30px;">Live Stream</h3>
        <div style="color:#64748b;">Waiting for incoming GitHub Webhook data...</div>
      </div>
    </div>
  </div>
</body></html>`);}