import fs from 'fs';

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
    .node-glow { filter: drop-shadow(0 0 10px #7c3aed88); animation: glow 3s infinite alternate; }
    @keyframes glow { from { opacity: 0.5; } to { opacity: 1; } }
  </style>
`;

const landing = `<!DOCTYPE html><html><head><title>ACIE — Google Maps for codebases.</title>${UI_CORE}</head>
<body class="flex flex-col items-center">
  <nav class="fixed top-0 w-full px-12 py-6 flex justify-between items-center z-50 border-b border-white/5 backdrop-blur-xl">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <div class="flex gap-8 text-xs font-bold text-gray-500 items-center">
      <span><span class="pulse-green"></span> SYSTEM LIVE</span>
      <a href="/dashboard.html" class="text-white">DASHBOARD</a>
      <a href="/executive.html" class="text-white">ROI</a>
    </div>
  </nav>

  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <h1 class="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85]">Build. Secure.<br><span class="grad-txt">Automate. Scale.</span></h1>
    <p class="text-gray-400 text-xl max-w-2xl mb-12 italic">"The All-in-One Google Maps for codebases."</p>
    <a href="/dashboard.html" class="px-12 py-6 bg-white text-black rounded-3xl font-black text-xl hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all">Launch Console →</a>
  </section>

  <!-- ARCHITECTURE MAP SECTION -->
  <section class="py-40 w-full max-w-6xl px-6 text-center">
    <h2 class="text-5xl font-black mb-12 tracking-tight">See Your Codebase<br><span class="text-indigo-500">Like Never Before</span></h2>
    <div class="glass p-20 relative overflow-hidden h-[500px] flex items-center justify-center border-dashed border-white/10">
       <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a0033_0%,transparent_70%)] opacity-50"></div>
       <!-- GRAPH NODES -->
       <div class="relative z-10">
          <div class="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center node-glow mx-auto mb-10"><i data-lucide="box" class="text-white"></i></div>
          <div class="flex gap-20">
             <div class="glass p-4 rounded-xl border-cyan-500/50"><i data-lucide="database" class="text-cyan-400 w-4 h-4 mb-2"></i><div class="text-[10px] font-bold">AUTH_DB</div></div>
             <div class="glass p-4 rounded-xl border-rose-500/50"><i data-lucide="shield" class="text-rose-400 w-4 h-4 mb-2"></i><div class="text-[10px] font-bold">SECURITY_HOTSPOT</div></div>
          </div>
       </div>
       <div class="absolute bottom-6 left-6 text-[10px] font-bold text-slate-600 tracking-[0.4em]">NEURAL_MAP_V3.0_ONLINE</div>
    </div>
  </section>

  <!-- SOCIAL PROOF -->
  <section class="py-20 border-t border-white/5 w-full text-center">
    <div class="text-gray-600 text-xs font-black tracking-widest mb-12 uppercase">Trusted by engineering teams at</div>
    <div class="flex flex-wrap justify-center gap-16 opacity-30 grayscale invert">
      <span class="font-bold text-xl">GITHUB</span><span class="font-bold text-xl">AWS</span><span class="font-bold text-xl">STRIPE</span><span class="font-bold text-xl">VERCEL</span>
    </div>
  </section>
  <script>lucide.createIcons();</script>
</body></html>`;

const dashboard = `<!DOCTYPE html><html><head><title>ACIE — Command Center</title>${UI_CORE}</head>
<body class="flex h-screen overflow-hidden">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-10">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <nav class="flex flex-col gap-3 flex-1 text-sm font-bold text-gray-500">
      <a href="/dashboard.html" class="flex items-center gap-3 text-white bg-white/5 p-3 rounded-xl border border-white/10"><i data-lucide="cpu"></i> Command Center</a>
      <a href="/executive.html" class="flex items-center gap-3 hover:text-white p-3"><i data-lucide="gem"></i> Executive ROI</a>
    </nav>
  </aside>
  <main class="flex-1 p-12 overflow-y-auto">
    <header class="flex justify-between items-end mb-12">
      <h1 class="text-4xl font-black tracking-tight">AI Agent Hub</h1>
      <span class="text-xs font-bold text-emerald-400 glass px-4 py-2 rounded-full uppercase tracking-widest animate-pulse">● 3 AGENTS ACTIVE</span>
    </header>
    <div class="grid grid-cols-3 gap-6 mb-12">
      <div class="glass p-8 border-t-2 border-emerald-500/30">
        <div class="flex justify-between mb-6"><div class="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><i data-lucide="shield-check"></i></div><span class="text-[10px] font-black text-emerald-500">ONLINE</span></div>
        <h3 class="font-bold">AI Security Engineer</h3>
        <p class="text-gray-500 text-xs mt-3">Scanning commit logs for credential leaks. All systems nominal.</p>
      </div>
      <div class="glass p-8 border-t-2 border-indigo-500/30">
        <div class="flex justify-between mb-6"><div class="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><i data-lucide="terminal"></i></div><span class="text-[10px] font-black text-indigo-400">OPTIMIZING</span></div>
        <h3 class="font-bold">AI DevOps Engineer</h3>
        <p class="text-gray-500 text-xs mt-3">Analysis found 12% faster build path for CI/CD pipeline.</p>
      </div>
      <div class="glass p-8 border-t-2 border-orange-500/30">
        <div class="flex justify-between mb-6"><div class="p-3 bg-orange-500/10 rounded-xl text-orange-400"><i data-lucide="briefcase"></i></div><span class="text-[10px] font-black text-orange-500">READY</span></div>
        <h3 class="font-bold">AI CTO Advisor</h3>
        <p class="text-gray-500 text-xs mt-3">Ready to generate architectural health briefing.</p>
      </div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>`;

const executive = `<!DOCTYPE html><html><head><title>ACIE — Executive ROI</title>${UI_CORE}</head>
<body class="p-20 max-w-6xl mx-auto text-center">
  <h1 class="text-6xl font-black tracking-tighter mb-4">Strategic Engineering ROI</h1>
  <p class="text-gray-500 text-xl mb-20 italic">"The dollar value of Intelligence."</p>
  <div class="grid grid-cols-3 gap-6">
    <div class="glass p-12"><div class="text-5xl font-black text-emerald-400">$142,500</div><div class="text-[10px] font-bold text-gray-600 mt-4 uppercase">Estimated Money Saved</div></div>
    <div class="glass p-12"><div class="text-5xl font-black">2,480 hrs</div><div class="text-[10px] font-bold text-gray-600 mt-4 uppercase">Engineering Time Reclaimed</div></div>
    <div class="glass p-12"><div class="text-5xl font-black text-cyan-400">+24%</div><div class="text-[10px] font-bold text-gray-600 mt-4 uppercase">Deployment Velocity Increase</div></div>
  </div>
  <a href="/dashboard.html" class="inline-block mt-20 text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">← Back to Command Center</a>
</body></html>`;

// Write to root
fs.writeFileSync('index.html', landing);
fs.writeFileSync('dashboard.html', dashboard);
fs.writeFileSync('executive.html', executive);

// Also write to public/ just in case the folder override is active on user's Vercel dashboard
if (fs.existsSync('./public')) {
  fs.writeFileSync('./public/index.html', landing);
  fs.writeFileSync('./public/dashboard.html', dashboard);
  fs.writeFileSync('./public/executive.html', executive);
}

console.log('✅ INTELLIGENCE LAYER V3.0 DEPLOYED TO ROOT');