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
</body></html>`);}