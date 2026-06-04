export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ACIE — Intelligence Engine</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#030712;color:#fff;overflow-x:hidden}
.orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
.orb1{width:600px;height:600px;background:radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%);top:-200px;left:-100px}
.orb2{width:500px;height:500px;background:radial-gradient(circle,rgba(59,130,246,0.1),transparent 70%);bottom:-100px;right:-100px}
.nav{position:fixed;top:0;width:100%;z-index:100;padding:20px 48px;display:flex;justify-content:space-between;align-items:center;backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.05)}
.logo{display:flex;align-items:center;gap:12px;font-weight:900;font-size:20px;text-decoration:none;color:#fff}
.logo-box{width:36px;height:36px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);border-radius:10px;display:grid;place-items:center;box-shadow:0 0 20px rgba(139,92,246,0.5)}
.hero{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 24px}
.badge{background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);color:#c4b5fd;padding:8px 20px;border-radius:30px;font-size:12px;font-weight:700;margin-bottom:24px;text-transform:uppercase;letter-spacing:1px}
h1{font-size:clamp(40px,8vw,90px);font-weight:900;letter-spacing:-4px;line-height:0.9;margin-bottom:24px}
.grad{background:linear-gradient(to bottom,#fff 40%,#64748b);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
p{color:#94a3b8;font-size:20px;max-width:600px;line-height:1.6;margin-bottom:40px}
.btn{background:#fff;color:#000;padding:18px 48px;border-radius:14px;font-size:16px;font-weight:800;text-decoration:none;box-shadow:0 0 40px rgba(255,255,255,0.3);transition:0.3s}
.btn:hover{transform:scale(1.05)}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto 100px;padding:0 24px;position:relative;z-index:1}
.card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:40px;border-radius:24px;backdrop-filter:blur(10px)}
h3{font-size:22px;margin-bottom:12px}
footer{padding:40px;text-align:center;color:#475569;font-size:13px;border-top:1px solid rgba(255,255,255,0.05)}
</style>
</head>
<body>
<div class="orb orb1"></div>
<div class="orb orb2"></div>
<nav class="nav">
  <a href="/" class="logo"><div class="logo-box">A</div>ACIE</a>
  <div style="display:flex;gap:30px">
    <a href="/dashboard" style="color:#94a3b8;text-decoration:none;font-size:14px">Dashboard</a>
    <a href="/pricing" style="color:#94a3b8;text-decoration:none;font-size:14px">Pricing</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE" style="color:#94a3b8;text-decoration:none;font-size:14px">GitHub</a>
  </div>
</nav>
<div class="hero">
  <div class="badge">Next-Gen Code Intelligence</div>
  <h1>Google Maps for<br/><span class="grad">your codebase.</span></h1>
  <p>Predict what breaks before you merge. AI-powered PR analysis for engineering teams.</p>
  <a href="/dashboard" class="btn">Enter Dashboard →</a>
</div>
<div class="grid">
  <div class="card"><h3>💥 Blast Radius</h3><p style="color:#64748b;margin-top:8px">Deep dependency mapping across your entire codebase.</p></div>
  <div class="card"><h3>🎯 Risk Scoring</h3><p style="color:#64748b;margin-top:8px">Automatic LOW, MEDIUM, HIGH scores on every PR.</p></div>
  <div class="card"><h3>⚡ Instant Alerts</h3><p style="color:#64748b;margin-top:8px">Slack notifications within seconds of a PR opening.</p></div>
</div>
<footer>Built by Sahil-Hub-Cloud &copy; 2026 · <a href="/pricing" style="color:#8b5cf6;text-decoration:none">View Pricing</a></footer>
</body>
</html>`);
}