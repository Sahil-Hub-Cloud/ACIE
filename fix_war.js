import fs from 'fs';
const code = `export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(\`<!DOCTYPE html><html><head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #010409; color: #f8fafc; font-family: sans-serif; overflow: hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; }
    .map-bg { background-image: radial-gradient(#1e293b 1px, transparent 1px); background-size: 30px 30px; opacity: 0.2; }
  </style>
</head>
<body class="h-screen flex flex-col p-10 map-bg">
    <header class="flex justify-between items-center mb-20 relative z-10">
      <h1 class="text-3xl font-black italic">⚡ ACIE <span class="text-cyan-400">WAR_ROOM</span></h1>
      <a href="/dashboard" class="glass px-6 py-2 text-xs font-bold">← EXIT_COMMAND</a>
    </header>
    <div class="flex-1 grid grid-cols-4 gap-8 relative z-10">
      <div class="glass p-8 border-t-2 border-emerald-500/20">
        <div class="text-[10px] font-bold text-gray-500 uppercase mb-4">North America</div>
        <div class="text-4xl font-black">245</div>
        <div class="text-xs text-emerald-500 font-bold mt-2">HEALTH: 98%</div>
      </div>
      <div class="glass p-8 border-t-2 border-rose-500/20">
        <div class="text-[10px] font-bold text-gray-500 uppercase mb-4">Europe</div>
        <div class="text-4xl font-black">182</div>
        <div class="text-xs text-rose-500 font-bold mt-2">1 CRITICAL THREAT</div>
      </div>
      <div class="glass p-8 border-t-2 border-cyan-500/20"><div class="text-[10px] font-bold text-gray-500 uppercase mb-4">Asia</div><div class="text-4xl font-black">356</div></div>
      <div class="glass p-8 border-t-2 border-indigo-500/20"><div class="text-[10px] font-bold text-gray-500 uppercase mb-4">Clusters</div><div class="text-4xl font-black">849</div></div>
    </div>
</body></html>\`);
}`;
fs.writeFileSync('api/war-room.js', code);
console.log('✅ WAR_ROOM_RESTORED');
