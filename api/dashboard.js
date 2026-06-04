export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #020617; font-family: 'Inter', sans-serif; color: #f8fafc; }
    h1, h2, h3 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .aurora { position: fixed; inset: 0; filter: blur(100px); z-index: -1; opacity: 0.5; }
    .orb { position: absolute; border-radius: 50%; animation: float 20s infinite alternate; }
    .orb-p { width: 600px; height: 600px; background: radial-gradient(circle, #7c3aed33, transparent 70%); top: -200px; left: -100px; }
    .orb-c { width: 500px; height: 500px; background: radial-gradient(circle, #06b6d422, transparent 70%); bottom: -100px; right: -100px; }
    @keyframes float { from { transform: translate(0,0); } to { transform: translate(100px, 50px); } }
    .neon-border { border: 1px solid transparent; background-image: linear-gradient(#020617, #020617), linear-gradient(135deg, #7c3aed, #06b6d4); background-origin: border-box; background-clip: padding-box, border-box; }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .brain-pulse { animation: brain-glow 4s infinite alternate; }
    @keyframes brain-glow { from { filter: drop-shadow(0 0 10px #7c3aed33); } to { filter: drop-shadow(0 0 40px #7c3aed88); } }
  </style>
</head><body>
  <div class="flex h-screen overflow-hidden">
    <!-- TITAN SIDEBAR -->
    <aside class="w-72 bg-slate-950 border-r border-white/5 p-8 flex flex-col">
      <div class="text-2xl font-extrabold mb-12"><span class="text-purple-500">⚡</span> ACIE</div>
      <nav class="space-y-2 flex-1">
        <a href="#" class="flex items-center gap-3 px-5 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-bold"><i data-lucide="layout-grid"></i> Dashboard</a>
        <a href="#" class="flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-white transition-colors"><i data-lucide="database"></i> Repositories</a>
        <a href="#" class="flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-white transition-colors"><i data-lucide="shield-check"></i> Security</a>
        <a href="/copilot" class="flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-white transition-colors"><i data-lucide="bot"></i> AI Copilot</a>
        <a href="#" class="flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-white transition-colors"><i data-lucide="bar-chart-3"></i> Analytics</a>
      </nav>
      <div class="glass p-5 rounded-2xl">
        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">System Status</div>
        <div class="flex items-center gap-2 text-emerald-400 text-sm font-bold"><span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> All Systems Operational</div>
      </div>
    </aside>

    <!-- MAIN INTERFACE -->
    <main class="flex-1 overflow-y-auto p-12 bg-[#010409]">
      <header class="flex justify-between items-center mb-12">
        <h1 class="text-4xl font-extrabold tracking-tighter">Command Center</h1>
        <div class="flex gap-4">
          <div class="glass px-6 py-2 rounded-full text-xs font-bold text-cyan-400 border-cyan-400/20">REPOSTORY: ACIE_PRODUCTION</div>
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 border border-white/20"></div>
        </div>
      </header>

      <!-- METRICS GRID -->
      <div class="grid grid-cols-4 gap-6 mb-12">
        <div class="glass p-8 rounded-3xl"><div class="text-slate-500 text-xs font-bold uppercase mb-2">Security Score</div><div class="text-4xl font-black text-emerald-400">98%</div></div>
        <div class="glass p-8 rounded-3xl"><div class="text-slate-500 text-xs font-bold uppercase mb-2">Code Quality</div><div class="text-4xl font-black">96%</div></div>
        <div class="glass p-8 rounded-3xl"><div class="text-slate-500 text-xs font-bold uppercase mb-2">Deploy Success</div><div class="text-4xl font-black text-purple-400">99.2%</div></div>
        <div class="glass p-8 rounded-3xl"><div class="text-slate-500 text-xs font-bold uppercase mb-2">Open Issues</div><div class="text-4xl font-black text-rose-500">12</div></div>
      </div>

      <!-- VISUAL ENGINE -->
      <div class="grid grid-cols-3 gap-6">
        <div class="col-span-2 glass p-10 rounded-3xl min-h-[400px] relative overflow-hidden">
          <h3 class="text-xl font-bold mb-8">Predictive Risk Analysis</h3>
          <div class="h-64 w-full flex items-end gap-2">
            <div class="flex-1 bg-white/5 border-t-2 border-indigo-500/50 h-[80%] rounded-t-lg animate-pulse"></div>
            <div class="flex-1 bg-white/5 border-t-2 border-indigo-500/50 h-[40%] rounded-t-lg"></div>
            <div class="flex-1 bg-white/5 border-t-2 border-cyan-500/50 h-[90%] rounded-t-lg"></div>
            <div class="flex-1 bg-white/5 border-t-2 border-indigo-500/50 h-[60%] rounded-t-lg animate-pulse"></div>
          </div>
          <p class="text-slate-500 text-sm mt-8">Neural network has processed 2,450 commits. No architectural instability detected.</p>
        </div>
        
        <div class="glass p-10 rounded-3xl text-center">
          <h3 class="text-xl font-bold mb-10">Health Index</h3>
          <div class="relative w-40 h-40 mx-auto mb-6">
            <svg class="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="10"></circle>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#7c3aed" stroke-width="10" stroke-dasharray="283" stroke-dashoffset="20"></circle>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center text-4xl font-black">94%</div>
          </div>
          <div class="text-xs font-bold text-slate-500 uppercase">System Integrity</div>
        </div>
      </div>
    </main>
  </div>
  <script>lucide.createIcons();</script>
</body></html>`);}