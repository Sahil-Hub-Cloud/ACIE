export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>ACIE — Digital Twin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #010409; color: #f8fafc; font-family: sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .node { position: absolute; transition: all 1s ease-in-out; }
    .line { position: absolute; background: rgba(0, 209, 255, 0.1); transform-origin: left; }
    .perspective { perspective: 1000px; transform-style: preserve-3d; transform: rotateX(20deg); }
  </style>
</head>
<body class="p-10 flex flex-col h-screen overflow-hidden">
  <header class="flex justify-between items-center mb-10">
    <div><h1 class="text-3xl font-black">Digital Twin</h1><p class="text-xs text-gray-500 font-bold uppercase tracking-widest">Global Instance: ACIE_ALPHA_TWIN</p></div>
    <div class="flex gap-4"><a href="/dashboard" class="glass px-6 py-2 rounded-xl text-xs font-bold uppercase">Exit Perspective</a></div>
  </header>
  <div class="flex-1 glass rounded-[40px] relative perspective border border-white/5 overflow-hidden">
    <!-- Simulated Infrastructure Nodes -->
    <div class="node top-1/4 left-1/4 glass p-4 rounded-xl border-cyan-500/50"><div class="text-[10px] font-bold text-cyan-400 mb-1">AUTH_SERVICE</div><div class="text-xs">Latency: 12ms</div></div>
    <div class="node top-1/2 left-1/2 glass p-4 rounded-xl border-purple-500/50"><div class="text-[10px] font-bold text-purple-400 mb-1">CORE_API</div><div class="text-xs">Health: 99%</div></div>
    <div class="node bottom-1/4 right-1/4 glass p-4 rounded-xl border-emerald-500/50"><div class="text-[10px] font-bold text-emerald-400 mb-1">DB_CLUSTER_01</div><div class="text-xs">Status: Optimized</div></div>
    <div class="absolute bottom-10 left-10 text-[10px] text-gray-600 font-mono italic">RECOGNIZING_NODES... [2,504 ACTIVE]</div>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}