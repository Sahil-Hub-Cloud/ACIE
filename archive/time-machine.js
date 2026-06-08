export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>ACIE — Time Machine</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #010409; color: #f8fafc; font-family: sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
  </style>
</head>
<body class="p-12 max-w-6xl mx-auto">
  <header class="flex justify-between items-center mb-16">
    <h1 class="text-4xl font-black tracking-tighter">Codebase Time Machine</h1>
    <input type="range" class="w-64 accent-indigo-500">
  </header>

  <div class="grid grid-cols-3 gap-8 mb-12">
    <div class="glass p-8 rounded-3xl"><div class="text-[10px] text-gray-500 font-bold uppercase mb-2">Complexity Growth</div><div class="text-3xl font-black">+14.2%</div></div>
    <div class="glass p-8 rounded-3xl"><div class="text-[10px] text-gray-500 font-bold uppercase mb-2">Tech Debt Removed</div><div class="text-3xl font-black text-emerald-400">842 hrs</div></div>
    <div class="glass p-8 rounded-3xl"><div class="text-[10px] text-gray-500 font-bold uppercase mb-2">Security Maturity</div><div class="text-3xl font-black text-cyan-400">Level 4</div></div>
  </div>

  <div class="glass p-12 rounded-[40px] h-80 relative flex items-center justify-center">
    <div class="text-center opacity-20"><div class="text-6xl mb-4">🕸️</div><div class="text-sm font-bold tracking-[0.5em]">ARCHITECTURAL_SNAPSHOT_06_2026</div></div>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
