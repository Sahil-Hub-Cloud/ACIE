export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ACIE — AI Change Impact Engine</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--cyan:#00f2fe;--purple:#4facfe;--bg:#030303}
body{font-family:'JetBrains Mono',monospace;background:#030303;color:#fff;overflow-x:hidden;cursor:none}
canvas{position:fixed;top:0;left:0;z-index:0;pointer-events:none}
.cursor{position:fixed;width:20px;height:20px;border:1px solid #00f2fe;border-radius:50%;pointer-events:none;z-index:9999;transition:transform .1s;mix-blend-mode:difference}
.cursor-dot{position:fixed;width:4px;height:4px;background:#00f2fe;border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%)}
.scanline{position:fixed;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,242,254,0.015) 2px,rgba(0,242,254,0.015) 4px);pointer-events:none;z-index:1}
.grid-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background-image:linear-gradient(rgba(0,242,254,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,242,254,0.03) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:1}
nav{position:fixed;top:0;width:100%;z-index:100;padding:0 60px;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(0,242,254,0.1);background:rgba(3,3,3,0.8);backdrop-filter:blur(20px)}
.logo{display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:18px;letter-spacing:2px}
.logo-box{width:32px;height:32px;border:1px solid #00f2fe;display:grid;place-items:center;font-size:14px;color:#00f2fe;animation:pulse-border 2s infinite}
@keyframes pulse-border{0%,100%{box-shadow:0 0 0 0 rgba(0,242,254,0.4)}50%{box-shadow:0 0 0 8px rgba(0,242,254,0)}}
.nav-links{display:flex;gap:40px;align-items:center}
.nav-links a{color:rgba(255,255,255,0.4);text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;transition:all .3s;position:relative}
.nav-links a:hover{color:#00f2fe}
.nav-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;background:#00f2fe;transition:width .3s}
.nav-links a:hover::after{width:100%}
.nav-status{display:flex;align-items:center;gap:8px;font-size:11px;color:#00f2fe;letter-spacing:1px}
.status-dot{width:6px;height:6px;border-radius:50%;background:#00f2fe;animation:blink 1.5s infinite}
@keyframes blink{0%,100%{opacity:1;box-shadow:0 0 6px #00f2fe}50%{opacity:0.3}}
.hero{position:relative;z-index:2;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 24px;text-align:center}
.hero-tag{font-size:11px;letter-spacing:4px;color:#00f2fe;text-transform:uppercase;margin-bottom:24px;opacity:0;animation:fadeUp .6s .3s ease forwards}
.hero h1{font-size:clamp(48px,8vw,96px);font-weight:700;letter-spacing:-2px;line-height:0.9;margin-bottom:24px;opacity:0;animation:fadeUp .6s .5s ease forwards}
.line1{display:block;color:#fff}
.line2{display:block;background:linear-gradient(90deg,#00f2fe,#4facfe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-sub{font-size:14px;color:rgba(255,255,255,0.35);letter-spacing:2px;max-width:500px;line-height:2;margin-bottom:48px;opacity:0;animation:fadeUp .6s .7s ease forwards}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.hero-btns{display:flex;gap:16px;opacity:0;animation:fadeUp .6s .9s ease forwards}
.btn-primary{position:relative;background:transparent;border:1px solid #00f2fe;color:#00f2fe;padding:14px 36px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;cursor:none;overflow:hidden;transition:all .3s;text-decoration:none;display:inline-block}
.btn-primary:hover{background:rgba(0,242,254,0.05);box-shadow:0 0 30px rgba(0,242,254,0.2);color:#fff}
.btn-ghost{background:transparent;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);padding:14px 36px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;cursor:none;transition:all .3s;text-decoration:none;display:inline-block}
.btn-ghost:hover{border-color:rgba(255,255,255,0.3);color:#fff}
.pr-demo{position:relative;margin-top:80px;width:100%;max-width:680px;opacity:0;animation:fadeUp .6s 1.1s ease forwards}
.glass{background:rgba(0,242,254,0.02);border:1px solid rgba(0,242,254,0.15);backdrop-filter:blur(20px);position:relative}
.corner{position:absolute;width:12px;height:12px}
.corner-tl{top:-1px;left:-1px;border-top:2px solid #00f2fe;border-left:2px solid #00f2fe}
.corner-tr{top:-1px;right:-1px;border-top:2px solid #00f2fe;border-right:2px solid #00f2fe}
.corner-bl{bottom:-1px;left:-1px;border-bottom:2px solid #00f2fe;border-left:2px solid #00f2fe}
.corner-br{bottom:-1px;right:-1px;border-bottom:2px solid #00f2fe;border-right:2px solid #00f2fe}
.demo-header{padding:12px 20px;border-bottom:1px solid rgba(0,242,254,0.1);display:flex;align-items:center;gap:10px;font-size:11px;color:rgba(0,242,254,0.6);letter-spacing:2px}
.demo-dot{width:8px;height:8px;border-radius:50%;background:#00f2fe;animation:blink 1.5s infinite}
.demo-body{padding:20px;font-size:12px;line-height:2.2;text-align:left}
.d-cyan{color:#00f2fe;font-weight:600}
.d-purple{color:#4facfe}
.d-yellow{color:#ffd700}
.d-red{color:#ff4d6d}
.d-gray{color:rgba(255,255,255,0.3)}
.metrics{position:relative;z-index:2;display:grid;grid-template-columns:repeat(4,1fr);max-width:900px;margin:0 auto;border:1px solid rgba(0,242,254,0.1)}
.metric{padding:40px 32px;text-align:center;border-right:1px solid rgba(0,242,254,0.1);position:relative;overflow:hidden}
.metric:last-child{border:none}
.metric-val{font-size:40px;font-weight:700;letter-spacing:-2px;margin-bottom:6px;background:linear-gradient(135deg,#00f2fe,#4facfe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.metric-label{font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase}
.panels{position:relative;z-index:2;max-width:1100px;margin:80px auto;padding:0 24px;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(0,242,254,0.05)}
.panel{background:#030303;padding:32px;cursor:none;transition:all .3s;position:relative;overflow:hidden}
.panel::before{content:'';position:absolute;top:0;left:0;width:100%;height:2px;background:linear-gradient(90deg,transparent,#00f2fe,transparent);transform:translateX(-100%);transition:transform .5s}
.panel:hover::before{transform:translateX(100%)}
.panel:hover{background:rgba(0,242,254,0.02)}
.panel-tag{font-size:9px;letter-spacing:3px;color:#00f2fe;text-transform:uppercase;margin-bottom:16px;opacity:0.6}
.panel h3{font-size:16px;font-weight:600;margin-bottom:12px;letter-spacing:-0.5px}
.panel p{font-size:12px;color:rgba(255,255,255,0.35);line-height:2}
.panel-num{position:absolute;top:28px;right:28px;font-size:48px;font-weight:700;color:rgba(0,242,254,0.04);letter-spacing:-2px}
.cta{position:relative;z-index:2;text-align:center;padding:80px 24px 120px;border-top:1px solid rgba(0,242,254,0.08)}
.cta h2{font-size:clamp(32px,5vw,56px);font-weight:700;letter-spacing:-2px;margin-bottom:16px;line-height:1}
.cta p{font-size:13px;color:rgba(255,255,255,0.3);letter-spacing:2px;margin-bottom:40px;line-height:2}
footer{position:relative;z-index:2;border-top:1px solid rgba(0,242,254,0.08);padding:24px 60px;display:flex;justify-content:space-between;align-items:center;font-size:11px}
.footer-logo{color:#00f2fe;letter-spacing:3px}
.footer-links{display:flex;gap:32px}
.footer-links a{color:rgba(255,255,255,0.2);text-decoration:none;letter-spacing:2px;font-size:10px;text-transform:uppercase;transition:color .2s}
.footer-links a:hover{color:#00f2fe}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:#030303}
::-webkit-scrollbar-thumb{background:rgba(0,242,254,0.2)}
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="cursor-dot" id="cursorDot"></div>
<canvas id="c"></canvas>
<div class="scanline"></div>
<div class="grid-overlay"></div>
<nav>
  <a href="/" class="logo"><div class="logo-box">A</div>ACIE</a>
  <div class="nav-links">
    <a href="/dashboard">Dashboard</a>
    <a href="/history">History</a>
    <a href="/pricing">Pricing</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
  </div>
  <div class="nav-status"><div class="status-dot"></div>SYS_ONLINE</div>
</nav>
<div class="hero">
  <div class="hero-tag">// AI_CHANGE_IMPACT_ENGINE v2.0</div>
  <h1><span class="line1">KNOW WHAT</span><span class="line2">BREAKS</span></h1>
  <div class="hero-sub">BLAST_RADIUS DETECTION · RISK_SCORING · INSTANT_ALERTS<br/>EVERY PULL REQUEST · EVERY TIME · ZERO EFFORT</div>
  <div class="hero-btns">
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn-primary">[ INITIALIZE ]</a>
    <a href="/dashboard" class="btn-ghost">[ DASHBOARD ]</a>
  </div>
  <div class="pr-demo">
    <div class="glass">
      <div class="corner corner-tl"></div><div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div><div class="corner corner-br"></div>
      <div class="demo-header"><div class="demo-dot"></div>ACIE_ANALYSIS // PR_#14 // src/auth.ts</div>
      <div class="demo-body">
        <div class="d-cyan">## CHANGE_IMPACT_REPORT</div>
        <div class="d-gray">================================</div>
        <div class="d-cyan">### FILES_CHANGED</div>
        <div><span class="d-purple">src/auth.ts</span> <span class="d-gray">// exports:3 imports:2</span></div>
        <div class="d-cyan">### BLAST_RADIUS</div>
        <div><span class="d-yellow">src/payment.ts</span></div>
        <div><span class="d-yellow">src/checkout.ts</span></div>
        <div><span class="d-yellow">src/user-session.ts</span></div>
        <div class="d-red">### RISK_SCORE: HIGH</div>
        <div class="d-red">3 files in blast radius — review before merge</div>
      </div>
    </div>
  </div>
</div>
<div class="metrics">
  <div class="metric"><div class="metric-val">&lt;3s</div><div class="metric-label">Response time</div></div>
  <div class="metric"><div class="metric-val">100%</div><div class="metric-label">Automatic</div></div>
  <div class="metric"><div class="metric-val">3</div><div class="metric-label">Risk levels</div></div>
  <div class="metric"><div class="metric-val">0</div><div class="metric-label">Setup needed</div></div>
</div>
<div class="panels">
  <div class="panel"><div class="panel-num">01</div><div class="panel-tag">// MODULE_01</div><h3>BLAST_RADIUS</h3><p>Deep dependency mapping across every file in the repository before you merge.</p></div>
  <div class="panel"><div class="panel-num">02</div><div class="panel-tag">// MODULE_02</div><h3>RISK_SCORING</h3><p>Automatic LOW · MEDIUM · HIGH based on real import and export analysis.</p></div>
  <div class="panel"><div class="panel-num">03</div><div class="panel-tag">// MODULE_03</div><h3>INSTANT_ALERTS</h3><p>Slack notifications within seconds of a HIGH risk PR opening.</p></div>
  <div class="panel"><div class="panel-num">04</div><div class="panel-tag">// MODULE_04</div><h3>AUTO_COMMENTS</h3><p>Detailed blast radius report posted as a PR comment automatically.</p></div>
  <div class="panel"><div class="panel-num">05</div><div class="panel-tag">// MODULE_05</div><h3>TEST_COVERAGE</h3><p>Flags files with no corresponding test coverage before shipping.</p></div>
  <div class="panel"><div class="panel-num">06</div><div class="panel-tag">// MODULE_06</div><h3>ZERO_FRICTION</h3><p>Installs in 60 seconds. Works silently on every PR with zero developer effort.</p></div>
</div>
<div class="cta">
  <h2>READY TO<br/><span style="background:linear-gradient(90deg,#00f2fe,#4facfe);-webkit-background-clip:text;-webkit-text-fill-color:transparent">SHIP SAFER</span></h2>
  <p>INSTALL ON GITHUB · FREE · 60 SECONDS</p>
  <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn-primary">[ GET STARTED ]</a>
</div>
<footer>
  <div class="footer-logo">ACIE_v2</div>
  <div class="footer-links">
    <a href="/dashboard">Dashboard</a>
    <a href="/history">History</a>
    <a href="/pricing">Pricing</a>
    <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
  </div>
</footer>
<script>
const c=document.getElementById('c');
const ctx=c.getContext('2d');
const cursor=document.getElementById('cursor');
const dot=document.getElementById('cursorDot');
let mx=0,my=0,w,h,particles=[];
function resize(){w=c.width=window.innerWidth;h=c.height=window.innerHeight;init();}
function init(){particles=[];for(let i=0;i<120;i++){particles.push({x:Math.random()*w,y:Math.random()*h,vx:0,vy:0,ox:Math.random()*100,oy:Math.random()*100,size:Math.random()*1.5+0.2,opacity:Math.random()*0.5+0.1,speed:Math.random()*0.3+0.05,color:Math.random()>0.7?'#4facfe':'#00f2fe'});}}
function draw(){ctx.clearRect(0,0,w,h);particles.forEach(p=>{const dx=mx-p.x,dy=my-p.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<200){p.vx+=(dx/dist)*0.3;p.vy+=(dy/dist)*0.3;}p.vx*=0.95;p.vy*=0.95;p.x+=p.vx+Math.sin(Date.now()*0.0005+p.oy)*p.speed;p.y+=p.vy+Math.cos(Date.now()*0.0005+p.ox)*p.speed;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle=p.color;ctx.globalAlpha=p.opacity;ctx.fill();ctx.globalAlpha=1;});particles.forEach((p,i)=>{particles.slice(i+1).forEach(p2=>{const dx=p.x-p2.x,dy=p.y-p2.y,d=Math.sqrt(dx*dx+dy*dy);if(d<100){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle='#00f2fe';ctx.globalAlpha=(1-d/100)*0.08;ctx.lineWidth=0.5;ctx.stroke();ctx.globalAlpha=1;}});});requestAnimationFrame(draw);}
window.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx-10+'px';cursor.style.top=my-10+'px';dot.style.left=mx+'px';dot.style.top=my+'px';});
window.addEventListener('mousedown',()=>cursor.style.transform='scale(0.8)');
window.addEventListener('mouseup',()=>cursor.style.transform='scale(1)');
resize();window.addEventListener('resize',resize);draw();
</script>
</body>
</html>`);
}