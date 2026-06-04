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
  <nav class="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl px-12 py-5 flex justify-between items-center">
    <div class="text-2xl font-extrabold flex items-center gap-2"><span class="text-cyan-400">⚡</span> ACIE</div>
    <div class="flex gap-10 text-sm font-semibold text-slate-400">
      <a href="/dashboard" class="hover:text-white transition-colors">Platform</a>
      <a href="/executive" class="hover:text-white transition-colors">Executive</a>
      <a href="/pricing" class="hover:text-white transition-colors">Pricing</a>
      <a href="/dashboard" class="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-500 transition-all">Launch Console</a>
    </div>
  </nav>

  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
    <h1 class="text-7xl md:text-9xl font-extrabold tracking-tighter mb-8 leading-[0.85]">Build. Secure.<br><span class="grad-txt">Automate. Scale.</span></h1>
    <p class="text-slate-400 text-xl max-w-2xl mb-12 italic">"The Google Maps for your codebase."</p>
    
    <div class="grid grid-cols-3 gap-12 mt-10 w-full max-w-4xl border-t border-white/5 pt-12">
       <div><div class="text-3xl font-bold text-white counter">500,000+</div><div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Repositories Mapped</div></div>
       <div><div class="text-3xl font-bold text-cyan-400 counter">12M+</div><div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">PRs Analyzed</div></div>
       <div><div class="text-3xl font-bold text-indigo-400 counter">850K+</div><div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Threats Blocked</div></div>
    </div>
  </section>

  <!-- ARCHITECTURE MAP SECTION -->
  <section class="py-32 px-12 bg-slate-950/30">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div>
        <h2 class="text-5xl font-extrabold mb-8 tracking-tight">See Your Codebase<br><span class="text-indigo-500">Like Never Before</span></h2>
        <p class="text-slate-400 text-lg mb-10">ACIE generates a live, interactive neural map of your entire architecture. Detect service bottlenecks, calculate blast radius, and identify security hotspots in 3D space.</p>
        <ul class="space-y-4">
          <li class="flex items-center gap-3 text-slate-300 font-medium"><i data-lucide="share-2" class="text-cyan-400 w-5 h-5"></i> Real-time Service Dependency Graph</li>
          <li class="flex items-center gap-3 text-slate-300 font-medium"><i data-lucide="zap" class="text-indigo-400 w-5 h-5"></i> Visual Blast Radius Simulation</li>
          <li class="flex items-center gap-3 text-slate-300 font-medium"><i data-lucide="shield-alert" class="text-rose-400 w-5 h-5"></i> Security Hotspot Heatmapping</li>
        </ul>
      </div>
      <div class="glass p-4 rounded-3xl h-[500px] relative overflow-hidden group">
         <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
         <!-- SIMULATED GRAPH NODES -->
         <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div class="w-16 h-16 bg-indigo-600/20 border-2 border-indigo-500 rounded-full flex items-center justify-center node-pulse relative z-10">
               <i data-lucide="box" class="text-white"></i>
            </div>
            <div class="absolute top-[-100px] left-[-120px] w-12 h-12 glass border-cyan-500/50 rounded-full flex items-center justify-center animate-bounce"><i data-lucide="database" class="w-4 h-4 text-cyan-400"></i></div>
            <div class="absolute top-[80px] left-[150px] w-12 h-12 glass border-rose-500/50 rounded-full flex items-center justify-center animate-pulse"><i data-lucide="shield" class="w-4 h-4 text-rose-400"></i></div>
            <svg class="absolute inset-0 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 opacity-20">
               <line x1="300" y1="300" x2="180" y2="200" stroke="#00d1ff" stroke-width="2" />
               <line x1="300" y1="300" x2="450" y2="380" stroke="#7000ff" stroke-width="2" />
            </svg>
         </div>
         <div class="absolute bottom-6 left-6 text-[10px] font-bold text-slate-500 tracking-tighter bg-black/50 px-3 py-1 rounded">NEURAL_MAP_V2.0</div>
      </div>
    </div>
  </section>

  <footer class="py-20 text-center border-t border-white/5">
    <div class="flex justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all mb-10">
       <span class="font-bold text-xl">GITHUB</span><span class="font-bold text-xl">AWS</span><span class="font-bold text-xl">AZURE</span><span class="font-bold text-xl">DOCKER</span>
    </div>
    <p class="text-slate-600 text-sm">Built by Sahil-Hub-Cloud • Enterprise Ready • © 2026 ACIE Inc.</p>
  </footer>
  <script>lucide.createIcons();</script>
</body></html>`);}