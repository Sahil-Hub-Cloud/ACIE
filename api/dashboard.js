export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ACIE — Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--cyan:#00f2fe;--purple:#4facfe;--bg:#030303;--bg2:#070709}
body{font-family:'JetBrains Mono',monospace;background:#030303;color:#fff;display:flex;min-height:100vh;cursor:none}
.cursor{position:fixed;width:20px;height:20px;border:1px solid #00f2fe;border-radius:50%;pointer-events:none;z-index:9999;transition:transform .1s}
.cursor-dot{position:fixed;width:4px;height:4px;background:#00f2fe;border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%)}
.scanline{position:fixed;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,242,254,0.012) 2px,rgba(0,242,254,0.012) 4px);pointer-events:none;z-index:1}
.sidebar{width:220px;background:#070709;border-right:1px solid rgba(0,242,254,0.08);padding:24px 0;display:flex;flex-direction:column;flex-shrink:0;position:relative;z-index:2}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:700;font-size:15px;letter-spacing:2px;padding:0 20px;margin-bottom:36px}
.logo-box{width:28px;height:28px;border:1px solid #00f2fe;display:grid;place-items:center;font-size:12px;color:#00f2fe;animation:pulse-border 2s infinite}
@keyframes pulse-border{0%,100%{box-shadow:0 0 0 0 rgba(0,242,254,0.4)}50%{box-shadow:0 0 0 6px rgba(0,242,254,0)}}
.nav-label{font-size:9px;letter-spacing:3px;color:rgba(0,242,254,0.3);text-transform:uppercase;padding:0 20px;margin:16px 0 6px}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 20px;color:rgba(255,255,255,0.25);text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:none;transition:all .2s;border-left:2px solid transparent}
.nav-item:hover,.nav-item.active{color:#00f2fe;border-left-color:#00f2fe;background:rgba(0,242,254,0.03)}
.nav-item .count{margin-left:auto;font-size:9px;background:rgba(0,242,254,0.1);color:#00f2fe;padding:2px 6px;border:1px solid rgba(0,242,254,0.2)}
.sidebar-bottom{margin-top:auto;padding:20px;border-top:1px solid rgba(0,242,254,0.08)}
.user-avatar{width:28px;height:28px;border:1px solid #00f2fe;display:grid;place-items:center;font-size:11px;font-weight:700;color:#00f2fe}
.user-name{font-size:11px;font-weight:600;letter-spacing:1px}
.user-role{font-size:9px;color:rgba(0,242,254,0.4);letter-spacing:1px}
.status-row{display:flex;align-items:center;gap:6px;margin-top:12px;font-size:9px;color:rgba(0,242,254,0.4);letter-spacing:2px}
.sdot{width:5px;height:5px;background:#00f2fe;animation:blink 1.5s infinite}
@keyframes blink{0%,100%{opacity:1;box-shadow:0 0 4px #00f2fe}50%{opacity:0.2}}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative;z-index:2}
.topbar{height:56px;border-bottom:1px solid rgba(0,242,254,0.08);display:flex;align-items:center;justify-content:space-between;padding:0 28px;flex-shrink:0;background:#070709}
.search{display:flex;align-items:center;gap:8px;border:1px solid rgba(0,242,254,0.1);padding:6px 14px;width:240px;background:rgba(0,242,254,0.02)}
.search input{background:none;border:none;outline:none;color:rgba(255,255,255,0.5);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1px;width:100%}
.search input::placeholder{color:rgba(0,242,254,0.2)}
.topbar-right{display:flex;align-items:center;gap:12px}
.icon-btn{width:30px;height:30px;border:1px solid rgba(0,242,254,0.1);display:grid;place-items:center;cursor:none;font-size:13px;color:rgba(0,242,254,0.4);transition:all .2s}
.icon-btn:hover{border-color:#00f2fe;color:#00f2fe}
.content{flex:1;overflow-y:auto;padding:24px 28px}
.page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.page-title{font-size:18px;font-weight:700;letter-spacing:1px}
.page-tag{font-size:9px;letter-spacing:3px;color:#00f2fe;margin-top:4px}
.btn-sm{padding:6px 16px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:none;border:1px solid rgba(0,242,254,0.2);background:transparent;color:rgba(0,242,254,0.6);transition:all .2s}
.btn-sm:hover{border-color:#00f2fe;color:#00f2fe}
.btn-primary-sm{border-color:#00f2fe;color:#00f2fe;background:rgba(0,242,254,0.05)}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(0,242,254,0.05);margin-bottom:20px;border:1px solid rgba(0,242,254,0.08)}
.stat{background:#030303;padding:20px;position:relative;overflow:hidden}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#00f2fe,transparent);animation:slide var(--spd,3s) linear infinite}
@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
.stat-top{display:flex;justify-content:space-between;margin-bottom:12px}
.stat-icon{font-size:14px;color:rgba(0,242,254,0.3)}
.stat-trend{font-size:9px;letter-spacing:1px;padding:2px 6px;border:1px solid rgba(0,242,254,0.2);color:#00f2fe}
.stat-val{font-size:26px;font-weight:700;letter-spacing:-1px;color:#fff;margin-bottom:4px}
.stat-label{font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:2px;text-transform:uppercase}
.grid-main{display:grid;grid-template-columns:1fr 1fr 280px;gap:1px;background:rgba(0,242,254,0.05);border:1px solid rgba(0,242,254,0.08);margin-bottom:20px}
.panel{background:#030303;padding:22px}
.panel-title{font-size:9px;letter-spacing:3px;color:#00f2fe;text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.panel-title::after{content:'';flex:1;height:1px;background:rgba(0,242,254,0.1)}
.live-dot{width:5px;height:5px;background:#00f2fe;animation:blink 1.5s infinite}
.pr-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.03)}
.pr-row:last-child{border:none}
.pr-avatar{width:22px;height:22px;border:1px solid rgba(0,242,254,0.2);display:grid;place-items:center;font-size:9px;font-weight:700;color:#00f2fe;flex-shrink:0}
.pr-info{flex:1;min-width:0}
.pr-name{font-size:11px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.pr-meta{font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:1px}
.risk{padding:2px 7px;font-size:8px;font-weight:700;letter-spacing:1px}
.r-low{border:1px solid rgba(0,242,254,0.3);color:#00f2fe}
.r-med{border:1px solid rgba(255,215,0,0.3);color:#ffd700}
.r-high{border:1px solid rgba(255,77,109,0.3);color:#ff4d6d}
.heatmap{display:grid;grid-template-columns:repeat(26,1fr);gap:2px;margin-top:8px}
.hcell{aspect-ratio:1;background:rgba(0,242,254,0.04)}
.h1{background:rgba(0,242,254,0.15)}.h2{background:rgba(0,242,254,0.3)}.h3{background:rgba(0,242,254,0.5)}.h4{background:#00f2fe}
.hmap-labels{display:flex;justify-content:space-between;font-size:8px;color:rgba(0,242,254,0.2);margin-bottom:4px;letter-spacing:1px}
.right-col{display:flex;flex-direction:column;gap:1px}
.mini-panel{background:#030303;padding:20px;flex:1}
.gauge-ring{width:90px;height:90px;border-radius:50%;background:conic-gradient(#00f2fe 0deg 310deg,rgba(0,242,254,0.05) 310deg);display:grid;place-items:center;position:relative;margin:8px auto}
.gauge-ring::before{content:'';position:absolute;inset:8px;background:#030303;border-radius:50%}
.gauge-val{position:relative;z-index:1;font-size:18px;font-weight:700;color:#00f2fe}
.progress-row{margin-bottom:8px}
.progress-top{display:flex;justify-content:space-between;font-size:9px;margin-bottom:4px;letter-spacing:1px}
.progress-name{color:rgba(255,255,255,0.25)}
.progress-val{color:#00f2fe}
.bar{height:2px;background:rgba(0,242,254,0.06)}
.bar-fill{height:100%;background:linear-gradient(90deg,#00f2fe,#4facfe)}
.grid-bottom{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:rgba(0,242,254,0.05);border:1px solid rgba(0,242,254,0.08)}
.pipe-step{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1}
.pipe-dot{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700}
.pipe-done{border:1px solid #00f2fe;color:#00f2fe;background:rgba(0,242,254,0.05)}
.pipe-run{border:1px solid #4facfe;color:#4facfe;background:rgba(79,172,254,0.05)}
.pipe-label{font-size:8px;color:rgba(255,255,255,0.2);letter-spacing:1px;text-align:center}
.pipe-line{flex:1;height:1px;background:rgba(0,242,254,0.1);margin-bottom:14px}
.chart-area{height:70px;display:flex;align-items:flex-end;gap:2px;margin-top:8px}
.bar-col{flex:1;border-radius:1px 1px 0 0;min-height:4px;opacity:0.7;transition:opacity .2s}
.bar-col:hover{opacity:1}
.chart-labels{display:flex;justify-content:space-between;font-size:8px;color:rgba(0,242,254,0.2);margin-top:4px;letter-spacing:1px}
.action-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid rgba(0,242,254,0.06);margin-bottom:6px;cursor:none;transition:all .2s}
.action-item:hover{border-color:rgba(0,242,254,0.2);background:rgba(0,242,254,0.02)}
.action-icon{font-size:12px;color:rgba(0,242,254,0.4)}
.action-text{font-size:10px;letter-spacing:1px;color:rgba(255,255,255,0.4);flex:1}
.action-arrow{color:rgba(0,242,254,0.2);font-size:10px}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:#030303}
::-webkit-scrollbar-thumb{background:rgba(0,242,254,0.15)}
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="cursor-dot" id="cursorDot"></div>
<div class="scanline"></div>
<div class="sidebar">
  <a href="/" class="logo"><div class="logo-box">A</div>ACIE</a>
  <div class="nav-label">// MAIN</div>
  <a href="/dashboard" class="nav-item active">▦ OVERVIEW<span class="count">4</span></a>
  <a href="/history" class="nav-item">◷ PR_HISTORY</a>
  <a href="/copilot" class="nav-item">AI COPILOT</a>
  <a href="/war-room" class="nav-item">WAR_ROOM</a>
  <a href="/executive" class="nav-item">EXECUTIVE</a>
  <div class="nav-label">// SETTINGS</div>
  <a href="/pricing" class="nav-item">◈ PLANS</a>
  <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="nav-item">GITHUB</a>
  <div class="sidebar-bottom">
    <div style="display:flex;align-items:center;gap:10px">
      <div class="user-avatar">S</div>
      <div><div class="user-name">SAHIL_SHAIK</div><div class="user-role">PRO_PLAN</div></div>
    </div>
    <div class="status-row"><div class="sdot"></div>SYS_OPERATIONAL</div>
  </div>
</div>
<div class="main">
  <div class="topbar">
    <div class="search"><span style="color:rgba(0,242,254,0.3);font-size:11px">⌕</span><input placeholder="SEARCH... CMD+K"/></div>
    <div class="topbar-right">
      <div class="icon-btn">⚙</div>
      <div class="icon-btn">🔔</div>
      <div class="icon-btn" style="border-color:rgba(0,242,254,0.3);color:#00f2fe">S</div>
    </div>
  </div>
  <div class="content">
    <div class="page-header">
      <div><div class="page-title">DASHBOARD</div><div class="page-tag">// SAHIL-HUB-CLOUD / ACIE · LIVE</div></div>
      <div style="display:flex;gap:8px">
        <button class="btn-sm">[ EXPORT ]</button>
        <button class="btn-sm btn-primary-sm">[ + ANALYZE ]</button>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat" style="--spd:2.5s"><div class="stat-top"><span class="stat-icon">◈</span><span class="stat-trend">↑ 20%</span></div><div class="stat-val" id="total-prs">--</div><div class="stat-label">PRs_ANALYZED</div></div>
      <div class="stat" style="--spd:3s"><div class="stat-top"><span class="stat-icon">⚡</span><span class="stat-trend">LIVE</span></div><div class="stat-val" style="color:#ff4d6d" id="high-prs">--</div><div class="stat-label">HIGH_RISK</div></div>
      <div class="stat" style="--spd:3.5s"><div class="stat-top"><span class="stat-icon">◷</span><span class="stat-trend">LIVE</span></div><div class="stat-val" style="color:#ffd700" id="med-prs">--</div><div class="stat-label">MEDIUM_RISK</div></div>
      <div class="stat" style="--spd:4s"><div class="stat-top"><span class="stat-icon">◎</span><span class="stat-trend">LIVE</span></div><div class="stat-val" style="color:#00f2fe" id="low-prs">--</div><div class="stat-label">LOW_RISK</div></div>
    </div>
    <div class="grid-main">
      <div class="panel">
        <div class="panel-title"><div class="live-dot"></div>LIVE_PR_STREAM</div>
        <div id="pr-feed"><div style="color:rgba(0,242,254,0.3);font-size:11px;padding:20px 0;text-align:center;letter-spacing:2px">LOADING_DATA...</div></div>
      </div>
      <div class="panel">
        <div class="panel-title">GITHUB_ACTIVITY</div>
        <div class="hmap-labels"><span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span></div>
        <div class="heatmap" id="heatmap"></div>
      </div>
      <div class="right-col">
        <div class="mini-panel">
          <div class="panel-title">HEALTH_INDEX</div>
          <div class="gauge-ring"><div class="gauge-val">94%</div></div>
          <div class="progress-row"><div class="progress-top"><span class="progress-name">PERF</span><span class="progress-val">95</span></div><div class="bar"><div class="bar-fill" style="width:95%"></div></div></div>
          <div class="progress-row"><div class="progress-top"><span class="progress-name">SEC</span><span class="progress-val">90</span></div><div class="bar"><div class="bar-fill" style="width:90%"></div></div></div>
          <div class="progress-row"><div class="progress-top"><span class="progress-name">TEST</span><span class="progress-val" style="color:#ffd700">61</span></div><div class="bar"><div class="bar-fill" style="width:61%;background:linear-gradient(90deg,#ffd700,#ff4d6d)"></div></div></div>
          <div class="progress-row"><div class="progress-top"><span class="progress-name">QUAL</span><span class="progress-val">93</span></div><div class="bar"><div class="bar-fill" style="width:93%"></div></div></div>
        </div>
      </div>
    </div>
    <div class="grid-bottom">
      <div class="panel">
        <div class="panel-title">CI/CD_PIPELINE</div>
        <div style="font-size:9px;color:rgba(0,242,254,0.3);margin-bottom:12px;letter-spacing:1px">PROD · MAIN · VERCEL</div>
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:12px">
          <div class="pipe-step"><div class="pipe-dot pipe-done">✓</div><div class="pipe-label">BUILD</div></div>
          <div class="pipe-line"></div>
          <div class="pipe-step"><div class="pipe-dot pipe-done">✓</div><div class="pipe-label">TEST</div></div>
          <div class="pipe-line"></div>
          <div class="pipe-step"><div class="pipe-dot pipe-done">✓</div><div class="pipe-label">SCAN</div></div>
          <div class="pipe-line"></div>
          <div class="pipe-step"><div class="pipe-dot pipe-run">→</div><div class="pipe-label">DEPLOY</div></div>
        </div>
        <div style="font-size:9px;color:rgba(0,242,254,0.3);letter-spacing:1px">● BUILD_PASSING</div>
      </div>
      <div class="panel">
        <div class="panel-title">ANALYTICS</div>
        <div class="chart-area" id="chart"></div>
        <div class="chart-labels"><span>W1</span><span>W2</span><span>W3</span><span>W4</span></div>
      </div>
      <div class="panel">
        <div class="panel-title">QUICK_ACTIONS</div>
        <a href="/history" class="action-item" style="text-decoration:none"><span class="action-icon">◷</span><span class="action-text">VIEW_PR_HISTORY</span><span class="action-arrow">→</span></a>
        <a href="/copilot" class="action-item" style="text-decoration:none"><span class="action-icon">AI</span><span class="action-text">OPEN_COPILOT</span><span class="action-arrow">→</span></a>
        <a href="/war-room" class="action-item" style="text-decoration:none"><span class="action-icon">⚑</span><span class="action-text">WAR_ROOM</span><span class="action-arrow">→</span></a>
        <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="action-item" style="text-decoration:none"><span class="action-icon">⌥</span><span class="action-text">GITHUB_REPO</span><span class="action-arrow">→</span></a>
        <a href="/pricing" class="action-item" style="text-decoration:none"><span class="action-icon">◈</span><span class="action-text">UPGRADE_PLAN</span><span class="action-arrow">→</span></a>
      </div>
    </div>
  </div>
</div>
<script>
const cursor=document.getElementById('cursor');
const dot=document.getElementById('cursorDot');
window.addEventListener('mousemove',e=>{cursor.style.left=e.clientX-10+'px';cursor.style.top=e.clientY-10+'px';dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';});
window.addEventListener('mousedown',()=>cursor.style.transform='scale(0.7)');
window.addEventListener('mouseup',()=>cursor.style.transform='scale(1)');
const hm=document.getElementById('heatmap');
const levels=['','h1','h2','h3','h4'];
for(let i=0;i<156;i++){const d=document.createElement('div');d.className='hcell '+(Math.random()<0.35?'':levels[Math.floor(Math.random()*5)]);hm.appendChild(d);}
const chart=document.getElementById('chart');
const vals=[30,45,28,60,42,55,38,70,48,65,52,80,45,72,58,85,42,68,55,78,45,82,60,90,48,75,55,88,42,70];
const max=Math.max(...vals);
vals.forEach((v,i)=>{const b=document.createElement('div');b.className='bar-col';b.style.height=(v/max*100)+'%';b.style.background=i%3===0?'#00f2fe':i%3===1?'#4facfe':'rgba(0,242,254,0.3)';chart.appendChild(b);});

// Load real PR data from JSONBin
async function loadData(){
  try {
    const r = await fetch('https://api.jsonbin.io/v3/b/${BIN}/latest',{headers:{'X-Master-Key':'${KEY}'}});
    const d = await r.json();
    const records = d.record?.records || [];
    document.getElementById('total-prs').textContent = records.length;
    document.getElementById('high-prs').textContent = records.filter(r=>r.risk==='HIGH').length;
    document.getElementById('med-prs').textContent = records.filter(r=>r.risk==='MEDIUM').length;
    document.getElementById('low-prs').textContent = records.filter(r=>r.risk==='LOW').length;
    const feed = document.getElementById('pr-feed');
    if(records.length===0){feed.innerHTML='<div style="color:rgba(0,242,254,0.3);font-size:11px;padding:20px 0;text-align:center;letter-spacing:2px">NO_PR_DATA_YET</div>';return;}
    feed.innerHTML = records.slice(0,5).map(r=>{
      const risk = r.risk==='HIGH'?'r-high':r.risk==='MEDIUM'?'r-med':'r-low';
      const date = new Date(r.timestamp).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
      return '<div class="pr-row"><div class="pr-avatar">S</div><div class="pr-info"><div class="pr-name">'+r.prTitle+'</div><div class="pr-meta">'+date+' · '+r.prAuthor+' · '+r.filesChanged+' files</div></div><div class="risk '+risk+'">'+r.risk+'</div></div>';
    }).join('');
  } catch(e) { console.error(e); }
}
loadData();
</script>
</body>
</html>`);
}