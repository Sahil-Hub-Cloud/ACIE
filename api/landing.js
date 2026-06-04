export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
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
</body></html>`);}