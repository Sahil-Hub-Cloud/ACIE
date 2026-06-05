export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ACIE — Pricing</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'JetBrains Mono',monospace;background:#030303;color:#fff;cursor:none}
.cursor{position:fixed;width:20px;height:20px;border:1px solid #00f2fe;border-radius:50%;pointer-events:none;z-index:9999;transition:transform .1s}
.cursor-dot{position:fixed;width:4px;height:4px;background:#00f2fe;border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%)}
.scanline{position:fixed;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,242,254,0.012) 2px,rgba(0,242,254,0.012) 4px);pointer-events:none;z-index:1}
nav{position:fixed;top:0;width:100%;z-index:100;padding:0 60px;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(0,242,254,0.1);background:rgba(3,3,3,0.8);backdrop-filter:blur(20px)}
.logo{display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:18px;letter-spacing:2px}
.logo-box{width:32px;height:32px;border:1px solid #00f2fe;display:grid;place-items:center;font-size:14px;color:#00f2fe}
.nav-links{display:flex;gap:40px}
.nav-links a{color:rgba(255,255,255,0.4);text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;transition:color .2s}
.nav-links a:hover{color:#00f2fe}
.hero{padding:120px 24px 60px;text-align:center}
.hero-tag{font-size:11px;letter-spacing:4px;color:#00f2fe;text-transform:uppercase;margin-bottom:16px}
.hero h1{font-size:clamp(36px,6vw,64px);font-weight:700;letter-spacing:-2px;margin-bottom:12px}
.hero p{font-size:13px;color:rgba(255,255,255,0.3);letter-spacing:2px}
.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(0,242,254,0.05);max-width:960px;margin:60px auto;border:1px solid rgba(0,242,254,0.1)}
.plan{background:#030303;padding:40px 32px;position:relative;transition:background .2s}
.plan:hover{background:rgba(0,242,254,0.02)}
.plan.featured{background:#040810;border:1px solid rgba(0,242,254,0.2)}
.pop-badge{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:#00f2fe;color:#030303;font-size:9px;font-weight:700;padding:4px 16px;letter-spacing:2px;white-space:nowrap}
.plan-name{font-size:9px;letter-spacing:3px;color:rgba(0,242,254,0.5);text-transform:uppercase;margin-bottom:16px}
.plan-price{font-size:52px;font-weight:700;letter-spacing:-3px;color:#fff;margin-bottom:4px}
.plan-price sup{font-size:20px;vertical-align:top;margin-top:12px;display:inline-block;color:rgba(0,242,254,0.6)}
.plan-price span{font-size:14px;color:rgba(255,255,255,0.25);font-weight:400;letter-spacing:0}
.plan-desc{font-size:11px;color:rgba(255,255,255,0.25);margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid rgba(0,242,254,0.08);letter-spacing:1px;line-height:1.8}
.plan-features{list-style:none;margin-bottom:32px}
.plan-features li{font-size:11px;padding:8px 0;border-bottom:1px solid rgba(0,242,254,0.04);display:flex;align-items:center;gap:8px;letter-spacing:1px;color:rgba(255,255,255,0.6)}
.plan-features li::before{content:'▸';color:#00f2fe;font-size:10px}
.plan-features li.no::before{content:'✕';color:rgba(255,255,255,0.15)}
.plan-features li.no{color:rgba(255,255,255,0.15)}
.btn-plan{display:block;text-align:center;padding:12px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;transition:all .2s;border:1px solid rgba(0,242,254,0.3);color:#00f2fe;background:transparent}
.btn-plan:hover{background:rgba(0,242,254,0.05);border-color:#00f2fe}
.btn-plan.primary{background:rgba(0,242,254,0.08);border-color:#00f2fe}
.faq{max-width:640px;margin:0 auto 80px;padding:0 24px}
.faq h2{font-size:14px;letter-spacing:4px;color:#00f2fe;text-align:center;margin-bottom:32px;text-transform:uppercase}
.faq-item{border-bottom:1px solid rgba(0,242,254,0.08);padding:20px 0}
.faq-item h3{font-size:12px;font-weight:600;color:#fff;margin-bottom:8px;letter-spacing:1px}
.faq-item p{font-size:11px;color:rgba(255,255,255,0.35);line-height:2;letter-spacing:1px}
footer{border-top:1px solid rgba(0,242,254,0.08);padding:24px 60px;display:flex;justify-content:space-between;align-items:center;font-size:11px}
.footer-logo{color:#00f2fe;letter-spacing:3px}
.footer-links a{color:rgba(255,255,255,0.2);text-decoration:none;letter-spacing:2px;font-size:10px;margin-left:28px;transition:color .2s}
.footer-links a:hover{color:#00f2fe}
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="cursor-dot" id="cursorDot"></div>
<div class="scanline"></div>
<nav>
  <a href="/" class="logo"><div class="logo-box">A</div>ACIE</a>
  <div class="nav-links">
    <a href="/dashboard">Dashboard</a>
    <a href="/history">History</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
  </div>
</nav>
<div class="hero">
  <div class="hero-tag">// PRICING_MATRIX</div>
  <h1>Simple <span style="background:linear-gradient(90deg,#00f2fe,#4facfe);-webkit-background-clip:text;-webkit-text-fill-color:transparent">pricing</span></h1>
  <p>START_FREE · UPGRADE_WHEN_READY · NO_CONTRACTS</p>
</div>
<div class="plans">
  <div class="plan">
    <div class="plan-name">// FREE_TIER</div>
    <div class="plan-price"><sup>$</sup>0<span>/mo</span></div>
    <div class="plan-desc">Perfect for solo developers trying ACIE.</div>
    <ul class="plan-features">
      <li>1 GitHub repository</li>
      <li>Blast radius detection</li>
      <li>Risk scoring</li>
      <li>PR comments</li>
      <li>50 PRs per month</li>
      <li class="no">Slack notifications</li>
      <li class="no">Email reports</li>
      <li class="no">Priority support</li>
    </ul>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn-plan">[ GET_STARTED ]</a>
  </div>
  <div class="plan featured">
    <div class="pop-badge">MOST_POPULAR</div>
    <div class="plan-name">// PRO_TIER</div>
    <div class="plan-price"><sup>$</sup>29<span>/mo</span></div>
    <div class="plan-desc">For teams that ship code every day.</div>
    <ul class="plan-features">
      <li>10 GitHub repositories</li>
      <li>Blast radius detection</li>
      <li>Risk scoring</li>
      <li>PR comments</li>
      <li>Unlimited PRs</li>
      <li>Slack notifications</li>
      <li>Email reports</li>
      <li>Priority support</li>
    </ul>
    <a href="mailto:sahilshaik4679@gmail.com" class="btn-plan primary">[ START_TRIAL ]</a>
  </div>
  <div class="plan">
    <div class="plan-name">// ENTERPRISE_TIER</div>
    <div class="plan-price"><sup>$</sup>99<span>/mo</span></div>
    <div class="plan-desc">For large engineering organizations.</div>
    <ul class="plan-features">
      <li>Unlimited repositories</li>
      <li>Blast radius detection</li>
      <li>Risk scoring</li>
      <li>PR comments</li>
      <li>Unlimited PRs</li>
      <li>Slack and email alerts</li>
      <li>Custom integrations</li>
      <li>Dedicated support</li>
    </ul>
    <a href="mailto:sahilshaik4679@gmail.com" class="btn-plan">[ CONTACT_US ]</a>
  </div>
</div>
<div class="faq">
  <h2>// FAQ</h2>
  <div class="faq-item"><h3>HOW_DOES_ACIE_WORK?</h3><p>ACIE installs as a GitHub App. Every PR triggers a webhook that scans all changed files, maps their imports across the entire codebase, and posts a blast radius report as a PR comment.</p></div>
  <div class="faq-item"><h3>DO_DEVELOPERS_NEED_TO_CHANGE_ANYTHING?</h3><p>No. ACIE works completely in the background. Developers open PRs exactly as they always have.</p></div>
  <div class="faq-item"><h3>WHAT_LANGUAGES_ARE_SUPPORTED?</h3><p>Currently JavaScript and TypeScript. Python, Go, and Java support coming soon.</p></div>
  <div class="faq-item"><h3>CAN_I_CANCEL_ANYTIME?</h3><p>Yes. No contracts, no lock-in. Cancel your plan anytime.</p></div>
</div>
<footer>
  <div class="footer-logo">ACIE_v2</div>
  <div class="footer-links">
    <a href="/">Home</a>
    <a href="/dashboard">Dashboard</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
  </div>
</footer>
<script>
const cursor=document.getElementById('cursor');
const dot=document.getElementById('cursorDot');
window.addEventListener('mousemove',e=>{cursor.style.left=e.clientX-10+'px';cursor.style.top=e.clientY-10+'px';dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';});
window.addEventListener('mousedown',()=>cursor.style.transform='scale(0.7)');
window.addEventListener('mouseup',()=>cursor.style.transform='scale(1)');
</script>
</body>
</html>`);
}