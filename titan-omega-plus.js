import fs from 'fs';

const UI_HEAD = `
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Space+Mono&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #010309; font-family: 'Plus Jakarta Sans', sans-serif; color: #f8fafc; overflow-x:hidden; -webkit-font-smoothing: antialiased; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, #00d1ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .map-grid { background-image: radial-gradient(rgba(0, 209, 255, 0.1) 1px, transparent 1px); background-size: 40px 40px; }
    .pulse-red { animation: p-red 2s infinite; }
    @keyframes p-red { 0% { box-shadow: 0 0 0 0 rgba(255, 0, 85, 0.4); } 70% { box-shadow: 0 0 0 20px rgba(255, 0, 85, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 0, 85, 0); } }
  </style>
`;

const warRoom = `<!DOCTYPE html><html><head><title>ACIE — Global War Room</title>${UI_HEAD}</head>
<body class="h-screen flex flex-col map-grid">
  <nav class="w-full px-12 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-xl">
    <div class="text-2xl font-black">⚡ ACIE <span class="text-[10px] text-gray-500 ml-2 tracking-[0.3em]">WAR_ROOM</span></div>
    <a href="/dashboard" class="text-xs font-bold text-gray-500 hover:text-white transition-colors">← EXIT COMMAND</a>
  </nav>
  <main class="flex-1 p-12 grid grid-cols-4 gap-8">
    <div class="col-span-3 glass relative overflow-hidden flex items-center justify-center">
       <div class="absolute top-10 left-10 text-[10px] font-bold text-cyan-400 tracking-widest uppercase">Global Threat Vector Map</div>
       <!-- Simulated 3D Map Visual -->
       <div class="relative w-full h-full opacity-40">
          <div class="absolute top-1/4 left-1/3 w-4 h-4 bg-rose-500 rounded-full pulse-red"></div>
          <div class="absolute top-1/2 right-1/4 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]"></div>
          <div class="absolute bottom-1/3 left-1/2 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]"></div>
          <svg class="w-full h-full"><path d="M100,200 Q 400,100 800,300" stroke="rgba(0,209,255,0.2)" fill="transparent" stroke-dasharray="5,5" /></svg>
       </div>
       <div class="absolute bottom-10 right-10 flex gap-10">
          <div class="text-center"><div class="text-2xl font-black">849</div><div class="text-[8px] text-gray-500 uppercase">Total Clusters</div></div>
          <div class="text-center"><div class="text-2xl font-black text-rose-500">01</div><div class="text-[8px] text-gray-500 uppercase">Active Threats</div></div>
       </div>
    </div>
    <div class="flex flex-col gap-6">
       <div class="glass p-6 flex-1">
          <h3 class="text-xs font-black uppercase text-gray-500 mb-6">Regional Health</h3>
          <div class="space-y-6">
             <div><div class="flex justify-between text-[10px] mb-2 font-bold"><span>NORTH_AMERICA</span><span class="text-emerald-400">98%</span></div><div class="h-1 bg-white/5 rounded-full overflow-hidden"><div class="h-full bg-emerald-500 w-[98%]"></div></div></div>
             <div><div class="flex justify-between text-[10px] mb-2 font-bold"><span>EUROPE_WEST</span><span class="text-rose-400">62%</span></div><div class="h-1 bg-white/5 rounded-full overflow-hidden"><div class="h-full bg-rose-500 w-[62%]"></div></div></div>
          </div>
       </div>
       <div class="glass p-6 h-40 bg-rose-500/5 border-rose-500/20">
          <div class="text-[10px] font-black text-rose-500 mb-2">CRITICAL_ALERT</div>
          <p class="text-[10px] leading-relaxed text-rose-300/70">Potential DDoS attack vector identified in Frankfurt Node 22. AI Agents initiating traffic rerouting...</p>
       </div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>`;

const copilot = `<!DOCTYPE html><html><head><title>ACIE — AI Copilot</title>${UI_HEAD}</head>
<body class="h-screen flex">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-8">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <div class="text-[10px] font-black text-gray-600 tracking-widest uppercase">Active Agents</div>
    <div class="space-y-4">
       <div class="flex items-center gap-3"><div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><span class="text-xs font-bold text-gray-400">Security_Agent</span></div>
       <div class="flex items-center gap-3"><div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><span class="text-xs font-bold text-gray-400">DevOps_Agent</span></div>
       <div class="flex items-center gap-3"><div class="w-2 h-2 bg-indigo-500 rounded-full"></div><span class="text-xs font-bold text-gray-400">Architect_X</span></div>
    </div>
    <a href="/dashboard" class="mt-auto text-xs text-gray-500">← Mission Control</a>
  </aside>
  <main class="flex-1 flex flex-col bg-[#010409]">
    <header class="h-20 border-b border-white/5 flex items-center px-10">
       <h1 class="text-sm font-black uppercase tracking-[0.4em] text-gray-500">Neural Data Stream</h1>
    </header>
    <div class="flex-1 p-10 font-mono text-sm overflow-y-auto space-y-4">
       <div class="text-cyan-400">> [AGENT_SEC] Initializing system-wide entropy scan...</div>
       <div class="text-gray-500">> [AGENT_DEV] Optimizing CI/CD yaml for "payment-gateway"</div>
       <div class="text-indigo-400">> [ARCHITECT_X] Mapping 42 new dependency edges in PR #105</div>
       <div class="text-emerald-500">> [SYSTEM] All scans nominal. Latency: 0.4ms</div>
       <div class="animate-pulse text-white">> _</div>
    </div>
    <div class="p-10"><div class="glass p-6 rounded-2xl flex gap-4"><input class="bg-transparent flex-1 outline-none text-sm" placeholder="Ask AI anything about your codebase..."><button class="bg-indigo-600 px-6 py-2 rounded-xl font-bold text-xs">QUERY</button></div></div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>`;

fs.writeFileSync('./public/war-room.html', warRoom);
fs.writeFileSync('./public/copilot.html', copilot);
console.log('✅ ENTERPRISE MODULES CREATED: /war-room and /copilot');
