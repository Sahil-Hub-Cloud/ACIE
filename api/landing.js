export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Inter:wght@400;500;600;700&display=swap');
  :root { --bg: #010309; --glass: rgba(255,255,255,0.02); --border: rgba(255,255,255,0.08); --cyan: #00d1ff; --purple: #7c3aed; --green: #10b981; --red: #ff0055; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: var(--bg); color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  .aurora { position: fixed; inset: 0; background: radial-gradient(circle at 20% 20%, #4338ca10 0, transparent 40%), radial-gradient(circle at 80% 80%, #6d28d910 0, transparent 40%); filter: blur(100px); z-index: -1; }
  .glass { background: var(--glass); backdrop-filter: blur(24px); border: 1px solid var(--border); border-radius: 20px; transition: 0.4s; }
  .grad-txt { background: linear-gradient(135deg, #fff 40%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .pulse-dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; display: inline-block; box-shadow: 0 0 10px var(--green); animation: pulse 2s infinite; margin-right: 8px; }
  @keyframes pulse { 0% { transform: scale(0.9); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(0.9); opacity: 1; } }

  .nav { position:fixed; top:0; width:100%; height:80px; display:flex; align-items:center; justify-content:space-between; padding:0 60px; z-index:100; border-bottom:1px solid var(--border); background:rgba(1,3,9,0.8); backdrop-filter:blur(12px); }
  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 120px 24px; }
  h1 { font-size: clamp(40px, 8vw, 90px); font-weight: 800; line-height: 0.9; margin-bottom: 24px; letter-spacing: -4px; }
  .btn { padding: 18px 48px; border-radius: 100px; font-weight: 700; text-decoration: none; transition: 0.3s; font-size: 15px; background: #fff; color: #000; box-shadow: 0 0 30px rgba(255,255,255,0.2); }
  .terminal { width: 100%; max-width: 700px; height: 180px; background: #000; border: 1px solid var(--border); border-radius: 12px; margin-top: 50px; padding: 20px; font-family: 'Space Mono'; font-size: 12px; color: var(--cyan); text-align: left; overflow: hidden; }
  .f-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1200px; margin: 100px auto; padding: 0 40px; }
  .f-card { padding: 32px; height: 100%; }
  .f-card:hover { border-color: var(--purple); transform: translateY(-8px); }
  .icon { font-size: 28px; margin-bottom: 20px; display: block; }
  footer { padding: 60px; text-align: center; border-top: 1px solid var(--border); color: #475569; font-size: 13px; }
</style></head><body>
  <div class="aurora"></div>
  <nav class="nav"><div style="font-weight:800; font-size:24px;">⚡ ACIE</div><div style="display:flex; gap:40px; font-size:14px;"><a href="/dashboard" style="color:#fff; text-decoration:none;">Platform</a><a href="/pricing" style="color:#fff; text-decoration:none;">Pricing</a></div></nav>
  <div class="hero">
    <div style="color:var(--cyan); font-weight:800; letter-spacing:2px; margin-bottom:20px; font-size:11px;">BUILD ● SECURE ● AUTOMATE ● SCALE</div>
    <h1>The All-in-One<br><span class="grad-txt">Google Maps for codebases.</span></h1>
    <p style="color:#8b949e; font-size:20px; max-width:650px; margin-bottom:48px;">AI-Powered DevSecOps Intelligence Platform for modern engineering teams.</p>
    <a href="/dashboard" class="btn">Get Started Free</a>
    <div class="terminal"><div>[SYSTEM] Initiating Neural Scan...</div><div style="color:var(--green)">[SCAN] 254 dependency nodes mapped.</div><div style="color:var(--red)">[WARN] Circular import found in /api/v1/auth.js</div><div>[LOG] Risk Assessment: MEDIUM (84%)</div></div>
  </div>
  <div style="text-align:center;"><h2 style="font-size:42px;">Powerful Features</h2></div>
  <div class="f-grid">
    <div class="glass f-card"><span class="icon">🧠</span><h3>AI Code Review</h3><p style="color:#8b949e; margin-top:10px;">Automated deep-logic analysis for every pull request.</p></div>
    <div class="glass f-card"><span class="icon">🛡️</span><h3>Security Guard</h3><p style="color:#8b949e; margin-top:10px;">Instant detection of hardcoded secrets and leaked keys.</p></div>
    <div class="glass f-card"><span class="icon">🔍</span><h3>Vulnerability Map</h3><p style="color:#8b949e; margin-top:10px;">Real-time threat hunting across your repository.</p></div>
    <div class="glass f-card"><span class="icon">⚡</span><h3>PR Intelligence</h3><p style="color:#8b949e; margin-top:10px;">Predict architectural breaks before you merge.</p></div>
    <div class="glass f-card"><span class="icon">🚀</span><h3>CI/CD Optimizer</h3><p style="color:#8b949e; margin-top:10px;">Optimize your build pipeline with AI-driven insights.</p></div>
    <div class="glass f-card"><span class="icon">⚖️</span><h3>Compliance</h3><p style="color:#8b949e; margin-top:10px;">Automate SOC2, GDPR, and ISO27001 readiness.</p></div>
  </div>
  <footer>Built by Sahil-Hub-Cloud &copy; 2026</footer>
</body></html>`);}