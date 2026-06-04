import fs from 'fs';
import path from 'path';

const publicDir = './public';

const sharedHead = `
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=Space+Mono&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #010309; font-family: 'Inter', sans-serif; color: #f8fafc; overflow-x:hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, #00d1ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .aurora { position: fixed; inset: 0; filter: blur(100px); z-index: -1; opacity: 0.4; }
    .orb { position: absolute; border-radius: 50%; animation: float 20s infinite alternate; }
    .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #7c3aed33, transparent 70%); top: -200px; left: -100px; }
    @keyframes float { from { transform: translate(0,0); } to { transform: translate(100px, 50px); } }
  </style>
`;

const landingHTML = `<!DOCTYPE html><html><head><title>ACIE — Google Maps for codebases.</title>${sharedHead}</head>
<body class="flex flex-col items-center justify-center min-h-screen text-center px-6">
  <div class="aurora"><div class="orb orb-1"></div></div>
  <nav class="fixed top-0 w-full px-12 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-xl z-50">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <div class="flex gap-8 text-xs font-bold text-gray-400">
      <a href="/dashboard">DASHBOARD</a><a href="/executive">ROI</a><a href="/pricing">PRICING</a>
      <a href="/dashboard" class="bg-indigo-600 text-white px-5 py-2 rounded-full">LAUNCH_CONSOLE</a>
    </div>
  </nav>
  <div class="mb-6 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-4 py-2 rounded-full text-[10px] font-black tracking-[0.3em]">ACIE OMEGA PHASE ACTIVE</div>
  <h1 class="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85]">Build. Secure.<br><span class="grad-txt">Automate. Scale.</span></h1>
  <p class="text-gray-400 text-xl max-w-2xl mb-12 italic">"The All-in-One Google Maps for codebases."</p>
  <div class="flex gap-4">
    <a href="/dashboard" class="px-10 py-5 bg-white text-black rounded-2xl font-bold text-xl hover:scale-105 transition-all">Start Free</a>
    <div class="glass px-10 py-5 rounded-2xl font-bold text-xl">500K+ Repos Mapped</div>
  </div>
  <script>lucide.createIcons();</script>
</body></html>`;

const dashboardHTML = `<!DOCTYPE html><html><head><title>ACIE — Mission Control</title>${sharedHead}</head>
<body class="flex h-screen overflow-hidden">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-8">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <nav class="flex flex-col gap-2">
      <a href="/" class="px-4 py-2 text-gray-500 font-bold hover:text-white transition-colors">Home</a>
      <a href="/dashboard" class="px-4 py-2 bg-white/5 rounded-lg font-bold border border-white/10">Mission Control</a>
      <a href="/copilot" class="px-4 py-2 text-gray-500 font-bold hover:text-white transition-colors">AI Copilot</a>
    </nav>
  </aside>
  <main class="flex-1 p-10 overflow-y-auto">
    <h1 class="text-4xl font-black mb-10 tracking-tight">Mission Control</h1>
    <div class="grid grid-cols-4 gap-4 mb-10">
      <div class="glass p-8 rounded-3xl"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Security Score</div><div class="text-3xl font-black text-emerald-400">98%</div></div>
      <div class="glass p-8 rounded-3xl"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Code Quality</div><div class="text-3xl font-black">96%</div></div>
      <div class="glass p-8 rounded-3xl"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Risk Blocked</div><div class="text-3xl font-black text-rose-500">42</div></div>
      <div class="glass p-8 rounded-3xl"><div class="text-[10px] font-bold text-gray-500 uppercase mb-2">Stability</div><div class="text-3xl font-black">94%</div></div>
    </div>
    <div class="glass p-10 rounded-[40px] min-h-[400px]">
       <h3 class="text-xl font-bold mb-4">Neural Architecture Map</h3>
       <p class="text-gray-500 font-mono text-sm uppercase tracking-widest animate-pulse">> Scanning 2,504 infrastructure nodes...</p>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), landingHTML);
fs.writeFileSync(path.join(publicDir, 'dashboard.html'), dashboardHTML);

console.log('✅ OMEGA STATIC INTERFACE BUILT IN /public');
