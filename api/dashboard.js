export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #020617; font-family: 'Inter', sans-serif; color: #f8fafc; scroll-behavior: smooth; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .node-pulse { animation: node-glow 3s infinite alternate; }
    @keyframes node-glow { from { filter: drop-shadow(0 0 2px #7c3aed33); } to { filter: drop-shadow(0 0 15px #7c3aed88); } }
    .counter { font-variant-numeric: tabular-nums; }
  </style>
</head><body>
  <div class="flex h-screen overflow-hidden">
    <aside class="w-72 bg-slate-950 border-r border-white/5 p-8 flex flex-col">
      <div class="text-2xl font-extrabold mb-12">⚡ ACIE</div>
      <nav class="space-y-2 flex-1">
        <a href="/dashboard" class="flex items-center gap-3 px-5 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-bold"><i data-lucide="layout-grid" class="w-4 h-4"></i> Dashboard</a>
        <a href="/command-center" class="flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-white transition-colors"><i data-lucide="cpu" class="w-4 h-4"></i> Command Center</a>
        <a href="/executive" class="flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-white transition-colors"><i data-lucide="line-chart" class="w-4 h-4"></i> Executive View</a>
        <a href="/copilot" class="flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-white transition-colors"><i data-lucide="bot" class="w-4 h-4"></i> AI Copilot</a>
      </nav>
    </aside>

    <main class="flex-1 overflow-y-auto p-12">
      <div class="flex justify-between items-end mb-12">
        <div>
           <h1 class="text-4xl font-extrabold tracking-tighter">Command Center</h1>
           <p class="text-slate-500 text-sm mt-1">Multi-agent AI Intelligence Layer</p>
        </div>
        <div class="flex gap-4">
           <div class="glass px-4 py-2 rounded-xl text-xs font-bold text-emerald-400"><i data-lucide="check-circle" class="w-3 h-3 inline mr-1"></i> AGENTS ONLINE</div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <!-- AGENT 1 -->
        <div class="glass p-8 rounded-3xl border-t-2 border-emerald-500/30">
          <div class="flex justify-between mb-6">
            <div class="p-3 bg-emerald-500/10 rounded-2xl"><i data-lucide="shield-check" class="text-emerald-400"></i></div>
            <span class="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded h-fit">ONLINE</span>
          </div>
          <h3 class="font-bold text-lg">AI Security Engineer</h3>
          <p class="text-slate-500 text-sm mt-2 mb-6">Actively monitoring PR #112. No leaked secrets detected in the last 200 commits.</p>
          <button class="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">VIEW AUDIT LOG</button>
        </div>
        
        <!-- AGENT 2 -->
        <div class="glass p-8 rounded-3xl border-t-2 border-indigo-500/30">
          <div class="flex justify-between mb-6">
            <div class="p-3 bg-indigo-500/10 rounded-2xl"><i data-lucide="terminal" class="text-indigo-400"></i></div>
            <span class="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded h-fit">ONLINE</span>
          </div>
          <h3 class="font-bold text-lg">AI DevOps Engineer</h3>
          <p class="text-slate-500 text-sm mt-2 mb-6">Optimization found: Github Actions caching could save 4m per build. Apply fix?</p>
          <button class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all">GENERATE FIX PR</button>
        </div>

        <!-- AGENT 3 -->
        <div class="glass p-8 rounded-3xl border-t-2 border-gold-500/30">
          <div class="flex justify-between mb-6">
            <div class="p-3 bg-orange-500/10 rounded-2xl"><i data-lucide="briefcase" class="text-orange-400"></i></div>
            <span class="text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded h-fit">ONLINE</span>
          </div>
          <h3 class="font-bold text-lg">AI CTO Advisor</h3>
          <p class="text-slate-500 text-sm mt-2 mb-6">Current Architecture Complexity is 12% above benchmark. Recommend refactor of /auth.</p>
          <button class="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">GET ARCHITECTURE MAP</button>
        </div>
      </div>
    </main>
  </div>
  <script>lucide.createIcons();</script>
</body></html>`);}