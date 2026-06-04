import fs from 'fs';

const CSS = `
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
`;

const landing = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${CSS}
  .nav { position:fixed; top:0; width:100%; height:72px; display:flex; align-items:center; justify-content:space-between; padding:0 60px; z-index:100; border-bottom:1px solid var(--border); background: rgba(2,6,23,0.8); backdrop-filter:blur(10px); }
  .hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:0 24px; }
  h1 { font-size: clamp(40px, 8vw, 90px); font-weight: 800; letter-spacing: -3px; line-height: 0.9; margin-bottom: 24px; }
  .grad { background: linear-gradient(to right, #fff, var(--sub)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1200px; margin: 0 auto 100px; padding: 0 40px; }
  .f-card { padding: 40px; }
</style></head><body>
  <nav class="nav"><div style="font-weight:800; font-size:22px;">⚡ ACIE</div><div style="display:flex; gap:30px;"><a href="/dashboard" style="color:var(--sub); text-decoration:none; font-size:14px;">Dashboard</a><a href="/pricing" style="color:var(--sub); text-decoration:none; font-size:14px;">Pricing</a></div></nav>
  <div class="hero"><h1>Build. Secure.<br><span class="grad">Automate. Scale.</span></h1><p style="color:var(--sub); font-size:20px; margin-bottom:40px; max-width:600px;">The AI-Powered DevSecOps Intelligence Platform for Modern Engineering Teams.</p><div style="display:flex; gap:15px;"><a href="/dashboard" class="btn btn-p">Get Started Free</a><a href="/pricing" class="btn btn-s">View Pricing</a></div></div>
  <div class="grid">
    <div class="glass f-card"><h3>Blast Radius</h3><p style="color:var(--sub); margin-top:10px;">Deep-logic dependency mapping across your entire codebase.</p></div>
    <div class="glass f-card"><h3>Security Guard</h3><p style="color:var(--sub); margin-top:10px;">Instant detection of hardcoded secrets and leaked API keys.</p></div>
    <div class="glass f-card"><h3>PR Intelligence</h3><p style="color:var(--sub); margin-top:10px;">Automated risk scoring and quality analysis for every pull request.</p></div>
  </div>
</body></html>\`);}`;

const dashboard = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${CSS}
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
</body></html>\`);}`;

const pricing = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${CSS}
  .container { max-width: 1100px; margin: 100px auto; padding: 0 24px; }
  .p-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 60px; }
  .p-card { padding: 48px 32px; display: flex; flex-direction: column; }
  .p-card.pro { border-color: var(--purple); background: linear-gradient(to bottom, rgba(124,58,237,0.05), transparent); }
  .p-name { font-size: 14px; font-weight: 700; color: var(--purple); text-transform: uppercase; letter-spacing: 1px; }
  .p-price { font-size: 48px; font-weight: 800; margin: 24px 0; }
  .p-price span { font-size: 16px; color: var(--sub); font-weight: 400; }
  .p-list { list-style: none; margin-bottom: 40px; flex: 1; }
  .p-list li { color: var(--sub); font-size: 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
  .p-list li::before { content: "✓"; color: var(--purple); font-weight: 800; }
</style></head><body>
  <div class="container" style="text-align:center;">
    <h1 style="font-size:48px;">Plans for every team</h1>
    <p style="color:var(--sub); font-size:18px; margin-top:16px;">Scale your code security with surgical precision.</p>
    <div class="p-grid">
      <div class="glass p-card">
        <div class="p-name">Starter</div>
        <div class="p-price">$0<span>/mo</span></div>
        <ul class="p-list">
          <li>1 GitHub Repository</li>
          <li>Blast Radius Analysis</li>
          <li>Basic PR Comments</li>
          <li>Community Support</li>
        </ul>
        <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn btn-s">Get Started</a>
      </div>
      <div class="glass p-card pro">
        <div class="p-name">Professional</div>
        <div class="p-price">$29<span>/mo</span></div>
        <ul class="p-list">
          <li>Up to 10 Repositories</li>
          <li>Full Security Guard Scanning</li>
          <li>Detailed Health Scoring</li>
          <li>Slack & Email Notifications</li>
          <li>Priority 24/7 Support</li>
        </ul>
        <a href="mailto:sahilshaik4679@gmail.com" class="btn btn-p">Start Free Trial</a>
      </div>
      <div class="glass p-card">
        <div class="p-name">Enterprise</div>
        <div class="p-price">$99<span>/mo</span></div>
        <ul class="p-list">
          <li>Unlimited Repositories</li>
          <li>Custom Security Rules</li>
          <li>SOC2 & GDPR Compliance</li>
          <li>Dedicated Account Manager</li>
          <li>Single Sign-On (SSO)</li>
        </ul>
        <a href="mailto:sahilshaik4679@gmail.com" class="btn btn-s">Talk to Sales</a>
      </div>
    </div>
  </div>
</body></html>\`);}`;

fs.writeFileSync('api/landing.js', landing);
fs.writeFileSync('api/dashboard.js', dashboard);
fs.writeFileSync('api/pricing.js', pricing);
console.log('done');