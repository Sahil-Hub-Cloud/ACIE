import fs from 'fs';

const CSS_SYSTEM = `
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
`;

const landingHTML = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${CSS_SYSTEM}
  .nav { position:fixed; top:0; width:100%; height:80px; display:flex; align-items:center; justify-content:space-between; padding:0 60px; z-index:100; border-bottom:1px solid var(--border); backdrop-filter:blur(10px); }
  .hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:0 24px; }
  .hero h1 { font-size: clamp(50px, 8vw, 110px); font-weight: 800; line-height: 0.9; margin-bottom: 24px; }
  .btn { padding: 18px 48px; background: #fff; color: #000; border-radius: 100px; font-weight: 700; text-decoration:none; font-size: 16px; box-shadow: 0 0 30px rgba(255,255,255,0.2); transition: 0.3s; }
  .btn:hover { transform: scale(1.05); box-shadow: 0 0 50px rgba(255,255,255,0.4); }
  .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1200px; margin: 0 auto 100px; padding: 0 40px; }
  .card-f { padding: 40px; }
</style></head><body>
  <div class="aurora"><div class="orb orb-1"></div><div class="orb orb-2"></div></div>
  <nav class="nav"><div style="font-weight:800; font-size:24px;">⚡ ACIE</div><div style="display:flex; gap:40px;"><a href="/dashboard" style="color:#94a3b8; text-decoration:none;">Platform</a><a href="/pricing" style="color:#94a3b8; text-decoration:none;">Pricing</a></div></nav>
  <div class="hero">
    <div style="background:rgba(124,58,237,0.1); color:var(--purple); padding:8px 20px; border-radius:100px; font-size:12px; font-weight:700; margin-bottom:30px;">[ INTELLIGENCE LAYER ACTIVE ]</div>
    <h1>Build. Secure.<br><span class="grad-text">Automate. Scale.</span></h1>
    <p style="color:#64748b; font-size:20px; margin-bottom:48px; max-width:600px;">The AI-Powered DevSecOps Intelligence Platform for Modern Engineering Teams.</p>
    <a href="/dashboard" class="btn">Launch Interface</a>
  </div>
  <div class="feature-grid">
    <div class="glass card-f"><h3>AI Code Review</h3><p style="color:#64748b; margin-top:10px;">Automated deep-logic analysis on every PR.</p></div>
    <div class="glass card-f"><h3>Security Shield</h3><p style="color:#64748b; margin-top:10px;">Real-time vulnerability and secret detection.</p></div>
    <div class="glass card-f"><h3>Predictive Risk</h3><p style="color:#64748b; margin-top:10px;">Predict architectural breaks before they happen.</p></div>
  </div>
</body></html>\`);}`;

const dashboardHTML = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${CSS_SYSTEM}
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
</body></html>\`);}`;

fs.writeFileSync('api/landing.js', landingHTML);
fs.writeFileSync('api/dashboard.js', dashboardHTML);
console.log('TITAN UI DEPLOYED SUCCESSFULLY');