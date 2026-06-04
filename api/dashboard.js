export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ACIE Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #010409; color: #f8fafc; font-family: sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
  </style>
</head>
<body class="flex h-screen overflow-hidden">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-8">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <nav class="flex flex-col gap-2">
      <a href="#" class="px-4 py-2 bg-white/5 rounded-lg font-bold">Mission Control</a>
      <a href="/copilot" class="px-4 py-2 text-gray-500 font-bold hover:text-white transition-colors">AI Copilot</a>
    </nav>
  </aside>
  <main class="flex-1 p-12 overflow-y-auto">
    <h1 class="text-3xl font-black mb-10 tracking-tight">Mission Control</h1>
    <div class="grid grid-cols-4 gap-4 mb-10">
      <div class="glass p-6 rounded-2xl">
        <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Money Saved</div>
        <div class="text-2xl font-black text-emerald-400">$142,500</div>
      </div>
      <div class="glass p-6 rounded-2xl">
        <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Deploy Velocity</div>
        <div class="text-2xl font-black text-cyan-400">+24%</div>
      </div>
      <div class="glass p-6 rounded-2xl">
        <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Risk Blocked</div>
        <div class="text-2xl font-black text-rose-500">42</div>
      </div>
      <div class="glass p-6 rounded-2xl">
        <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Stability</div>
        <div class="text-2xl font-black">94%</div>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-2 glass p-8 rounded-3xl min-h-[300px]">
        <div class="flex justify-between items-center mb-8">
          <h3 class="font-bold">Threat Explorer</h3>
          <span class="text-[10px] font-bold text-rose-500 animate-pulse tracking-tighter">LIVE MONITORING</span>
        </div>
        <div class="flex gap-10 items-center">
          <div class="w-32 h-32 rounded-full border-[10px] border-white/5 border-t-rose-500 border-r-orange-500 flex items-center justify-center">
            <span class="text-2xl font-black text-rose-500">12</span>
          </div>
          <div class="flex-1 space-y-3 text-sm">
            <div class="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between">
              <span>Hardcoded Secret</span><span class="text-rose-500 font-bold">CRITICAL</span>
            </div>
            <div class="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between">
              <span>Circular Import</span><span class="text-orange-500 font-bold">HIGH</span>
            </div>
          </div>
        </div>
      </div>
      <div class="glass p-8 rounded-3xl flex flex-col items-center justify-center text-center">
        <h3 class="font-bold text-gray-500 text-sm mb-4">ENGINE PERFORMANCE</h3>
        <div class="text-6xl font-black text-cyan-400">0.8s</div>
        <p class="text-[10px] mt-4 font-bold text-gray-600 tracking-widest">LATENCY OPTIMIZED</p>
      </div>
    </div>
  </main>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}