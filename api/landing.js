export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
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
</body></html>`);}