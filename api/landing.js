export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
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
</body></html>`);}