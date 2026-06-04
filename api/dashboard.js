export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head>${DEMO_ENGINE}</head><body>
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
</body></html>`);}