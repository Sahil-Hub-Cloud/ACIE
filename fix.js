import fs from 'fs';

const TITAN_CSS = `
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
`;

const landing = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${TITAN_CSS}
  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: radial-gradient(circle at 50% 0%, #1a0033 0%, transparent 60%); }
  .badge-row { display: flex; gap: 12px; margin-bottom: 30px; font-size: 10px; font-weight: 800; color: var(--cyan); letter-spacing: 2px; }
  h1 { font-size: clamp(50px, 8vw, 100px); font-family: 'Plus Jakarta Sans'; font-weight: 800; line-height: 0.85; margin-bottom: 24px; letter-spacing: -5px; }
  p { color: var(--text-s); font-size: 20px; max-width: 600px; line-height: 1.6; margin-bottom: 48px; }
  .btn { padding: 18px 48px; border-radius: 14px; font-weight: 700; text-decoration: none; transition: 0.3s; font-size: 16px; }
  .btn-p { background: #fff; color: #000; box-shadow: 0 0 40px rgba(255,255,255,0.25); }
  .btn-s { border: 1px solid var(--border); color: #fff; margin-left: 15px; }
</style></head><body>
  <div class="orb" style="width:600px; height:600px; background:radial-gradient(circle, var(--purple), transparent 70%); top:-200px; left:-100px;"></div>
  <nav style="position:fixed; top:0; width:100%; height:80px; display:flex; align-items:center; justify-content:space-between; padding:0 60px; z-index:100; border-bottom:1px solid var(--border); backdrop-filter:blur(10px);">
    <div style="font-weight:800; font-size:22px;">⚡ ACIE</div>
    <div style="display:flex; gap:40px; font-size:13px; font-weight:600;"><a href="/dashboard" style="color:var(--text-s); text-decoration:none;">Platform</a><a href="/pricing" style="color:var(--text-s); text-decoration:none;">Pricing</a><a href="https://github.com/Sahil-Hub-Cloud/ACIE" style="color:var(--text-s); text-decoration:none;">Docs</a></div>
  </nav>
  <div class="hero">
    <div class="badge-row"><span>● BUILD</span><span>● SECURE</span><span>● AUTOMATE</span><span>● GROW</span></div>
    <h1>The All-in-One<br><span class="grad-text">Google Maps for codebases.</span></h1>
    <p>Predict architectural breaks before they happen. ACIE secures, analyzes, and automates your engineering lifecycle with AI.</p>
    <div style="display:flex;"><a href="/dashboard" class="btn btn-p">Start Free</a><a href="#" class="btn btn-s">Book Demo</a></div>
  </div>
</body></html>\`);}`;

const dashboard = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${TITAN_CSS}
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
</body></html>\`);}`;

const pricing = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${TITAN_CSS}
  .container { max-width: 1100px; margin: 120px auto; text-align: center; }
  .p-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 60px; }
  .p-card { padding: 50px 30px; display: flex; flex-direction: column; }
  .p-card.pro { border-color: var(--purple); background: linear-gradient(to bottom, rgba(112,0,255,0.05), transparent); }
  .price { font-size: 54px; font-weight: 800; margin: 30px 0; }
  .features { list-style: none; text-align: left; margin-bottom: 40px; flex-grow: 1; }
  .features li { font-size: 14px; color: var(--text-s); margin-bottom: 15px; display: flex; align-items: center; gap: 12px; }
  .features li::before { content: "✔"; color: var(--cyan); font-weight: 900; }
  .btn { padding: 15px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; text-align: center; background: #fff; color: #000; }
</style></head><body>
  <div class="container">
    <h1 style="font-size:56px; margin-bottom:15px;">Elite Infrastructure Plans</h1>
    <p style="color:var(--text-s); font-size:18px;">Power your engineering team with surgical AI intelligence.</p>
    <div class="p-grid">
      <div class="glass p-card"><h3>Starter</h3><div class="price">$0</div><ul class="features"><li>1 Repository</li><li>Blast Radius Map</li><li>AI PR Comments</li></ul><a href="#" class="btn">Get Started</a></div>
      <div class="glass p-card pro"><h3>Professional</h3><div class="price">$29</div><ul class="features"><li>10 Repositories</li><li>Security Guard Scanning</li><li>Predictive Risk Score</li><li>Priority Support</li></ul><a href="#" class="btn" style="background:var(--purple); color:#fff;">Start Free Trial</a></div>
      <div class="glass p-card"><h3>Enterprise</h3><div class="price">Custom</div><ul class="features"><li>Unlimited Repos</li><li>Compliance Automation</li><li>AI CTO Dashboard</li><li>Dedicated SSO</li></ul><a href="#" class="btn">Contact Sales</a></div>
    </div>
  </div>
</body></html>\`);}`;

fs.writeFileSync('api/landing.js', landing);
fs.writeFileSync('api/dashboard.js', dashboard);
fs.writeFileSync('api/pricing.js', pricing);
console.log('✅ TITAN-V2 MISSION COMPLETE: GOOGLE MAPS FOR CODE ACTIVE');