export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><title>ACIE — Command Center</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root { --bg: #020617; --surface: #0b0f1a; --accent: #7c3aed; --cyan: #06b6d4; }
    body { background-color: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .glass { background: rgba(11, 15, 26, 0.35); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.06); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); }
    .glass-inner { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.04); }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .sidebar-link:hover { background: rgba(124, 58, 237, 0.1); color: #fff; }
    .sidebar-link.active { background: rgba(124, 58, 237, 0.15); color: #fff; border-right: 2px solid var(--accent); }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    
    .dashboard-card {
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .dashboard-card:hover {
      transform: translateY(-4px) scale(1.005);
      border-color: rgba(124, 58, 237, 0.25);
      box-shadow: 0 16px 40px -10px rgba(124, 58, 237, 0.2);
    }
    .shimmer {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.02) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.02) 75%);
      background-size: 200% 100%;
      animation: shimmer-pulse 1.6s infinite linear;
      display: inline-block;
    }
    @keyframes shimmer-pulse {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  </style>

  <script>
    function animateValue(element, start, end, duration, formatFn) {
      if(!element) return;
      const startTime = performance.now();
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress); // Ease out quad
        const current = start + ease * (end - start);
        element.innerHTML = formatFn ? formatFn(current) : Math.round(current);
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.innerHTML = formatFn ? formatFn(end) : end;
        }
      }
      requestAnimationFrame(update);
    }

    async function hydrateTitan() {
      try {
        const r = await fetch("https://api.jsonbin.io/v3/b/6a212bb4da38895dfe8514a5/latest", { headers: { "X-Master-Key": "$2a$10$OLH.A4d17J6/.mDf9XtqwuT0jtdNQpLP74RT1aDXXnEUFB6ry0Q/u" } });
        const d = await r.json();
        const records = d.record.records || [];
        const latest = records[0] || {};

        // Hydrate Top Stats with animations
        const secScore = latest.securityScore || 100;
        animateValue(document.getElementById('sec-val'), 0, secScore, 1000, (v) => Math.round(v) + "%");
        
        const secRing = document.getElementById('sec-ring');
        if (secRing) {
          secRing.setAttribute('stroke-dasharray', secScore + ', 100');
        }

        // Cause Confidence
        const qualVal = latest.confidence || "NONE";
        const qualEl = document.getElementById('qual-val');
        qualEl.innerText = qualVal;
        qualEl.className = 'text-3xl font-black ' + (qualVal === 'HIGH' ? 'text-rose-500' : 'text-cyan-400');
        
        // Dep. Risk
        const issueVal = latest.dependencyRisk || "LOW";
        const issueEl = document.getElementById('issue-val');
        issueEl.innerText = issueVal;
        issueEl.className = 'text-3xl font-black ' + (issueVal === 'CRITICAL' ? 'text-rose-500' : 'text-orange-500');

        // Health / Severity
        const severityVal = latest.severity || "LOW";
        const healthEl = document.getElementById('health-val');
        healthEl.innerText = severityVal;
        healthEl.className = 'text-3xl font-black ' + (severityVal === 'CRITICAL' ? 'text-rose-500' : 'text-cyan-400');

        // Weekly ROI
        const roiVal = records.length * 5000;
        animateValue(document.getElementById('weekly-roi-val'), 0, roiVal, 1200, (v) => "$" + Math.round(v).toLocaleString());
        
        // Hydrate Activity Feed with Intelligence
        const feedContainer = document.getElementById('activity-feed');
        if(records.length > 0) {
          feedContainer.innerHTML = records.slice(0, 5).map(pr => {
            const deps = pr.dependentFiles && pr.dependentFiles.length > 0 ? '<div class="text-[8px] text-indigo-300 mt-2 uppercase tracking-tighter font-bold bg-indigo-500/10 p-1.5 rounded-md border border-indigo-500/10">Downstream: ' + pr.dependentFiles.join(', ') + '</div>' : '';
            return '<div class="glass-inner p-4 border border-white/5 bg-slate-950/20 rounded-xl mb-3 hover:border-white/10 transition-colors">' +
              '<div class="flex justify-between items-start">' +
                '<div>' +
                  '<div class="text-xs font-bold text-white">PR #' + pr.prNumber + ' — ' + pr.repo + '</div>' +
                  '<div class="text-[10px] text-rose-400 mt-1.5 uppercase font-black bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/10 inline-block">' + pr.severity + ' RISK</div>' +
                '</div>' +
                '<div class="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">' + pr.dependencyCount + ' DEPS</div>' +
              '</div>' +
              deps +
              (pr.rootCause !== "None Detected" ? '<div class="mt-3 p-3 bg-rose-500/10 rounded-lg text-[9px] text-rose-300 border border-rose-500/10"><b>CAUSE:</b> ' + pr.rootCause + '</div>' : '') +
            '</div>';
          }).join('');
        } else {
          feedContainer.innerHTML = '<p class="text-gray-600 text-xs text-center italic mt-10">Waiting for incoming PRs...</p>';
        }
      } catch (e) { console.error("Re-wire failed", e); }
    }

    window.onload = () => {
      hydrateTitan();
      
      // System Integrity sidebar gauge animation
      const integrityVal = document.getElementById('sys-integrity-val');
      if (integrityVal) {
        animateValue(integrityVal, 0, 98.4, 1500, (v) => v.toFixed(1) + "%");
      }
      const integrityBar = document.getElementById('sys-integrity-bar');
      if (integrityBar) {
        setTimeout(() => {
          integrityBar.style.width = '98.4%';
        }, 100);
      }
    };
  </script>
</head>
<body class="flex h-screen overflow-hidden">
  <aside class="w-64 bg-[#010409] border-r border-white/5 flex flex-col">
    <div class="p-8 text-xl font-bold">⚡ ACIE</div>
    <nav class="flex-1 px-4 space-y-1">
      <a href="/dashboard" class="sidebar-link active flex items-center gap-3 p-3 rounded-lg text-sm font-medium"><i data-lucide="layout-grid"></i> Overview</a>
      <a href="/war-room" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-500 hover:text-white"><i data-lucide="map"></i> War Room</a>
      <a href="/history" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-500 hover:text-white"><i data-lucide="history"></i> Logs</a>
    </nav>
    <div class="p-6 border-t border-white/5">
      <div class="glass p-4 rounded-xl text-center relative overflow-hidden group">
        <div class="text-[10px] font-bold text-slate-500 uppercase mb-1">System Integrity</div>
        <div id="sys-integrity-val" class="text-lg font-black text-emerald-400 mb-2">0.0%</div>
        <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div id="sys-integrity-bar" class="h-full bg-emerald-500 rounded-full transition-all duration-[1500ms] ease-out" style="width: 0%"></div>
        </div>
      </div>
    </div>
  </aside>

  <main class="flex-1 flex flex-col">
    <header class="h-16 border-b border-white/5 flex items-center justify-between px-10 bg-[#010409]/50">
      <div class="text-xs font-bold text-slate-500 uppercase tracking-widest">Command Center / <span class="text-white">ACIE_CORE</span></div>
      <div class="flex items-center gap-4 text-xs font-bold"><span class="text-emerald-500 flex items-center gap-1"><span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> AGENTS ONLINE</span></div>
    </header>
    
    <div class="flex-1 overflow-y-auto p-10 space-y-8">
      <div class="grid grid-cols-4 gap-4">
        <div class="glass p-6 rounded-2xl relative overflow-hidden group dashboard-card">
          <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div class="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Security Score</div>
          <div class="glass-inner p-3 flex items-center justify-between border border-white/5 bg-slate-950/20 rounded-xl">
            <div id="sec-val" class="text-3xl font-black text-emerald-400">
              <div class="shimmer w-16 h-8 rounded"></div>
            </div>
            <div class="relative w-10 h-10">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path class="text-white/5" stroke="currentColor" stroke-width="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path id="sec-ring" class="text-emerald-400 transition-all duration-[1200ms] ease-out" stroke="currentColor" stroke-width="3" stroke-dasharray="0, 100" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
        </div>
        <div class="glass p-6 rounded-2xl relative overflow-hidden group dashboard-card">
          <div class="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div class="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Cause Confidence</div>
          <div class="glass-inner p-3 flex items-center justify-between border border-white/5 bg-slate-950/20 rounded-xl">
            <div id="qual-val" class="text-3xl font-black text-cyan-400">
              <div class="shimmer w-20 h-8 rounded"></div>
            </div>
            <div class="text-cyan-400/30 group-hover:text-cyan-400/80 transition-colors"><i data-lucide="shield-check" class="w-6 h-6"></i></div>
          </div>
        </div>
        <div class="glass p-6 rounded-2xl relative overflow-hidden group dashboard-card">
          <div class="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div class="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Dep. Risk</div>
          <div class="glass-inner p-3 flex items-center justify-between border border-white/5 bg-slate-950/20 rounded-xl">
            <div id="issue-val" class="text-3xl font-black text-orange-500">
              <div class="shimmer w-16 h-8 rounded"></div>
            </div>
            <div class="text-slate-500 group-hover:text-orange-400 transition-colors"><i data-lucide="alert-triangle" class="w-6 h-6"></i></div>
          </div>
        </div>
        <div class="glass p-6 rounded-2xl relative overflow-hidden group dashboard-card">
          <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div class="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Health</div>
          <div class="glass-inner p-3 flex items-center justify-between border border-white/5 bg-slate-950/20 rounded-xl">
            <div id="health-val" class="text-3xl font-black text-purple-400">
              <div class="shimmer w-16 h-8 rounded"></div>
            </div>
            <div class="text-purple-400/30 group-hover:text-purple-400/80 transition-colors"><i data-lucide="activity" class="w-6 h-6"></i></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="col-span-2 glass p-8 rounded-[32px] min-h-[400px] flex flex-col relative overflow-hidden dashboard-card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="network" class="w-4 h-4 text-accent"></i> Neural Activity Map</h3>
            <span class="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> LIVE FEED
            </span>
          </div>
          <div id="activity-feed" class="flex-1 overflow-y-auto space-y-3 pr-2" style="max-height: 380px;">
            <div class="glass p-4 rounded-xl border border-white/5 mb-2 opacity-60">
              <div class="flex justify-between items-start">
                <div class="w-full space-y-2">
                  <div class="shimmer w-1/2 h-3 rounded"></div>
                  <div class="shimmer w-1/4 h-2 rounded"></div>
                </div>
              </div>
            </div>
            <div class="glass p-4 rounded-xl border border-white/5 mb-2 opacity-40">
              <div class="flex justify-between items-start">
                <div class="w-full space-y-2">
                  <div class="shimmer w-2/3 h-3 rounded"></div>
                  <div class="shimmer w-1/3 h-2 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-6">
          <div class="glass p-8 rounded-[32px] flex-1 relative overflow-hidden group dashboard-card">
             <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
             <h3 class="font-bold text-sm mb-6">AI Agent Status</h3>
             <div class="space-y-3">
                <div class="glass-inner p-3 flex items-center justify-between text-xs border border-white/5 bg-slate-950/20 rounded-xl">
                  <span class="text-slate-300 font-semibold">Security_V3</span>
                  <span class="text-emerald-500 flex items-center gap-1.5 font-medium"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Scanning</span>
                </div>
                <div class="glass-inner p-3 flex items-center justify-between text-xs border border-white/5 bg-slate-950/20 rounded-xl">
                  <span class="text-slate-300 font-semibold">DevOps_Bot</span>
                  <span class="text-emerald-500 flex items-center gap-1.5 font-medium"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Scanning</span>
                </div>
                <div class="glass-inner p-3 flex items-center justify-between text-xs border border-white/5 bg-slate-950/20 rounded-xl">
                  <span class="text-slate-300 font-semibold">Impact_Engine</span>
                  <span class="text-cyan-400 flex items-center gap-1.5 font-medium"><span class="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span> Active</span>
                </div>
             </div>
          </div>
          <div class="glass p-8 rounded-[32px] bg-indigo-600/5 border-indigo-500/20 relative overflow-hidden group dashboard-card">
             <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
             <h3 class="font-bold text-sm text-indigo-400 mb-3">Total ROI</h3>
             <div class="glass-inner p-4 border border-white/5 bg-slate-950/20 rounded-xl">
               <div id="weekly-roi-val" class="text-3xl font-black text-white">
                 <div class="shimmer w-24 h-8 rounded"></div>
               </div>
               <div class="text-[10px] font-bold text-slate-500 uppercase mt-2">Saved dynamically from telemetry</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>`);}