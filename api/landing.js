export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>ACIE — Google Maps for Codebases</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#050505;color:#f1f5f9;overflow-x:hidden;-webkit-font-smoothing:antialiased}
    
    /* Background FX */
    .orb{position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0}
    .orb1{width:600px;height:600px;background:radial-gradient(circle,#7c3aed33,transparent 70%);top:-200px;left:-100px}
    .orb2{width:500px;height:500px;background:radial-gradient(circle,#3b82f622,transparent 70%);bottom:-100px;right:-100px}
    
    .nav{position:fixed;top:0;left:0;right:0;z-index:100;height:72px;padding:0 48px;display:flex;align-items:center;justify-content:space-between;background:rgba(5,5,5,.7);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.08)}
    .logo{display:flex;align-items:center;gap:12px;text-decoration:none;font-weight:800;color:#fff;font-size:20px}
    .logo-box{width:36px;height:36px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);border-radius:10px;display:grid;place-items:center;box-shadow:0 0 20px #8b5cf666}
    .nav-links a{color:#94a3b8;text-decoration:none;font-size:14px;margin-left:32px;transition:0.2s}
    .nav-links a:hover{color:#fff}

    .hero{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 24px}
    .badge{background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.3);color:#c4b5fd;font-size:12px;font-weight:600;padding:8px 20px;border-radius:30px;margin-bottom:30px;letter-spacing:1px;text-transform:uppercase}
    .hero h1{font-size:clamp(48px,9vw,90px);font-weight:900;line-height:1;letter-spacing:-4px;color:#fff;margin-bottom:24px}
    .grad{background:linear-gradient(to right,#fff,#94a3b8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .hero p{font-size:20px;color:#64748b;max-width:600px;line-height:1.6;margin-bottom:48px}
    
    .btn-main{background:#fff;color:#000;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;transition:0.3s;box-shadow:0 0 30px rgba(255,255,255,0.2)}
    .btn-main:hover{transform:translateY(-3px);box-shadow:0 0 50px rgba(255,255,255,0.4)}
    
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1200px;margin:100px auto;padding:0 40px}
    .card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:40px;border-radius:24px;backdrop-filter:blur(10px);transition:0.4s}
    .card:hover{border-color:rgba(139,92,246,0.4);transform:translateY(-10px)}
    .card h3{font-size:20px;margin-bottom:12px;color:#fff}
    .card p{color:#64748b;font-size:15px;line-height:1.6}
    .icon{font-size:32px;margin-bottom:20px;display:block}
  </style>
</head>
<body>
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <nav class="nav">
    <a href="/" class="logo"><div class="logo-box">A</div>ACIE</a>
    <div class="nav-links">
      <a href="/dashboard">Dashboard</a>
      <a href="/pricing">Pricing</a>
      <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
    </div>
  </nav>
  <div class="hero">
    <div class="badge">Next-Gen Code Intelligence</div>
    <h1>Google Maps for<br><span class="grad">your codebase.</span></h1>
    <p>Predict what will break before you merge. ACIE analyzes every Pull Request with surgical precision.</p>
    <a href="/dashboard" class="btn-main">Launch Dashboard →</a>
  </div>
  <div class="grid">
    <div class="card">
      <span class="icon">💥</span>
      <h3>Blast Radius</h3>
      <p>Scan the entire repository to find every single file affected by your change.</p>
    </div>
    <div class="card">
      <span class="icon">🛡️</span>
      <h3>Security Guard</h3>
      <p>Automatically detect leaked API keys and hardcoded secrets before they ship.</p>
    </div>
    <div class="card">
      <span class="icon">📊</span>
      <h3>Health Score</h3>
      <p>Get a 0-100% health metric for every file in your Pull Request instantly.</p>
    </div>
  </div>
</body>
</html>\`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}`;