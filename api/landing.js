export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ACIE — AI Change Impact Engine</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--purple:#7c3aed;--blue:#2563eb;--glow:rgba(124,58,237,0.4)}
body{font-family:'Inter',sans-serif;background:#02040a;color:#fff;overflow-x:hidden}
canvas{position:fixed;top:0;left:0;z-index:0;pointer-events:none}
nav{position:fixed;top:0;width:100%;z-index:100;padding:0 60px;height:72px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(24px);background:rgba(2,4,10,0.7)}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:800;font-size:18px;letter-spacing:-0.5px}
.logo-icon{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#7c3aed,#2563eb);display:grid;place-items:center;font-size:16px;box-shadow:0 0 24px var(--glow)}
.nav-links{display:flex;gap:36px;align-items:center}
.nav-links a{color:rgba(255,255,255,0.5);text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
.nav-links a:hover{color:#fff}
.nav-cta{background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.4);color:#a78bfa !important;padding:8px 20px;border-radius:8px}
.nav-cta:hover{background:rgba(124,58,237,0.3) !important}
.hero{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);color:#a78bfa;padding:7px 16px;border-radius:100px;font-size:12px;font-weight:600;letter-spacing:0.5px;margin-bottom:32px}
.badge-dot{width:6px;height:6px;border-radius:50%;background:#7c3aed;box-shadow:0 0 8px #7c3aed;animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
.hero h1{font-size:clamp(48px,7vw,88px);font-weight:900;letter-spacing:-4px;line-height:0.95;margin-bottom:28px;max-width:900px}
.hero h1 em{font-style:normal;background:linear-gradient(135deg,#7c3aed,#60a5fa,#7c3aed);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 4s linear infinite}
@keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
.hero p{font-size:18px;color:rgba(255,255,255,0.5);max-width:560px;line-height:1.7;margin-bottom:48px;font-weight:400}
.hero-btns{display:flex;gap:14px;margin-bottom:80px}
.btn-primary{background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;padding:16px 36px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;box-shadow:0 0 40px rgba(124,58,237,0.4);transition:all .3s;border:none}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 60px rgba(124,58,237,0.6)}
.btn-ghost{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);padding:16px 36px;border-radius:12px;font-size:15px;font-weight:600;text-decoration:none;transition:all .3s}
.btn-ghost:hover{background:rgba(255,255,255,0.08);color:#fff}
.pr-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:24px;width:100%;max-width:620px;text-align:left;backdrop-filter:blur(20px);box-shadow:0 24px 80px rgba(0,0,0,0.5)}
.pr-header{display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.06)}
.pr-dot{width:10px;height:10px;border-radius:50%;background:#10b981}
.pr-title{font-size:13px;font-weight:600;color:rgba(255,255,255,0.7)}
.pr-body{font-family:'Courier New',monospace;font-size:12px;line-height:2}
.c-purple{color:#a78bfa;font-weight:700}
.c-green{color:#34d399}
.c-yellow{color:#fbbf24}
.c-red{color:#f87171}
.c-gray{color:rgba(255,255,255,0.4)}
.metrics{display:flex;gap:0;margin:80px auto;max-width:900px;border:1px solid rgba(255,255,255,0.07);border-radius:20px;overflow:hidden;position:relative;z-index:1}
.metric{flex:1;padding:40px 32px;text-align:center;border-right:1px solid rgba(255,255,255,0.07)}
.metric:last-child{border:none}
.metric-val{font-size:42px;font-weight:900;letter-spacing:-2px;margin-bottom:6px}
.metric-label{font-size:13px;color:rgba(255,255,255,0.4);font-weight:500}
.features{max-width:1100px;margin:0 auto 100px;padding:0 24px;position:relative;z-index:1}
.section-eyebrow{text-align:center;color:#7c3aed;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px}
.section-title{text-align:center;font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-2px;margin-bottom:60px}
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feature-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:36px;transition:all .3s;cursor:default}
.feature-card:hover{background:rgba(124,58,237,0.06);border-color:rgba(124,58,237,0.3);transform:translateY(-4px)}
.feature-icon{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;font-size:22px;margin-bottom:20px}
.feature-card h3{font-size:17px;font-weight:700;margin-bottom:10px;letter-spacing:-0.3px}
.feature-card p{font-size:14px;color:rgba(255,255,255,0.4);line-height:1.7}
.cta-section{position:relative;z-index:1;text-align:center;padding:80px 24px 120px}
.cta-box{background:rgba(124,58,237,0.06);border:1px solid rgba(124,58,237,0.2);border-radius:28px;padding:72px 48px;max-width:700px;margin:0 auto}
.cta-box h2{font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-2px;margin-bottom:16px}
.cta-box p{color:rgba(255,255,255,0.5);font-size:16px;margin-bottom:36px}
footer{border-top:1px solid rgba(255,255,255,0.06);padding:32px 60px;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}
.footer-logo{font-weight:800;font-size:16px;color:rgba(255,255,255,0.6)}
.footer-links{display:flex;gap:28px}
.footer-links a{color:rgba(255,255,255,0.3);text-decoration:none;font-size:13px;transition:color .2s}
.footer-links a:hover{color:#fff}
</style>
</head>
<body>
<canvas id="c"></canvas>
<nav>
  <a href="/" class="logo"><div class="logo-icon">⚡</div>ACIE</a>
  <div class="nav-links">
    <a href="/dashboard">Dashboard</a>
    <a href="/pricing">Pricing</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
    <a href="/dashboard" class="nav-cta">Open App →</a>
  </div>
</nav>
<div class="hero">
  <div class="hero-badge"><span class="badge-dot"></span>Live on GitHub · Free to install</div>
  <h1>The AI that knows<br/>what will <em>break</em></h1>
  <p>ACIE analyzes every Pull Request and maps exactly which files will be affected — before your team merges anything.</p>
  <div class="hero-btns">
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn-primary">Install Free on GitHub →</a>
    <a href="/dashboard" class="btn-ghost">View Dashboard</a>
  </div>
  <div class="pr-card">
    <div class="pr-header"><div class="pr-dot"></div><div class="pr-title">⚡ ACIE — Change Impact Report · PR #14 · src/auth.ts</div></div>
    <div class="pr-body">
      <div class="c-purple">### 📁 Files Changed</div>
      <div class="c-gray">  src/auth.ts &nbsp;&nbsp;· 3 exports · 2 imports</div>
      <div class="c-purple">### 💥 Blast Radius</div>
      <div class="c-yellow">  src/payment.ts</div>
      <div class="c-yellow">  src/checkout.ts</div>
      <div class="c-yellow">  src/user-session.ts</div>
      <div class="c-red">### 🔴 Risk Score: HIGH</div>
      <div class="c-red">  ⛔ 3 files affected — review carefully before merging</div>
    </div>
  </div>
</div>
<div class="metrics">
  <div class="metric"><div class="metric-val" style="background:linear-gradient(135deg,#7c3aed,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent">&lt;3s</div><div class="metric-label">Comment posted</div></div>
  <div class="metric"><div class="metric-val" style="color:#10b981">100%</div><div class="metric-label">Automatic</div></div>
  <div class="metric"><div class="metric-val" style="color:#f59e0b">3</div><div class="metric-label">Risk levels</div></div>
  <div class="metric"><div class="metric-val" style="color:#fff">0</div><div class="metric-label">Setup required</div></div>
</div>
<div class="features">
  <div class="section-eyebrow">Features</div>
  <div class="section-title">Everything your team needs</div>
  <div class="features-grid">
    <div class="feature-card"><div class="feature-icon" style="background:rgba(124,58,237,0.1)">💥</div><h3>Blast Radius Detection</h3><p>Scans the entire repository to find every file affected by a change — not just the files in the PR.</p></div>
    <div class="feature-card"><div class="feature-icon" style="background:rgba(16,185,129,0.1)">🎯</div><h3>Risk Scoring</h3><p>Automatic LOW, MEDIUM and HIGH risk scores based on real import and export dependency analysis.</p></div>
    <div class="feature-card"><div class="feature-icon" style="background:rgba(245,158,11,0.1)">⚠️</div><h3>Test Coverage Warnings</h3><p>Flags every file that has no corresponding test file so nothing ships without coverage.</p></div>
    <div class="feature-card"><div class="feature-icon" style="background:rgba(37,99,235,0.1)">🤖</div><h3>Fully Automatic</h3><p>Installs in 60 seconds. Works silently on every PR with zero effort from your developers.</p></div>
    <div class="feature-card"><div class="feature-icon" style="background:rgba(239,68,68,0.1)">📱</div><h3>Slack Alerts</h3><p>Instant Slack notifications the moment a HIGH risk PR is opened by anyone on your team.</p></div>
    <div class="feature-card"><div class="feature-icon" style="background:rgba(124,58,237,0.1)">⚡</div><h3>Instant Reports</h3><p>Posts a detailed change impact report as a PR comment within seconds of opening.</p></div>
  </div>
</div>
<div class="cta-section">
  <div class="cta-box">
    <h2>Ready to ship safer?</h2>
    <p>Install ACIE on your GitHub repo in under 60 seconds. Free forever for solo developers.</p>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn-primary">Get Started Free →</a>
  </div>
</div>
<footer>
  <div class="footer-logo">⚡ ACIE</div>
  <div class="footer-links">
    <a href="/dashboard">Dashboard</a>
    <a href="/pricing">Pricing</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
  </div>
</footer>
<script>
const c=document.getElementById('c');
const ctx=c.getContext('2d');
let w,h,stars=[];
function resize(){w=c.width=window.innerWidth;h=c.height=window.innerHeight;stars=Array.from({length:120},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.2+0.2,o:Math.random(),s:Math.random()*0.003+0.001}))}
resize();window.addEventListener('resize',resize);
function draw(){ctx.clearRect(0,0,w,h);stars.forEach(s=>{s.o+=s.s;if(s.o>1||s.o<0)s.s*=-1;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=\`rgba(255,255,255,\${s.o})\`;ctx.fill()});requestAnimationFrame(draw)}
draw();
</script>
</body>
</html>`);
}