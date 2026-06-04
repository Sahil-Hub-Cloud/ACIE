import fs from 'fs';

const UI_HEAD = `
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Space+Mono&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #010309; font-family: 'Plus Jakarta Sans', sans-serif; color: #f8fafc; overflow: hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; }
    .node-p { animation: node-pulse 4s infinite alternate; }
    @keyframes node-pulse { from { box-shadow: 0 0 5px rgba(0, 209, 255, 0.2); } to { box-shadow: 0 0 30px rgba(0, 209, 255, 0.6); } }
    .grid-lines { background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 50px 50px; perspective: 1000px; transform: rotateX(60deg); position: absolute; inset: -100%; z-index: 0; }
  </style>
`;

const digitalTwin = `<!DOCTYPE html><html><head><title>ACIE — Digital Twin</title>${UI_HEAD}</head>
<body class="h-screen flex flex-col items-center justify-center relative bg-black">
  <div class="grid-lines"></div>
  
  <nav class="fixed top-0 w-full px-12 py-6 flex justify-between items-center z-50 border-b border-white/5 backdrop-blur-xl">
    <div class="text-2xl font-black italic">⚡ ACIE <span class="text-cyan-400">TWIN</span></div>
    <div class="flex items-center gap-6">
       <div class="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
         <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Synchronized
       </div>
       <a href="/dashboard" class="text-xs font-bold text-gray-500 hover:text-white">EXIT_INSTANCE</a>
    </div>
  </nav>

  <div class="relative z-10 w-full max-w-5xl h-[600px] flex items-center justify-center">
    <!-- CENTRAL HUB -->
    <div class="w-32 h-32 glass border-indigo-500/50 flex items-center justify-center node-p relative z-20">
       <div class="text-center"><div class="text-xl font-black">CORE</div><div class="text-[8px] text-indigo-400 font-bold uppercase">Main_Cluster</div></div>
    </div>

    <!-- SATELLITE SERVICES -->
    <div class="absolute top-20 left-40 glass p-6 border-cyan-500/30 animate-bounce">
       <div class="text-[10px] font-bold text-cyan-400 mb-2">AUTH_GATEWAY</div>
       <div class="text-xs text-gray-500">Latency: 4ms</div>
    </div>

    <div class="absolute bottom-20 right-40 glass p-6 border-rose-500/30">
       <div class="text-[10px] font-bold text-rose-500 mb-2">PAYMENT_NODE_01</div>
       <div class="text-xs text-gray-500">Health: 82%</div>
    </div>

    <div class="absolute top-1/2 right-20 glass p-6 border-emerald-500/30 animate-pulse">
       <div class="text-[10px] font-bold text-emerald-400 mb-2">REDIS_CACHE</div>
       <div class="text-xs text-gray-500">Hits: 99.8%</div>
    </div>

    <!-- CONNECTION LINES (SVG) -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-20">
       <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#00d1ff" stroke-width="1" />
       <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#ff0055" stroke-width="1" />
       <line x1="50%" y1="50%" x2="85%" y2="50%" stroke="#10b981" stroke-width="1" />
    </svg>
  </div>

  <div class="fixed bottom-10 glass p-6 w-[800px] flex justify-between items-center">
     <div><div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Telemetry</div><div class="text-sm font-bold text-slate-300">2,504 infrastructure nodes mapped. No anomalies detected.</div></div>
     <button class="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all">RE-SYNC NODES</button>
  </div>
  <script>lucide.createIcons();</script>
</body></html>`;

fs.writeFileSync('./public/digital-twin.html', digitalTwin);
console.log('✅ DIGITAL TWIN MODULE CREATED: /digital-twin');
