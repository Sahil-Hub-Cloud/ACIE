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
  <div class="flex h-screen bg-[#010409]">
    <aside class="w-20 bg-slate-950 border-r border-white/5 flex flex-col items-center py-8 gap-10">
      <div class="text-xl font-bold text-cyan-400">⚡</div>
      <a href="/dashboard" class="text-slate-500 hover:text-white"><i data-lucide="layout-grid"></i></a>
      <a href="/copilot" class="text-white"><i data-lucide="bot"></i></a>
    </aside>
    <main class="flex-1 flex flex-col">
      <header class="h-16 border-b border-white/5 flex items-center px-10 justify-between">
        <h1 class="font-bold text-sm tracking-widest uppercase text-slate-400">Neural Copilot Instance</h1>
        <div class="flex gap-4">
           <span class="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">AI: THINKING</span>
        </div>
      </header>
      <div class="flex-1 p-12 overflow-y-auto space-y-8">
        <div class="flex gap-4">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">A</div>
          <div class="max-w-2xl glass p-6 rounded-2xl text-sm leading-relaxed">
            Hello Sahil. I have analyzed the <b>ACIE_CORE</b> repository. Architectural health is at 94%. Would you like me to generate a fix for the circular dependency detected in the Auth module?
          </div>
        </div>
      </div>
      <div class="p-10">
        <div class="max-w-4xl mx-auto relative">
          <input type="text" class="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm focus:outline-none focus:border-indigo-500 transition-colors" placeholder="Ask about repository, explain code, or generate a fix...">
          <button class="absolute right-4 top-4 bg-indigo-500 p-2 rounded-xl hover:scale-110 transition-transform"><i data-lucide="send" class="w-5 h-5"></i></button>
        </div>
      </div>
    </main>
  </div>
  <script>lucide.createIcons();</script>
</body></html>`);}