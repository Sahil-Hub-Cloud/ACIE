import fs from 'fs';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Space+Mono&display=swap');
  :root { --bg: #030712; --glass: rgba(255,255,255,0.03); --border: rgba(255,255,255,0.08); --purple: #7c3aed; --cyan: #06b6d4; --gold: #fbbf24; --green: #10b981; --red: #ff0055; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: var(--bg); color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
  .aurora { position: fixed; inset: 0; background: radial-gradient(circle at 20% 20%, #4338ca22 0, transparent 40%), radial-gradient(circle at 80% 80%, #6d28d922 0, transparent 40%); filter: blur(100px); z-index: -1; }
  .glass { background: var(--glass); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 24px; transition: 0.4s; }
  .grad-txt { background: linear-gradient(135deg, #fff 40%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .btn { padding: 16px 40px; border-radius: 12px; font-weight: 700; text-decoration: none; transition: 0.3s; display: inline-block; border: none; cursor: pointer; }
  .btn-p { background: #fff; color: #000; box-shadow: 0 0 30px rgba(255,255,255,0.2); }
  .btn-s { background: var(--glass); color: #fff; border: 1px solid var(--border); margin-left: 15px; }
`;

const landing = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${STYLE}
  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 24px; }
  h1 { font-size: clamp(40px, 8vw, 90px); font-weight: 800; line-height: 0.9; margin-bottom: 24px; letter-spacing: -4px; }
  .f-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1200px; margin: 80px auto; padding: 0 40px; }
  .f-card { padding: 30px; }
  .f-card:hover { transform: translateY(-10px) rotateX(5deg); border-color: var(--purple); box-shadow: 0 20px 40px rgba(124,58,237,0.2); }
  .icon { font-size: 24px; margin-bottom: 15px; display: block; }
</style></head><body>
  <div class="aurora"></div>
  <nav style="position:fixed; top:0; width:100%; padding:24px 60px; display:flex; justify-content:space-between; z-index:100; border-bottom:1px solid var(--border); backdrop-filter:blur(10px);">
    <div style="font-weight:800; font-size:22px; color:var(--cyan);">⚡ ACIE</div>
    <div style="display:flex; gap:40px;"><a href="/dashboard" style="color:#8b949e; text-decoration:none; font-size:14px;">Platform</a><a href="/pricing" style="color:#8b949e; text-decoration:none; font-size:14px;">Pricing</a></div>
  </nav>
  <div class="hero">
    <div style="background:rgba(6,182,212,0.1); color:var(--cyan); padding:8px 20px; border-radius:100px; font-size:11px; font-weight:800; margin-bottom:30px; letter-spacing:2px;">BUILD ● SECURE ● AUTOMATE ● SCALE</div>
    <h1>The All-in-One<br><span class="grad-txt">Google Maps for codebases.</span></h1>
    <p style="color:#8b949e; font-size:20px; max-width:700px; margin-bottom:48px;">AI-Powered DevSecOps Intelligence Platform. From code to cloud, ACIE secures and automates your engineering lifecycle.</p>
    <div><a href="/dashboard" class="btn btn-p">Start Free</a><a href="#" class="btn btn-s">Book Demo</a></div>
  </div>
  <div class="f-grid">
    <div class="glass f-card"><span class="icon">🧠</span><h3>AI Code Review</h3><p style="color:#8b949e; font-size:14px; margin-top:10px;">Automated logic audit.</p></div>
    <div class="glass f-card"><span class="icon">🛡️</span><h3>Security Scan</h3><p style="color:#8b949e; font-size:14px; margin-top:10px;">Vulnerability detection.</p></div>
    <div class="glass f-card"><span class="icon">🔍</span><h3>Vulnerability Map</h3><p style="color:#8b949e; font-size:14px; margin-top:10px;">Deep threat hunting.</p></div>
    <div class="glass f-card"><span class="icon">📦</span><h3>GitHub Sync</h3><p style="color:#8b949e; font-size:14px; margin-top:10px;">Seamless integration.</p></div>
    <div class="glass f-card"><span class="icon">⚡</span><h3>PR Intelligence</h3><p style="color:#8b949e; font-size:14px; margin-top:10px;">Impact prediction.</p></div>
    <div class="glass f-card"><span class="icon">🚀</span><h3>CI/CD Optimize</h3><p style="color:#8b949e; font-size:14px; margin-top:10px;">Faster deployments.</p></div>
    <div class="glass f-card"><span class="icon">⚖️</span><h3>Compliance</h3><p style="color:#8b949e; font-size:14px; margin-top:10px;">SOC2/GDPR automation.</p></div>
    <div class="glass f-card"><span class="icon">🤖</span><h3>AI DevOps</h3><p style="color:#8b949e; font-size:14px; margin-top:10px;">Self-healing infra.</p></div>
    <div class="glass f-card"><span class="icon">🦾</span><h3>AI Security</h3><p style="color:#8b949e; font-size:14px; margin-top:10px;">Autonomous patching.</p></div>
  </div>
</body></html>\`);}`;

const dashboard = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${STYLE}
  .layout { display: flex; height: 100vh; }
  .side { width: 280px; background: #010409; border-right: 1px solid var(--border); padding: 40px 24px; display: flex; flex-direction: column; }
  .nav-l { display: block; padding: 14px 20px; color: #8b949e; text-decoration: none; border-radius: 12px; margin-bottom: 5px; font-size: 14px; font-weight: 600; }
  .nav-l.active { background: rgba(112, 0, 255, 0.1); color: #fff; border: 1px solid rgba(112,0,255,0.2); }
  .main { flex: 1; padding: 50px; overflow-y: auto; background: radial-gradient(circle at bottom right, #0a001a, transparent); }
  .w-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
  .w-card { padding: 30px; text-align: center; }
  .w-val { font-size: 36px; font-weight: 800; margin-bottom: 4px; }
  .w-lbl { font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px; }
  .gauge { width: 120px; height: 120px; border-radius: 50%; border: 8px solid var(--glass); border-top-color: var(--purple); display: grid; place-items: center; margin: 0 auto 20px; font-size: 24px; font-weight: 800; }
</style></head><body>
  <div class="layout">
    <div class="side"><div style="font-weight:800; font-size:24px; margin-bottom:60px;">⚡ ACIE</div>
      <a href="#" class="nav-l active">Dashboard</a><a href="#" class="nav-l">Security</a><a href="#" class="nav-l">AI Copilot</a><a href="#" class="nav-l">Analytics</a><a href="/pricing" class="nav-l" style="margin-top:auto; color:var(--gold);">👑 Go Enterprise</a>
    </div>
    <div class="main">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:48px;">
        <h1 style="font-size:32px; font-weight:900;">Intelligence Center</h1>
        <div class="glass" style="padding:10px 24px; font-size:12px; font-weight:800; color:var(--cyan);">SYSTEM: ONLINE</div>
      </div>
      <div class="w-grid">
        <div class="glass w-card"><div class="w-val" style="color:var(--green)">98%</div><div class="w-lbl">Security Score</div></div>
        <div class="glass w-card"><div class="w-val">96%</div><div class="w-lbl">Code Quality</div></div>
        <div class="glass w-card"><div class="w-val" style="color:var(--purple)">99.2%</div><div class="w-lbl">Deployment Success</div></div>
        <div class="glass w-card"><div class="w-val" style="color:var(--red)">12</div><div class="w-lbl">Open Vulnerabilities</div></div>
      </div>
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
        <div class="glass" style="padding:40px;"><h3>Predictive Risk Engine</h3><p style="color:#8b949e; margin-top:20px;">AI is mapping 250+ dependency nodes. Architecture stability is optimal.</p></div>
        <div class="glass" style="padding:40px; text-align:center;"><h3>Health Index</h3><div class="gauge">94%</div><div class="w-lbl">Overall Repo Health</div></div>
      </div>
    </div>
  </div>
</body></html>\`);}`;

fs.writeFileSync('api/landing.js', landing);
fs.writeFileSync('api/dashboard.js', dashboard);
console.log('✅ TITAN-X MISSION: BILLION-DOLLAR VISION ACTIVE');