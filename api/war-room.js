export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>ACIE — Global War Room</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background: #010409; color: #f8fafc; font-family: sans-serif; overflow: hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .map-bg { background-image: radial-gradient(#1e293b 1px, transparent 1px); background-size: 30px 30px; opacity: 0.2; }
    .pulse-red { animation: pulse-red 2s infinite; }
    @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
  </style>
</head>
<body class="flex h-screen">
  <main class="flex-1 relative flex flex-col p-10">
    <div class="absolute inset-0 map-bg"></div>
    <header class="relative z-10 flex justify-between items-center mb-20">
      <div>
        <h1 class="text-3xl font-black tracking-tighter">Global Command Map</h1>
        <p class="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Real-time Infrastructure Pulse</p>
      </div>
      <div class="flex gap-4">
        <div class="glass px-6 py-3 rounded-2xl text-xs font-bold"><span class="text-emerald-500">849</span> REPOS ONLINE</div>
        <a href="/dashboard" class="glass px-6 py-3 rounded-2xl text-xs font-bold hover:bg-white/5 transition-all">EXIT WAR ROOM</a>
      </div>
    </header>

    <div class="relative z-10 flex-1 grid grid-cols-4 gap-8">
      <!-- REGIONS -->
      <div class="glass p-8 rounded-[32px] flex flex-col justify-between">
        <div><div class="text-[10px] font-bold text-gray-500 uppercase mb-4">North America</div><div class="text-4xl font-black">245</div><div class="text-xs text-emerald-500 font-bold mt-2">HEALTH: 98%</div></div>
        <div class="h-24 w-full bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">NOMINAL</div>
      </div>
      <div class="glass p-8 rounded-[32px] border-rose-500/30">
        <div class="text-[10px] font-bold text-gray-500 uppercase mb-4">Europe</div>
        <div class="text-4xl font-black">182</div>
        <div class="text-xs text-rose-500 font-bold mt-2 tracking-tighter">🚨 1 CRITICAL THREAT</div>
        <div class="mt-10 p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 text-[10px] font-bold text-rose-500 pulse-red">ATTACK VECTOR DETECTED: IP_22.14.xx</div>
      </div>
      <div class="glass p-8 rounded-[32px]">
        <div><div class="text-[10px] font-bold text-gray-500 uppercase mb-4">Asia Pacific</div><div class="text-4xl font-black">356</div><div class="text-xs text-cyan-400 font-bold mt-2">STABLE</div></div>
      </div>
      <div class="glass p-8 rounded-[32px]">
        <div><div class="text-[10px] font-bold text-gray-500 uppercase mb-4">Australia</div><div class="text-4xl font-black">64</div><div class="text-xs text-gray-500 font-bold mt-2">DORMANT</div></div>
      </div>
    </div>
  </main>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}