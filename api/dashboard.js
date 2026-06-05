export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html><html><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background: #010409; color: #f8fafc; font-family: 'Inter', sans-serif; overflow: hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, #00d1ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  </style>
  <script>
    async function refreshData() {
      try {
        const r = await fetch("https://api.jsonbin.io/v3/b/6a212bb4da38895dfe8514a5/latest", { headers: { "X-Master-Key": "$2a$10$OLH.A4d17J6/.mDf9XtqwuT0jtdNQpLP74RT1aDXXnEUFB6ry0Q/u" } });
        const d = await r.json();
        const records = d.record.records || [];
        // Safety: If no data, use 100s, else use real data
        const latest = records[0] || { securityScore: 100, qualityScore: 100, healthScore: 100, issues: 0 };
        
        document.getElementById('sec-val').innerText = (latest.securityScore || 100) + "%";
        document.getElementById('qual-val').innerText = latest.confidence || 'NONE'; document.getElementById('qual-val').className = 'text-xl font-black ' + (latest.confidence === 'HIGH' ? 'text-rose-500' : 'text-cyan-400');
        document.getElementById('health-val').innerText = (latest.healthScore || 100) + "%"; document.getElementById('health-val').innerText = latest.severity || 'LOW'; document.getElementById('health-val').className = 'text-4xl font-black ' + (latest.severity === 'CRITICAL' ? 'text-rose-500' : 'text-cyan-400');
        document.getElementById('issue-val').innerText = latest.dependencyRisk || 'LOW'; document.getElementById('issue-val').className = 'text-2xl font-black ' + (latest.dependencyRisk === 'CRITICAL' ? 'text-rose-500' : 'text-orange-500');

        const feed = document.getElementById('activity-feed');
        if (records.length > 0) {
          feed.innerHTML = records.slice(0, 5).map(pr => {
            const sys = pr.impactedSystems && pr.impactedSystems.length > 0 ? pr.impactedSystems.join(', ') : 'General';
            const files = pr.impactedFiles || [];
            const deps = pr.dependentFiles && pr.dependentFiles.length > 0 ? '<div class="text-[8px] text-indigo-300 mt-1 uppercase tracking-tighter font-bold">Downstream: ' + pr.dependentFiles.join(', ') + '</div>' : '';
            const cause = pr.rootCause && pr.rootCause !== 'None Detected' ? 
              '<div class="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">' +
              '<div class="text-[10px] text-rose-400 font-bold uppercase">Root Cause: ' + pr.rootCause + '</div>' +
              '<div class="text-[9px] text-gray-400 italic">Fix: ' + pr.suggestedFix + '</div></div>' : '';
            return '<div class="p-4 bg-white/5 rounded-xl border border-white/5 mb-2">' +
                   '<div class="flex justify-between"><span class="text-xs font-bold">PR #' + pr.prNumber + '</span>' +
                   '<span class="text-[10px] font-black text-cyan-400">AUDIT COMPLETE</span></div>' +
                   cause + deps +
                   '<div class="text-[10px] text-gray-500 mt-1">Systems: ' + sys + '</div>' +
                   '<div class="text-[9px] text-gray-600 truncate mt-1 italic">' + files.join(', ') + '</div></div>';
          }).join('');
        } else {
          feed.innerHTML = '<p class="text-gray-600 text-xs text-center italic">Waiting for incoming PRs...</p>';
        }
      } catch (e) { console.error("Sync Error:", e); }
    }
    window.onload = refreshData;
  </script>
</head>
<body class="flex h-screen overflow-hidden">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-10">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <nav class="flex flex-col gap-3 flex-1 text-sm font-bold text-gray-500">
      <a href="/dashboard" class="flex items-center gap-3 text-white bg-white/5 p-3 rounded-xl border border-white/10"><i data-lucide="layout-dashboard"></i> Dashboard</a>
      <a href="/copilot" class="flex items-center gap-3 hover:text-white p-3"><i data-lucide="bot"></i> AI Copilot</a>
      <a href="/executive" class="flex items-center gap-3 hover:text-white p-3"><i data-lucide="gem"></i> Executive ROI</a>
    </nav>
  </aside>
  <main class="flex-1 p-12 overflow-y-auto">
    <header class="flex justify-between items-center mb-12">
      <h1 class="text-4xl font-black tracking-tight">Mission Control</h1>
      <div class="text-xs font-bold text-cyan-400 glass px-6 py-2 rounded-full uppercase tracking-widest">Sahil-Hub-Cloud / ACIE</div>
    </header>
    <div class="grid grid-cols-4 gap-6 mb-12">
      <div class="glass p-8 text-center"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Security</div><div id="sec-val" class="text-4xl font-black text-emerald-400">--</div></div>
      <div class="glass p-8 text-center"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Cause Confidence</div><div id="qual-val" class="text-4xl font-black text-white">--</div></div>
      <div class="glass p-8 text-center"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Dep. Risk</div><div id="issue-val" class="text-4xl font-black text-rose-500">--</div></div>
      <div class="glass p-8 text-center"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Health</div><div id="health-val" class="text-4xl font-black text-cyan-400">--</div></div>
    </div>
    <div class="grid grid-cols-2 gap-6">
      <div class="glass p-10 min-h-[300px]">
        <h3 class="font-bold text-xs tracking-widest uppercase mb-6 text-gray-500">Live Activity Feed</h3>
        <div id="activity-feed" class="space-y-4"></div>
      </div>
      <div class="glass p-10 text-center">
        <h3 class="font-bold text-xs tracking-widest uppercase mb-6 text-gray-500">Health Index</h3>
        <div class="w-32 h-32 rounded-full border-8 border-white/5 border-t-purple-500 flex items-center justify-center text-3xl font-black mx-auto">94%</div>
      </div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>`);
}