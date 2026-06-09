export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html><html><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>ACIE — Command Center War Room</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; }
    .glass { background: rgba(11, 15, 26, 0.35); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.06); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); }
    .glass-inner { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.04); }
    .sidebar-link:hover { background: rgba(124, 58, 237, 0.1); color: #fff; }
    .sidebar-link.active { background: rgba(124, 58, 237, 0.15); color: #fff; border-right: 2px solid var(--accent); }
    :root { --accent: #7c3aed; }
    .map-bg { background-image: radial-gradient(#1e293b 1px, transparent 1px); background-size: 25px 25px; }
    
    @keyframes ticker-slide {
       0% { transform: translateX(0); }
       100% { transform: translateX(-50%); }
    }
    .ticker-content {
       display: flex;
       animation: ticker-slide 30s linear infinite;
       width: max-content;
    }
    
    @keyframes dash {
       to {
          stroke-dashoffset: -40;
       }
    }
    .attack-arc-1 {
       animation: dash 5s linear infinite;
    }
    .attack-arc-2 {
       animation: dash 4s linear infinite;
    }
    .attack-arc-3 {
       animation: dash 3s linear infinite;
    }
    
    .pulse-red {
       animation: p-red 2s infinite;
    }
    @keyframes p-red {
       0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
       70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
       100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    .sidebar-link:hover { background: rgba(124, 58, 237, 0.1); color: #fff; }
    .sidebar-link.active { background: rgba(124, 58, 237, 0.15); color: #fff; border-right: 2px solid var(--accent); }
   </style>
   <script>
    function openDrawer() {
      document.getElementById('sidebar').classList.remove('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.add('opacity-100', 'pointer-events-auto');
    }
    function closeDrawer() {
      document.getElementById('sidebar').classList.add('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.remove('opacity-100', 'pointer-events-auto');
    }
   </script>
 </head>
 <body class="flex h-screen overflow-hidden bg-slate-950 text-[#f8fafc]">
   <!-- Sidebar Backdrop Overlay -->
   <div id="sidebar-overlay" onclick="closeDrawer()" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300 md:hidden"></div>

   <!-- Sidebar -->
   <aside id="sidebar" class="fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#010409] border-r border-white/5 flex flex-col h-full transition-transform duration-300 transform -translate-x-full md:translate-x-0 shrink-0">
     <button onclick="closeDrawer()" class="absolute top-6 right-6 text-slate-500 hover:text-white md:hidden focus:outline-none"><i data-lucide="x" class="w-6 h-6"></i></button>
     <div class="p-8 text-xl font-bold flex items-center gap-2">⚡ ACIE</div>
     <nav class="flex-1 px-4 space-y-1">
       <a href="/dashboard" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="layout-grid"></i> Overview</a>
       <a href="/copilot" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="bot"></i> AI Copilot</a>
       <a href="/war-room" class="sidebar-link active flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-white"><i data-lucide="map"></i> War Room</a>
       <a href="/history" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="history"></i> Logs</a>
       <a href="/executive" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="trending-up"></i> ROI</a>
     </nav>
     <div class="p-6 border-t border-white/5 bg-[#010409]">
       <div class="glass p-4 rounded-xl text-center relative overflow-hidden group">
         <div class="text-[10px] font-bold text-slate-500 uppercase mb-1">System Integrity</div>
         <div class="text-lg font-black text-emerald-400">98.4%</div>
       </div>
     </div>
   </aside>
 
   <!-- Main View -->
   <main class="flex-1 flex flex-col h-full overflow-hidden">
     <!-- Mobile Header -->
     <header class="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#010409]/50 md:hidden shrink-0 w-full">
       <button onclick="openDrawer()" class="text-white focus:outline-none"><i data-lucide="menu" class="w-6 h-6"></i></button>
       <div class="text-lg font-bold flex items-center gap-2">⚡ ACIE</div>
       <div class="w-6"></div>
     </header>

     <!-- Desktop Header -->
     <header class="hidden md:flex h-16 border-b border-white/5 items-center justify-between px-10 bg-[#010409]/50 shrink-0">
       <div class="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Command Center / <span class="text-white">WAR_ROOM</span></div>
       <div class="flex items-center gap-4 text-xs font-bold">
         <span class="text-rose-500 flex items-center gap-1.5 font-black uppercase tracking-wider bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/10 animate-pulse">
           <span class="w-2 h-2 bg-rose-500 rounded-full"></span> 1 ACTIVE THREAT
         </span>
       </div>
     </header>
 
     <!-- Content Area (Grid) -->
     <div class="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 md:p-8 overflow-y-auto lg:overflow-hidden min-h-0">
       <!-- Interactive Threat Vector Map -->
       <div class="col-span-1 lg:col-span-3 glass p-6 rounded-[32px] relative overflow-hidden flex flex-col border border-white/5">
        <div class="flex justify-between items-center mb-4 relative z-20">
          <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="globe" class="w-4 h-4 text-cyan-400"></i> Global Threat Vector Map</h3>
          <div class="flex items-center gap-4 text-[10px] font-mono text-slate-400">
             <span class="flex items-center gap-1.5"><span class="w-2 h-2 bg-emerald-500 rounded-full"></span> NA_NODES</span>
             <span class="flex items-center gap-1.5"><span class="w-2 h-2 bg-rose-500 rounded-full"></span> EU_NODES</span>
             <span class="flex items-center gap-1.5"><span class="w-2 h-2 bg-purple-500 rounded-full"></span> AP_NODES</span>
          </div>
        </div>

        <!-- Simulated Map Grid Background -->
        <div class="flex-1 relative rounded-2xl bg-black/40 border border-white/5 overflow-hidden">
          <div class="absolute inset-0 map-bg opacity-35"></div>
          
          <!-- Neural Attack Arcs (SVG) -->
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 800 450">
             <!-- Wave Grid (Grid line connectors) -->
             <line x1="200" y1="180" x2="480" y2="150" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />
             <line x1="480" y1="150" x2="680" y2="220" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />
             <line x1="560" y1="310" x2="680" y2="220" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />
             
             <!-- Seattle (200, 180) to Frankfurt (480, 150) Arc -->
             <path d="M 200 180 Q 340 70 480 150" fill="none" stroke="rgba(239, 68, 68, 0.5)" stroke-width="2" stroke-dasharray="8 4" class="attack-arc-1" />
             
             <!-- Frankfurt (480, 150) to Tokyo (680, 220) Arc -->
             <path d="M 480 150 Q 580 90 680 220" fill="none" stroke="rgba(59, 130, 246, 0.5)" stroke-width="2" stroke-dasharray="6 3" class="attack-arc-2" />
             
             <!-- Singapore (560, 310) to Tokyo (680, 220) Arc -->
             <path d="M 560 310 Q 620 250 680 220" fill="none" stroke="rgba(168, 85, 247, 0.5)" stroke-width="2" stroke-dasharray="10 5" class="attack-arc-3" />
          </svg>

          <!-- Node Markers -->
          <!-- Seattle (NA_NODE) -->
          <div class="absolute top-[40%] left-[25%] -translate-x-1/2 -translate-y-1/2 group">
             <span class="absolute inline-flex h-8 w-8 rounded-full bg-emerald-500/10 animate-ping opacity-75"></span>
             <span class="relative flex h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#010409]"></span>
             <div class="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900/90 border border-white/10 px-2 py-1 rounded text-[8px] font-mono whitespace-nowrap z-10">SEATTLE [NA_01]: 98%</div>
          </div>

          <!-- Frankfurt (EU_NODE) -->
          <div class="absolute top-[33%] left-[60%] -translate-x-1/2 -translate-y-1/2 group">
             <span class="absolute inline-flex h-10 w-10 rounded-full bg-rose-500/20 animate-ping opacity-100"></span>
             <span class="relative flex h-4 w-4 rounded-full bg-rose-500 border-2 border-[#010409] pulse-red"></span>
             <div class="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900/90 border border-rose-500/30 px-2 py-1 rounded text-[8px] font-mono text-rose-400 whitespace-nowrap z-10">FRANKFURT [EU_04]: 62% (CRITICAL)</div>
          </div>

          <!-- Tokyo (AP_NODE) -->
          <div class="absolute top-[48%] left-[85%] -translate-x-1/2 -translate-y-1/2 group">
             <span class="absolute inline-flex h-8 w-8 rounded-full bg-emerald-500/10 animate-ping opacity-75"></span>
             <span class="relative flex h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#010409]"></span>
             <div class="absolute right-6 top-1/2 -translate-y-1/2 bg-slate-900/90 border border-white/10 px-2 py-1 rounded text-[8px] font-mono whitespace-nowrap z-10">TOKYO [AP_02]: 100%</div>
          </div>

          <!-- Singapore (AP_NODE_2) -->
          <div class="absolute top-[68%] left-[70%] -translate-x-1/2 -translate-y-1/2 group">
             <span class="absolute inline-flex h-8 w-8 rounded-full bg-purple-500/10 animate-ping opacity-75"></span>
             <span class="relative flex h-3.5 w-3.5 rounded-full bg-purple-500 border-2 border-[#010409]"></span>
             <div class="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900/90 border border-white/10 px-2 py-1 rounded text-[8px] font-mono whitespace-nowrap z-10">SINGAPORE [AP_05]: 99%</div>
          </div>

          <div class="absolute bottom-6 left-6 text-[10px] font-mono text-slate-500">
             MAP_TELEMETRY: SYNCHRONIZED
          </div>
        </div>

        <!-- Telemetry Summary Boxes -->
        <div class="grid grid-cols-3 gap-4 mt-4 relative z-10 shrink-0">
          <div class="glass-inner p-4 border border-white/5 bg-slate-950/20 rounded-2xl text-center">
             <div class="text-[9px] font-bold text-slate-500 uppercase">Telemetry Signal</div>
             <div class="text-2xl font-black text-emerald-400 mt-1">NOMINAL</div>
          </div>
          <div class="glass-inner p-4 border border-white/5 bg-slate-950/20 rounded-2xl text-center">
             <div class="text-[9px] font-bold text-slate-500 uppercase">Active Threats</div>
             <div class="text-2xl font-black text-rose-500 mt-1">01</div>
          </div>
          <div class="glass-inner p-4 border border-white/5 bg-slate-950/20 rounded-2xl text-center">
             <div class="text-[9px] font-bold text-slate-500 uppercase">Cluster Load</div>
             <div class="text-2xl font-black mt-1">42.8%</div>
          </div>
        </div>
      </div>

      <!-- Regional Health Column -->
      <div class="col-span-1 flex flex-col gap-5 overflow-y-auto">
         <!-- Regional Stats -->
         <div class="glass p-6 rounded-[32px] border border-white/5 flex flex-col shrink-0">
            <h3 class="font-bold text-sm mb-4">Regional Status</h3>
            <div class="space-y-4">
               <div>
                  <div class="flex justify-between text-[10px] mb-1.5 font-bold"><span>NORTH_AMERICA</span><span class="text-emerald-400">98%</span></div>
                  <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                     <div class="h-full bg-emerald-500 rounded-full" style="width: 98%"></div>
                  </div>
               </div>
               <div>
                  <div class="flex justify-between text-[10px] mb-1.5 font-bold"><span>EUROPE_WEST</span><span class="text-rose-400">62%</span></div>
                  <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                     <div class="h-full bg-rose-500 rounded-full animate-pulse" style="width: 62%"></div>
                  </div>
               </div>
               <div>
                  <div class="flex justify-between text-[10px] mb-1.5 font-bold"><span>ASIA_PACIFIC</span><span class="text-emerald-400">99.5%</span></div>
                  <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                     <div class="h-full bg-emerald-500 rounded-full" style="width: 99.5%"></div>
                  </div>
               </div>
            </div>
         </div>

         <!-- Console / Mitigation Logs -->
         <div class="glass p-6 rounded-[32px] border border-white/5 flex-1 flex flex-col min-h-0">
            <h3 class="font-bold text-sm mb-3 shrink-0 flex items-center gap-1.5"><i data-lucide="terminal" class="w-4 h-4 text-rose-500"></i> Mitigation Log</h3>
            <div class="flex-1 bg-black/60 border border-white/5 rounded-2xl p-4 overflow-y-auto font-mono text-[9px] text-slate-300 space-y-2">
               <div class="text-rose-400">[CRITICAL] 21:01:04 Node EU-04 reports packet congestion.</div>
               <div class="text-slate-400">[INFO] 21:01:15 Entropy scanner starting traffic audit.</div>
               <div class="text-cyan-400">[SYSTEM] 21:01:30 Deploying anti-entropy filter.</div>
               <div class="text-slate-400">[INFO] 21:01:45 Routing 30% of EU traffic to NA-01.</div>
               <div class="text-emerald-400">[RESOLVED] 21:02:10 Cache memory pressure stabilized.</div>
               <div class="text-slate-400">[INFO] 21:02:30 Awaiting manual telemetry check.</div>
            </div>
         </div>
      </div>
    </div>

    <!-- Live Ticker (Footer) -->
    <div class="h-10 bg-[#010409] border-t border-white/5 flex items-center overflow-hidden relative shrink-0">
       <div class="absolute left-0 h-full bg-slate-950 px-4 flex items-center font-bold text-[10px] text-rose-500 uppercase border-r border-white/5 z-10 select-none">Live Auditing</div>
       <div class="ticker-content flex whitespace-nowrap gap-12 text-[10px] font-mono text-slate-400 items-center pl-4">
          <span>[21:02:11] DDOS ALERT: Filtering packet floods in Node EU-04 (Frankfurt)</span>
          <span>[21:02:24] AGENT: Security_V3 completed entropy scanning on PR #1042</span>
          <span>[21:02:35] DEPLOYMENT: Vercel routing successfully verified for branch production</span>
          <span>[21:02:46] CACHE: Redis cache hits at 99.85% across AP-02 cluster</span>
          <span>[21:02:58] MEMORY: Garbage collector reclaimed 242MB on payment_gateway</span>
          <!-- Seamless Loop Replication -->
          <span>[21:02:11] DDOS ALERT: Filtering packet floods in Node EU-04 (Frankfurt)</span>
          <span>[21:02:24] AGENT: Security_V3 completed entropy scanning on PR #1042</span>
          <span>[21:02:35] DEPLOYMENT: Vercel routing successfully verified for branch production</span>
          <span>[21:02:46] CACHE: Redis cache hits at 99.85% across AP-02 cluster</span>
          <span>[21:02:58] MEMORY: Garbage collector reclaimed 242MB on payment_gateway</span>
       </div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>`);
}