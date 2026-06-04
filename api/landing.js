export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>ACIE — AI Code Intelligence</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#050505;color:#f1f5f9;overflow-x:hidden}
    .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
    .orb1{width:600px;height:600px;background:radial-gradient(circle,#7c3aed22,transparent 70%);top:-200px;left:-100px}
    .nav{position:fixed;top:0;left:0;right:0;z-index:100;height:72px;padding:0 48px;display:flex;align-items:center;justify-content:space-between;background:rgba(5,5,5,.7);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.08)}
    .logo-box{width:36px;height:36px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);border-radius:10px;display:grid;place-items:center;font-weight:900;box-shadow:0 0 20px #8b5cf666}
    .hero{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
    .badge{background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.3);color:#c4b5fd;font-size:12px;font-weight:600;padding:8px 20px;border-radius:30px;margin-bottom:30px}
    h1{font-size:clamp(40px,8vw,80px);font-weight:900;letter-spacing:-4px;margin-bottom:24px}
    .grad{background:linear-gradient(to right,#fff,#64748b);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .btn{background:#fff;color:#000;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;box-shadow:0 0 30px rgba(255,255,255,.2)}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1100px;margin:50px auto;padding:0 20px}
    .card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:30px;border-radius:20px;backdrop-filter:blur(10px)}
  </style>
</head>
<body>
  <div class="orb orb1"></div>
  <nav class="nav"><div style="display:flex;align-items:center;gap:12px;color:#fff;font-weight:700"><div class="logo-box">A</div>ACIE</div></nav>
  <div class="hero">
    <div class="badge">Next-Gen Code Intelligence</div>
    <h1>Google Maps for<br><span class="grad">your codebase.</span></h1>
    <p style="color:#64748b;margin-bottom:40px;max-width:500px">Predict what will break before you merge. ACIE analyzes PRs with surgical precision.</p>
    <a href="/dashboard" class="btn">Launch Dashboard →</a>
  </div>
  <div class="grid">
    <div class="card"><h3>💥 Blast Radius</h3><p style="color:#64748b;margin-top:10px">Scan dependencies across the entire repo.</p></div>
    <div class="card"><h3>🛡️ Security Guard</h3><p style="color:#64748b;margin-top:10px">Detect leaked secrets before they reach production.</p></div>
    <div class="card"><h3>📊 Health Score</h3><p style="color:#64748b;margin-top:10px">0-100% health metric for every pull request.</p></div>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}