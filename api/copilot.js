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
  <div class="flex h-screen bg-[#010409]">
    <aside class="w-72 bg-slate-950 border-r border-white/5 p-8 flex flex-col">
       <div class="text-2xl font-extrabold mb-12 text-cyan-400">⚡ ACIE</div>
       <div class="space-y-4">
          <div class="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Quick Actions</div>
          <button class="w-full p-4 glass rounded-2xl text-left text-xs font-bold hover:border-indigo-500/50 transition-all flex items-center gap-3"><i data-lucide="file-text" class="w-4 h-4"></i> Explain Repository</button>
          <button class="w-full p-4 glass rounded-2xl text-left text-xs font-bold hover:border-rose-500/50 transition-all flex items-center gap-3"><i data-lucide="skull" class="w-4 h-4"></i> Find Vulnerabilities</button>
          <button class="w-full p-4 glass rounded-2xl text-left text-xs font-bold hover:border-cyan-500/50 transition-all flex items-center gap-3"><i data-lucide="code-2" class="w-4 h-4"></i> Generate Fixes</button>
       </div>
    </aside>
    <main class="flex-1 flex flex-col p-10">
       <div class="flex-1 glass rounded-3xl p-10 flex flex-col">
          <div class="flex-1 overflow-y-auto space-y-6">
             <div class="flex gap-4">
                <div class="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold">A</div>
                <div class="max-w-xl text-sm text-slate-300">I am your AI Security Engineer. I've finished the deep-scan of <b>ACIE_PROD</b>. There are 2 potential secret leaks in <i>config.js</i>. Should I redact them?</div>
             </div>
          </div>
          <div class="mt-6 flex gap-4">
             <input class="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm focus:outline-none" placeholder="Message ACIE Copilot...">
             <button class="px-8 bg-white text-black rounded-2xl font-bold"><i data-lucide="send"></i></button>
          </div>
       </div>
    </main>
  </div>
  <script>lucide.createIcons();</script>
</body></html>`);}