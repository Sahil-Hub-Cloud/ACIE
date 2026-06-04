import fs from 'fs';

const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Space+Mono&display=swap');
  :root { --bg: #010309; --glass: rgba(255,255,255,0.02); --border: rgba(255,255,255,0.08); --cyan: #00d1ff; --purple: #7c3aed; --green: #10b981; --red: #ff0055; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: var(--bg); color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  
  /* Aurora Animation */
  .aurora { position: fixed; inset: 0; background: radial-gradient(circle at 20% 20%, #4338ca15 0, transparent 40%), radial-gradient(circle at 80% 80%, #6d28d915 0, transparent 40%); filter: blur(100px); z-index: -1; animation: aurora-pulse 10s infinite alternate; }
  @keyframes aurora-pulse { from { opacity: 0.3; } to { opacity: 0.7; } }

  .glass { background: var(--glass); backdrop-filter: blur(24px); border: 1px solid var(--border); border-radius: 20px; transition: 0.4s; }
  .grad-txt { background: linear-gradient(135deg, #fff 40%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  
  /* Live Pulse Dot */
  .pulse-dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; display: inline-block; box-shadow: 0 0 10px var(--green); animation: pulse 2s infinite; margin-right: 8px; }
  @keyframes pulse { 0% { transform: scale(0.9); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(0.9); opacity: 1; } }
`;

const landing = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${GLOBAL_STYLE}
  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 24px; }
  h1 { font-size: clamp(45px, 8vw, 95px); font-weight: 800; line-height: 0.9; margin-bottom: 24px; letter-spacing: -4px; }
  .btn { padding: 18px 48px; border-radius: 100px; font-weight: 700; text-decoration: none; transition: 0.3s; font-size: 15px; }
  .btn-p { background: #fff; color: #000; box-shadow: 0 0 30px rgba(255,255,255,0.2); }
  .terminal { width: 100%; max-width: 600px; height: 200px; background: #000; border: 1px solid var(--border); border-radius: 12px; margin-top: 50px; padding: 20px; font-family: 'Space Mono'; font-size: 12px; color: var(--cyan); text-align: left; overflow: hidden; position: relative; }
  .terminal::after { content: ''; position: absolute; inset: 0; background: linear-gradient(transparent, #000); }
  .line { margin-bottom: 5px; animation: slideUp 5s infinite; }
  @keyframes slideUp { 0% { transform: translateY(0); } 100% { transform: translateY(-100%); } }
</style></head><body>
  <div class="aurora"></div>
  <nav style="position:fixed; top:0; width:100%; padding:24px 60px; display:flex; justify-content:space-between; z-index:100; border-bottom:1px solid var(--border); backdrop-filter:blur(10px);">
    <div style="font-weight:800; font-size:22px;">⚡ ACIE</div>
    <div style="display:flex; gap:30px; font-size:13px; font-weight:600; align-items:center;">
       <span style="color:var(--green);"><span class="pulse-dot"></span>SYSTEM LIVE</span>
       <a href="/dashboard" style="color:#fff; text-decoration:none;">Dashboard</a>
    </div>
  </nav>
  <div class="hero">
    <h1 class="h1">The All-in-One<br><span class="grad-txt">Google Maps for codebases.</span></h1>
    <p style="color:#8b949e; font-size:19px; max-width:600px; margin-bottom:40px;">Predict architectural breaks before they happen. Automated AI analysis for modern engineering teams.</p>
    <div><a href="/dashboard" class="btn btn-p">Get Started Free</a></div>
    <div class="terminal">
      <div class="line">> PR_9921: Scanning architectural nodes...</div>
      <div class="line">> Detected circular dependency in /auth/token.js</div>
      <div class="line">> Calculating blast radius for 42 modules...</div>
      <div class="line">> Risk Score: MEDIUM (84%)</div>
      <div class="line">> Posting summary to GitHub...</div>
      <div class="line">> Scan Complete. Performance: 0.8s</div>
    </div>
  </div>
</body></html>\`);}`;

const dashboard = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><style>${GLOBAL_STYLE}
  .layout { display: flex; height: 100vh; }
  .side { width: 260px; background: #010409; border-right: 1px solid var(--border); padding: 30px 20px; display: flex; flex-direction: column; }
  .nav-l { display: block; padding: 12px 18px; color: #8b949e; text-decoration: none; border-radius: 10px; margin-bottom: 5px; font-size: 13px; font-weight: 600; transition: 0.2s; }
  .nav-l.active { background: rgba(112, 0, 255, 0.1); color: #fff; border: 1px solid rgba(112, 0, 255, 0.2); }
  .main { flex: 1; padding: 40px; overflow-y: auto; background: radial-gradient(circle at top right, #0a001a, transparent); }
  .w-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
  .w-card { padding: 25px; border-radius: 16px; position: relative; overflow: hidden; }
  .w-card::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--purple), transparent); }
  .w-val { font-size: 32px; font-weight: 800; margin-bottom: 4px; }
  .w-lbl { font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px; }
  .gauge-wrap { width: 140px; height: 140px; margin: 0 auto 20px; position: relative; }
  svg { transform: rotate(-90deg); }
  circle { fill: none; stroke-width: 8; stroke-linecap: round; }
  .bg-c { stroke: var(--border); }
  .fg-c { stroke: var(--purple); stroke-dasharray: 314; stroke-dashoffset: 20; transition: stroke-dashoffset 2s ease-in-out; }
  .g-txt { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 32px; font-weight: 900; }
</style></head><body>
  <div class="layout">
    <div class="side"><div style="font-weight:800; font-size:22px; margin-bottom:50px;">⚡ ACIE</div>
      <a href="#" class="nav-l active">Overview</a><a href="#" class="nav-l">Security</a><a href="#" class="nav-l">AI Copilot</a>
      <div style="margin-top:auto; padding:20px; background:rgba(251,191,36,0.05); border:1px solid rgba(251,191,36,0.1); border-radius:12px;">
        <div style="font-size:11px; font-weight:800; color:var(--gold); margin-bottom:8px;">UPGRADE</div>
        <div style="font-size:12px; color:#8b949e;">Get Unlimited Scans & SOC2 Reporting.</div>
      </div>
    </div>
    <div class="main">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
        <h1 style="font-size:28px; font-weight:900;">Intelligence Dashboard</h1>
        <div class="glass" style="padding:10px 20px; font-size:11px; font-weight:800; color:var(--cyan);"><span class="pulse-dot"></span>REPOSTORY: ACIE_CORE</div>
      </div>
      <div class="w-grid">
        <div class="glass w-card"><div class="w-val" style="color:var(--green)">98%</div><div class="w-lbl">Security Score</div></div>
        <div class="glass w-card"><div class="w-val">96%</div><div class="w-lbl">Code Quality</div></div>
        <div class="glass w-card"><div class="w-val" style="color:var(--purple)">99.2%</div><div class="w-lbl">Deploy Rate</div></div>
        <div class="glass w-card"><div class="w-val" style="color:var(--red)">12</div><div class="w-lbl">Vulns Found</div></div>
      </div>
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
        <div class="glass" style="padding:30px;">
           <div style="font-weight:800; font-size:14px; margin-bottom:20px; color:var(--cyan);">LIVE IMPACT FEED</div>
           <div style="font-family:'Space Mono'; font-size:13px; color:#475569;">
             <div style="margin-bottom:10px;">[14:22:01] PR #12: Scanning imports in <span style="color:#fff;">/src/api/auth.js</span>...</div>
             <div style="margin-bottom:10px;">[14:22:05] Analyzing export dependency graph...</div>
             <div style="margin-bottom:10px; color:var(--green);">[14:22:08] No architectural breaks detected. Report posted.</div>
           </div>
        </div>
        <div class="glass" style="padding:30px; text-align:center;">
          <div style="font-weight:800; font-size:14px; margin-bottom:20px;">HEALTH INDEX</div>
          <div class="gauge-wrap"><svg width="140" height="140"><circle class="bg-c" cx="70" cy="70" r="50"></circle><circle class="fg-c" cx="70" cy="70" r="50"></circle></svg><div class="g-txt">94%</div></div>
          <div class="w-lbl">Overall Reliability</div>
        </div>
      </div>
    </div>
  </div>
</body></html>\`);}`;

fs.writeFileSync('api/landing.js', landing);
fs.writeFileSync('api/dashboard.js', dashboard);
console.log('✅ MISSION COMPLETE: LIVE INTELLIGENCE LAYER DEPLOYED');