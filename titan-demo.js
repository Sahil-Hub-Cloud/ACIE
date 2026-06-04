import fs from 'fs';

const DEMO_ENGINE = `
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Space+Mono&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #010409; font-family: 'Inter', sans-serif; color: #f8fafc; overflow-x:hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, #00d1ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .scan-line { width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #7c3aed, transparent); position: absolute; top: 0; animation: scan 3s infinite linear; }
    @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
    .typing::after { content: '|'; animation: blink 1s infinite; }
    @keyframes blink { 50% { opacity: 0; } }
  </style>
  <script>
    function startScan() {
      const overlay = document.getElementById('scan-overlay');
      const log = document.getElementById('scan-log');
      overlay.classList.remove('hidden');
      const steps = [
        "Connecting to GitHub Instance...",
        "Analyzing Cluster Architecture...",
        "Mapping 1,240 Dependency Nodes...",
        "Calculating Blast Radius for /src/auth...",
        "Detecting Vulnerabilities in Node_Modules...",
        "Generating Intelligence Report..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if(i < steps.length) {
          log.innerHTML += '<div class="text-cyan-400 mt-1">> ' + steps[i] + '</div>';
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => { overlay.classList.add('hidden'); window.location.href='/dashboard'; }, 1000);
        }
      }, 800);
    }
  </script>
`;

const landing = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head>\${DEMO_ENGINE}</head><body>
  <div id="scan-overlay" class="fixed inset-0 z-[200] bg-black flex items-center justify-center hidden">
    <div class="max-w-md w-full p-10 font-mono text-sm">
      <div class="mb-4 text-slate-500 font-bold tracking-widest">ACIE_SYSTEM_SCAN</div>
      <div id="scan-log" class="space-y-1"></div>
      <div class="mt-8 h-1 bg-white/10 overflow-hidden"><div class="h-full bg-indigo-500 animate-[pulse_1s_infinite]"></div></div>
    </div>
  </div>

  <nav class="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl px-12 py-5 flex justify-between items-center">
    <div class="text-2xl font-extrabold">⚡ ACIE</div>
    <div class="flex gap-8 text-sm font-bold text-slate-400">
      <a href="/dashboard">Platform</a><a href="/executive">ROI</a><a href="/pricing">Pricing</a>
      <button onclick="startScan()" class="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-500 transition-all">Launch Console</button>
    </div>
  </nav>

  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <h1 class="text-7xl md:text-9xl font-black tracking-tighter mb-6 leading-none">Build. Secure.<br><span class="grad-txt">Automate.</span></h1>
    <p class="text-slate-400 text-xl max-w-xl mb-12">"The Google Maps for codebases." <br>The DevSecOps Command Center for High-Velocity Teams.</p>
    <button onclick="startScan()" class="px-12 py-6 bg-white text-black rounded-2xl font-black text-xl hover:scale-105 transition-all">Scan Your Repository →</button>
  </section>

  <section class="py-32 px-12 glass mx-12 rounded-[40px] text-center">
    <h2 class="text-4xl font-bold mb-16 uppercase tracking-widest text-slate-500">Global Network Stats</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-20 max-w-5xl mx-auto">
       <div><div class="text-6xl font-black text-white">500K</div><div class="text-xs font-bold text-cyan-400 mt-4 uppercase">Repos Mapped</div></div>
       <div><div class="text-6xl font-black text-white">12M</div><div class="text-xs font-bold text-purple-400 mt-4 uppercase">PRs Analyzed</div></div>
       <div><div class="text-6xl font-black text-white">850K</div><div class="text-xs font-bold text-emerald-400 mt-4 uppercase">Risks Prevented</div></div>
    </div>
  </section>
</body></html>\`);}`;

const dashboard = `export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(\`<!DOCTYPE html><html><head>\${DEMO_ENGINE}</head><body>
  <div class="flex h-screen overflow-hidden">
    <aside class="w-72 bg-black border-r border-white/5 p-8 flex flex-col">
      <div class="text-2xl font-black mb-12">⚡ ACIE</div>
      <nav class="space-y-2 flex-1">
        <a href="/dashboard" class="flex items-center gap-3 px-5 py-3 bg-white/5 text-white rounded-xl font-bold border border-white/10"><i data-lucide="layout-dashboard"></i> Mission Control</a>
        <a href="/command-center" class="flex items-center gap-3 px-5 py-3 text-slate-500 font-bold"><i data-lucide="cpu"></i> Agent Hub</a>
        <a href="/executive" class="flex items-center gap-3 px-5 py-3 text-slate-500 font-bold"><i data-lucide="gem"></i> Executive ROI</a>
      </nav>
    </aside>

    <main class="flex-1 overflow-y-auto p-12 relative">
      <header class="flex justify-between items-center mb-12">
        <h1 class="text-4xl font-black tracking-tight">Mission Control</h1>
        <div class="flex gap-4">
           <div class="glass px-4 py-2 rounded-xl text-[10px] font-bold text-cyan-400 tracking-widest">LIVE DATA STREAM</div>
        </div>
      </header>

      <div class="grid grid-cols-4 gap-6 mb-12">
        <div class="glass p-8 rounded-3xl"><div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Money Saved</div><div class="text-3xl font-black text-emerald-400">$142,500</div></div>
        <div class="glass p-8 rounded-3xl"><div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Dev Hours Saved</div><div class="text-3xl font-black">2,480 hrs</div></div>
        <div class="glass p-8 rounded-3xl"><div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Deploy Velocity</div><div class="text-3xl font-black text-cyan-400">+24%</div></div>
        <div class="glass p-8 rounded-3xl"><div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Risks Blocked</div><div class="text-3xl font-black text-rose-500">42</div></div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="col-span-2 glass p-10 rounded-3xl h-[400px]">
           <h3 class="font-bold text-lg mb-8 flex justify-between">Threat Explorer <span class="text-xs text-rose-400 tracking-widest">REAL-TIME</span></h3>
           <div class="flex gap-10">
              <div class="w-48 h-48 rounded-full border-[15px] border-white/5 border-t-rose-500 border-r-orange-500 relative flex items-center justify-center">
                 <div class="text-center"><div class="text-3xl font-black text-rose-500">12</div><div class="text-[8px] font-bold text-slate-500 uppercase">Alerts</div></div>
              </div>
              <div class="space-y-4 flex-1">
                 <div class="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between"><div><span class="text-rose-500 font-bold">CRITICAL</span><br><span class="text-xs text-slate-400">Hardcoded AWS Secret</span></div><span class="text-[10px] font-bold text-slate-600">/auth/login.js</span></div>
                 <div class="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between"><div><span class="text-orange-500 font-bold">HIGH</span><br><span class="text-xs text-slate-400">Circular Dependency</span></div><span class="text-[10px] font-bold text-slate-600">/utils/core.js</span></div>
              </div>
           </div>
        </div>
        <div class="glass p-10 rounded-3xl text-center">
           <h3 class="font-bold text-lg mb-10">Reliability Index</h3>
           <div class="text-8xl font-black grad-txt">94%</div>
           <div class="mt-4 text-[10px] font-bold text-slate-500 tracking-widest">SYSTEM INTEGRITY NOMINAL</div>
        </div>
      </div>
    </main>
  </div>
  <script>lucide.createIcons();</script>
</body></html>\`);}`;

fs.writeFileSync('api/landing.js', landing);
fs.writeFileSync('api/dashboard.js', dashboard);
console.log('✅ HOLY SH*T DEMO MODE ACTIVE');
