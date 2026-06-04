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
    .pulse-green { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #10b981; animation: p 2s infinite; }
    @keyframes p { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  </style>
`;

const landing = `<!DOCTYPE html><html><head><title>ACIE — Google Maps for codebases.</title>${UI_HEAD}
<script>
  function startScan() {
    document.getElementById('overlay').classList.remove('hidden');
    const steps = ["Connecting to Instance...", "Analyzing Architecture...", "Mapping 1,240 Nodes...", "Calculating Blast Radius...", "Generating Intelligence..."];
    let i = 0;
    const itv = setInterval(() => {
      if(i < steps.length) {
        document.getElementById('log').innerHTML += '<div class="text-cyan-400 mt-2">> ' + steps[i] + '</div>';
        i++;
      } else {
        clearInterval(itv);
        setTimeout(() => { window.location.href='/dashboard'; }, 800);
      }
    }, 700);
  }
</script>
</head>
<body class="flex flex-col items-center">
  <div id="overlay" class="fixed inset-0 bg-black z-[100] flex items-center justify-center hidden">
    <div class="w-96 font-mono text-sm">
      <div class="text-gray-600 font-bold mb-4 tracking-[0.2em]">INTERNAL_SYSTEM_SCAN</div>
      <div id="log"></div>
      <div class="mt-8 h-1 bg-white/10 overflow-hidden"><div class="h-full bg-indigo-500 animate-pulse"></div></div>
    </div>
  </div>
  <nav class="fixed top-0 w-full px-12 py-6 flex justify-between items-center z-50 border-b border-white/5 backdrop-blur-xl">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <div class="flex gap-8 text-xs font-bold text-gray-500 items-center">
      <span><span class="pulse-green"></span> SYSTEM LIVE</span>
      <a href="/dashboard" class="text-white">DASHBOARD</a>
      <button onclick="startScan()" class="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-500 transition-all">LAUNCH_CONSOLE</button>
    </div>
  </nav>
  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <h1 class="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85]">Build. Secure.<br><span class="grad-txt">Automate. Scale.</span></h1>
    <p class="text-gray-400 text-xl max-w-2xl mb-12 italic">"The All-in-One Google Maps for codebases."</p>
    <button onclick="startScan()" class="px-12 py-6 bg-white text-black rounded-3xl font-black text-xl hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all">Scan Repository →</button>
  </section>
</body></html>`;

const dashboard = `<!DOCTYPE html><html><head><title>ACIE — Command Center</title>${UI_HEAD}</head>
<body class="flex h-screen overflow-hidden">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-10">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <nav class="flex flex-col gap-3 flex-1 text-sm font-bold text-gray-500">
      <a href="/dashboard" class="flex items-center gap-3 text-white bg-white/5 p-3 rounded-xl border border-white/10"><i data-lucide="layout-dashboard"></i> Mission Control</a>
      <a href="/executive" class="flex items-center gap-3 hover:text-white p-3"><i data-lucide="gem"></i> Executive ROI</a>
    </nav>
  </aside>
  <main class="flex-1 p-12 overflow-y-auto">
    <header class="flex justify-between items-center mb-12">
      <h1 class="text-4xl font-black tracking-tight">Mission Control</h1>
      <div class="text-xs font-bold text-cyan-400 glass px-6 py-2 rounded-full uppercase tracking-widest">Sahil-Hub-Cloud / ACIE</div>
    </header>
    <div class="grid grid-cols-4 gap-6 mb-12">
      <div class="glass p-8 text-center"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Security</div><div class="text-4xl font-black text-emerald-400">98%</div></div>
      <div class="glass p-8 text-center"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Quality</div><div class="text-4xl font-black text-white">96%</div></div>
      <div class="glass p-8 text-center"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Leaks</div><div class="text-4xl font-black text-rose-500">0</div></div>
      <div class="glass p-8 text-center"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Health</div><div class="text-4xl font-black text-cyan-400">94%</div></div>
    </div>
    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-2 glass p-10 min-h-[300px]">
        <h3 class="font-bold text-cyan-400 text-xs tracking-widest uppercase mb-6">Live Analysis Feed</h3>
        <div class="font-mono text-sm text-gray-600 space-y-2">
          <div class="flex justify-between"><span>[14:42:01] PR #104 Initialized</span><span class="text-emerald-500 font-bold">SECURE</span></div>
          <div class="flex justify-between"><span>[14:44:12] Architecture Mapping...</span><span class="text-indigo-400 font-bold">94% HEALTH</span></div>
        </div>
      </div>
      <div class="glass p-10 flex flex-col items-center justify-center text-center">
        <div class="relative w-32 h-32 mb-6">
           <svg class="w-full h-full rotate-[-90deg]"><circle cx="64" cy="64" r="50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"></circle><circle cx="64" cy="64" r="50" fill="none" stroke="#7c3aed" stroke-width="8" stroke-dasharray="314" stroke-dashoffset="20" class="transition-all duration-1000"></circle></svg>
           <div class="absolute inset-0 flex items-center justify-center text-3xl font-black">94%</div>
        </div>
        <div class="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Reliability Index</div>
      </div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>`;

fs.writeFileSync('./public/index.html', landing);
fs.writeFileSync('./public/dashboard.html', dashboard);
console.log('✅ INTELLIGENCE ACTIVATED IN PUBLIC FOLDER');
