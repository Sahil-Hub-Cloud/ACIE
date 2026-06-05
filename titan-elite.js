import fs from 'fs';

const THEME = `
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root { --bg: #020617; --surface: #0b0f1a; --accent: #7c3aed; --cyan: #06b6d4; }
    body { background-color: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .sidebar-link:hover { background: rgba(124, 58, 237, 0.1); color: #fff; }
    .sidebar-link.active { background: rgba(124, 58, 237, 0.15); color: #fff; border-right: 2px solid var(--accent); }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
  </style>
`;

const landing = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><title>ACIE — Google Maps for codebases.</title>${THEME}</head>
<body class="flex flex-col items-center">
  <nav class="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl px-12 py-5 flex justify-between items-center">
    <div class="text-xl font-bold flex items-center gap-2">⚡ ACIE</div>
    <div class="flex gap-8 text-xs font-semibold text-slate-400">
      <a href="/dashboard">Dashboard</a><a href="/executive">ROI</a><a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="bg-white text-black px-5 py-2 rounded-lg">Get Started</a>
    </div>
  </nav>

  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <div class="mb-6 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">Intelligence Layer V3.2 Active</div>
    <h1 class="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-tight">Predict the Break.<br><span class="grad-txt">Control the Map.</span></h1>
    <p class="text-slate-400 text-lg max-w-2xl mb-12">"The All-in-One Google Maps for codebases." <br>Architectural impact, security hotspots, and blast radius mapped in real-time.</p>
    <div class="flex gap-4"><a href="/dashboard" class="px-10 py-4 bg-white text-black rounded-xl font-bold text-sm">Launch Command Center</a></div>
  </section>

  <section class="py-20 w-full max-w-6xl grid grid-cols-3 gap-6 px-6">
    <div class="glass p-8 rounded-3xl"><h3>Blast Radius</h3><p class="text-slate-500 text-sm mt-3">Maps downstream impacts across entire module trees instantly.</p></div>
    <div class="glass p-8 rounded-3xl"><h3>Security Guard</h3><p class="text-slate-500 text-sm mt-3">Active entropy scanning for leaked secrets and vulnerability vectors.</p></div>
    <div class="glass p-8 rounded-3xl"><h3>AI Remediation</h3><p class="text-slate-500 text-sm mt-3">Automated fix PRs generated for logic failures and circular deps.</p></div>
  </section>
</body></html>\`);}`;

const dashboard = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head><title>ACIE — Command Center</title>${THEME}</head>
<body class="flex h-screen overflow-hidden">
  <aside class="w-64 bg-[#010409] border-r border-white/5 flex flex-col">
    <div class="p-8 text-xl font-bold">⚡ ACIE</div>
    <nav class="flex-1 px-4 space-y-1">
      <a href="/dashboard" class="sidebar-link active flex items-center gap-3 p-3 rounded-lg text-sm font-medium"><i data-lucide="layout-grid"></i> Overview</a>
      <a href="/war-room" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-500 hover:text-white"><i data-lucide="map"></i> War Room</a>
      <a href="/history" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-500 hover:text-white"><i data-lucide="history"></i> Logs</a>
    </nav>
    <div class="p-6 border-t border-white/5">
      <div class="glass p-4 rounded-xl text-center"><div class="text-[10px] font-bold text-slate-500 uppercase">System Integrity</div><div class="text-lg font-black text-emerald-400">98.4%</div></div>
    </div>
  </aside>

  <main class="flex-1 flex flex-col">
    <header class="h-16 border-b border-white/5 flex items-center justify-between px-10 bg-[#010409]/50">
      <div class="text-xs font-bold text-slate-500 uppercase tracking-widest">Command Center / <span class="text-white">ACIE_CORE</span></div>
      <div class="flex items-center gap-4 text-xs font-bold"><span class="text-emerald-500 flex items-center gap-1"><span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> AGENTS ONLINE</span></div>
    </header>
    
    <div class="flex-1 overflow-y-auto p-10 space-y-8">
      <div class="grid grid-cols-4 gap-4">
        <div class="glass p-6 rounded-2xl"><div class="text-[10px] font-bold text-slate-500 uppercase mb-1">Security Score</div><div id="sec-val" class="text-3xl font-black text-emerald-400">--</div></div>
        <div class="glass p-6 rounded-2xl"><div class="text-[10px] font-bold text-slate-500 uppercase mb-1">Cause Confidence</div><div id="qual-val" class="text-3xl font-black text-cyan-400">--</div></div>
        <div class="glass p-6 rounded-2xl"><div class="text-[10px] font-bold text-slate-500 uppercase mb-1">Dep. Risk</div><div id="issue-val" class="text-3xl font-black">--</div></div>
        <div class="glass p-6 rounded-2xl"><div class="text-[10px] font-bold text-slate-500 uppercase mb-1">Health</div><div id="health-val" class="text-3xl font-black text-purple-400">--</div></div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="col-span-2 glass p-8 rounded-[32px] min-h-[400px] flex flex-col">
          <div class="flex justify-between items-center mb-4"><h3 class="font-bold">Neural Activity Map</h3><span class="text-[10px] font-black bg-white/5 px-3 py-1 rounded">LIVE FEED</span></div>
          <div id="activity-feed" class="flex-1 overflow-y-auto space-y-3 pr-2" style="max-height: 380px;">
            <!-- Dynamic Feed Injected Here -->
          </div>
        </div>
        <div class="flex flex-col gap-6">
          <div class="glass p-8 rounded-[32px] flex-1">
             <h3 class="font-bold text-sm mb-6">AI Agent Status</h3>
             <div class="space-y-4">
                <div class="flex items-center justify-between text-xs"><span class="text-slate-400">Security_V3</span><span class="text-emerald-500 flex items-center gap-1.5"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Scanning</span></div>
                <div class="flex items-center justify-between text-xs"><span class="text-slate-400">DevOps_Bot</span><span class="text-emerald-500 flex items-center gap-1.5"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Scanning</span></div>
                <div class="flex items-center justify-between text-xs"><span class="text-slate-400">Impact_Engine</span><span class="text-cyan-400 flex items-center gap-1.5"><span class="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span> Active</span></div>
             </div>
          </div>
          <div class="glass p-8 rounded-[32px] bg-indigo-600/5 border-indigo-500/20">
             <h3 class="font-bold text-sm text-indigo-400 mb-2">Total ROI</h3>
             <div id="weekly-roi-val" class="text-3xl font-black">$0</div>
             <div class="text-[10px] font-bold text-slate-500 uppercase mt-2">Saved dynamically from telemetry</div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <script>
    async function refreshData() {
      try {
        const r = await fetch("https://api.jsonbin.io/v3/b/6a212bb4da38895dfe8514a5/latest", { headers: { "X-Master-Key": "$2a$10$OLH.A4d17J6/.mDf9XtqwuT0jtdNQpLP74RT1aDXXnEUFB6ry0Q/u" } });
        const d = await r.json();
        const records = d.record.records || [];
        const latest = records[0] || { securityScore: 100, qualityScore: 100, healthScore: 100, issues: 0 };
        
        document.getElementById('sec-val').innerText = (latest.securityScore || 100) + "%";
        
        document.getElementById('qual-val').innerText = latest.confidence || 'NONE';
        document.getElementById('qual-val').className = 'text-3xl font-black ' + (latest.confidence === 'HIGH' ? 'text-rose-500' : 'text-cyan-400');
        
        document.getElementById('issue-val').innerText = latest.dependencyRisk || 'LOW';
        document.getElementById('issue-val').className = 'text-3xl font-black ' + (latest.dependencyRisk === 'CRITICAL' ? 'text-rose-500' : 'text-orange-500');
        
        document.getElementById('health-val').innerText = latest.severity || 'LOW';
        document.getElementById('health-val').className = 'text-3xl font-black ' + (latest.severity === 'CRITICAL' ? 'text-rose-500' : 'text-cyan-400');
        
        document.getElementById('weekly-roi-val').innerText = "$" + (records.length * 5000).toLocaleString();

        const feed = document.getElementById('activity-feed');
        if (records.length > 0) {
          feed.innerHTML = records.slice(0, 5).map(pr => {
            const sys = pr.impactedSystems && pr.impactedSystems.length > 0 ? pr.impactedSystems.join(', ') : 'General';
            const files = pr.impactedFiles || [];
            const deps = pr.dependentFiles && pr.dependentFiles.length > 0 ? '<div class="text-[8px] text-indigo-300 mt-1 uppercase tracking-tighter font-bold">Downstream: ' + pr.dependentFiles.join(', ') + '</div>' : '';
            const cause = pr.rootCause && pr.rootCause !== 'None Detected' ? 
              '<div class="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">' +
              '<div class="text-[10px] text-rose-400 font-bold uppercase">Root Cause: ' + pr.rootCause + '</div>' +
              '<div class="text-[9px] text-gray-400 italic font-medium">Fix: ' + pr.suggestedFix + '</div></div>' : '';
            return '<div class="p-4 bg-white/5 rounded-xl border border-white/5 mb-2">' +
                   '<div class="flex justify-between"><span class="text-xs font-bold text-slate-300">PR #' + pr.prNumber + '</span>' +
                   '<span class="text-[10px] font-black text-cyan-400">AUDIT COMPLETE</span></div>' +
                   cause + deps +
                   '<div class="text-[10px] text-slate-500 mt-1">Systems: ' + sys + '</div>' +
                   '<div class="text-[9px] text-slate-600 truncate mt-1 italic mono">' + files.join(', ') + '</div></div>';
          }).join('');
        } else {
          feed.innerHTML = '<p class="text-gray-600 text-xs text-center italic">Waiting for incoming PRs...</p>';
        }
      } catch (e) { console.error("Sync Error:", e); }
    }
    window.onload = refreshData;
  </script>
</body></html>\`);}`;

fs.writeFileSync('api/landing.js', landing);
fs.writeFileSync('api/dashboard.js', dashboard);
console.log('✅ TITAN-ELITE DESIGN SYSTEM APPLIED');
