import fs from 'fs';
import path from 'path';

const UI_CORE = `
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

const landing = `<!DOCTYPE html><html><head><title>ACIE — Google Maps for codebases.</title>${UI_CORE}</head>
<body class="flex flex-col items-center">
  <nav class="fixed top-0 w-full px-12 py-6 flex justify-between items-center z-50 border-b border-white/5 backdrop-blur-xl">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <div class="flex gap-8 text-xs font-bold text-gray-500 items-center">
      <span><span class="pulse-green"></span> SYSTEM LIVE</span>
      <a href="/dashboard" class="text-white">DASHBOARD</a>
      <a href="/executive" class="text-white">ROI</a>
    </div>
  </nav>
  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <h1 class="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85]">Build. Secure.<br><span class="grad-txt">Automate. Scale.</span></h1>
    <p class="text-gray-400 text-xl max-w-2xl mb-12 italic">"The All-in-One Google Maps for codebases."</p>
    <a href="/dashboard" class="px-12 py-6 bg-white text-black rounded-3xl font-black text-xl hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all">Launch Console →</a>
  </section>
</body></html>`;

const dashboard = `<!DOCTYPE html><html><head><title>ACIE — Command Center</title>${UI_CORE}</head>
<body class="flex h-screen overflow-hidden">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-10">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <nav class="flex flex-col gap-3 flex-1 text-sm font-bold text-gray-500">
      <a href="/dashboard" class="flex items-center gap-3 text-white bg-white/5 p-3 rounded-xl border border-white/10"><i data-lucide="cpu"></i> Command Center</a>
      <a href="/executive" class="flex items-center gap-3 hover:text-white p-3"><i data-lucide="gem"></i> Executive ROI</a>
    </nav>
  </aside>
  <main class="flex-1 p-12 overflow-y-auto">
    <h1 class="text-4xl font-black mb-12 tracking-tight">AI Agent Hub</h1>
    <div class="grid grid-cols-3 gap-6 mb-12">
      <div class="glass p-8 border-t-2 border-emerald-500/30"><h3>Security Score</h3><div class="text-4xl font-black text-emerald-400 mt-2">98%</div></div>
      <div class="glass p-8 border-t-2 border-indigo-500/30"><h3>Code Quality</h3><div class="text-4xl font-black mt-2">96%</div></div>
      <div class="glass p-8 border-t-2 border-orange-500/30"><h3>Stability</h3><div class="text-4xl font-black text-cyan-400 mt-2">94%</div></div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>`;

const executive = `<!DOCTYPE html><html><head><title>ACIE — Executive ROI</title>${UI_CORE}</head>
<body class="p-20 max-w-6xl mx-auto text-center">
  <h1 class="text-6xl font-black tracking-tighter mb-4 uppercase">Engineering ROI</h1>
  <div class="grid grid-cols-3 gap-6 mt-20">
    <div class="glass p-12"><div class="text-5xl font-black text-emerald-400">$142,500</div><div class="text-[10px] font-bold text-gray-600 mt-4 uppercase">Money Saved</div></div>
    <div class="glass p-12"><div class="text-5xl font-black">2,480 hrs</div><div class="text-[10px] font-bold text-gray-600 mt-4 uppercase">Time Reclaimed</div></div>
    <div class="glass p-12"><div class="text-5xl font-black text-cyan-400">+24%</div><div class="text-[10px] font-bold text-gray-600 mt-4 uppercase">Velocity</div></div>
  </div>
</body></html>`;

fs.writeFileSync('./public/index.html', landing);
fs.writeFileSync('./public/dashboard.html', dashboard);
fs.writeFileSync('./public/executive.html', executive);
console.log('✅ TITAN-FINAL: FILES WRITTEN TO PUBLIC/');
