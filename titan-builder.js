import fs from 'fs';

const THEME = `
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
`;

const landing = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${THEME}
  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: radial-gradient(circle at 50% 0%, #1a0033 0%, transparent 50%); }
  .badge-row { display: flex; gap: 10px; margin-bottom: 20px; font-size: 11px; font-weight: 800; color: var(--cyan); }
  .h1 { font-size: clamp(40px, 8vw, 90px); font-weight: 800; line-height: 0.9; margin-bottom: 30px; letter-spacing: -4px; }
  .btn-group { display: flex; gap: 20px; }
  .btn { padding: 16px 40px; border-radius: 12px; font-weight: 700; text-decoration: none; transition: 0.3s; }
  .btn-p { background: #fff; color: #000; box-shadow: 0 0 30px rgba(255,255,255,0.2); }
  .btn-s { border: 1px solid var(--border); color: #fff; }
  .integration-bar { margin-top: 60px; padding: 20px; border-top: 1px solid var(--border); display: flex; gap: 40px; opacity: 0.5; }
</style></head><body>
  <nav style="position:fixed; top:0; width:100%; padding:20px 60px; display:flex; justify-content:space-between; z-index:100;">
    <div style="font-weight:800; font-size:20px;">⚡ ACIE</div>
    <div style="display:flex; gap:30px; font-size:14px;"><a href="/dashboard" style="color:var(--text-s); text-decoration:none;">Platform</a><a href="/pricing" style="color:var(--text-s); text-decoration:none;">Pricing</a></div>
  </nav>
  <div class="hero">
    <div class="badge-row"><span>● BUILD</span><span>● SECURE</span><span>● AUTOMATE</span><span>● GROW</span></div>
    <h1 class="h1">Build. Secure.<br><span class="grad-text">Automate. Scale.</span></h1>
    <p style="color:var(--text-s); font-size:20px; max-width:650px; margin-bottom:40px;">The All-in-One DevSecOps Intelligence Platform from code to cloud.</p>
    <div class="btn-group"><a href="/dashboard" class="btn btn-p">Start Free</a><a href="#" class="btn btn-s">Book Demo</a></div>
    <div class="integration-bar"><span>GITHUB</span><span>AWS</span><span>DOCKER</span><span>KUBERNETES</span><span>JENKINS</span></div>
  </div>
</body></html>\`);}`;

const dashboard = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${THEME}
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
</body></html>\`);}`;

const pricing = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${THEME}
  .container { max-width: 1100px; margin: 100px auto; text-align: center; }
  .p-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 60px; }
  .p-card { padding: 50px 30px; position: relative; overflow: hidden; }
  .p-card.featured { border-color: var(--purple); background: linear-gradient(to bottom, rgba(112,0,255,0.05), transparent); }
  .price { font-size: 50px; font-weight: 800; margin: 20px 0; }
  .features { list-style: none; text-align: left; margin-bottom: 30px; }
  .features li { font-size: 14px; color: var(--text-s); margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
  .features li::before { content: "✔"; color: var(--cyan); }
</style></head><body>
  <div class="container">
    <h1 style="font-size:50px;">Billion-Dollar Infrastructure Plans</h1>
    <div class="p-grid">
      <div class="glass p-card"><h3>Starter</h3><div class="price">$0</div><ul class="features"><li>1 Repo</li><li>AI Code Review</li><li>Security Scanning</li></ul></div>
      <div class="glass p-card featured"><h3>Professional</h3><div class="price">$29</div><ul class="features"><li>10 Repos</li><li>Predictive Risk Engine</li><li>Slack/Email Alerts</li><li>AI DevOps Engineer</li></ul></div>
      <div class="glass p-card" style="border-color:var(--gold);"><h3>Enterprise</h3><div class="price">Custom</div><ul class="features"><li>Unlimited Repos</li><li>Compliance Automation</li><li>AI CTO Dashboard</li><li>Dedicated Support</li></ul></div>
    </div>
  </div>
</body></html>\`);}`;

fs.writeFileSync('api/landing.js', landing);
fs.writeFileSync('api/dashboard.js', dashboard);
fs.writeFileSync('api/pricing.js', pricing);
console.log('TITAN-V2 ARCHITECTURE DEPLOYED');