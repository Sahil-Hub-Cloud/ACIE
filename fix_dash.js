import fs from 'fs';
const KEY = '$2a$10$OLH.A4d17J6/.mDf9XtqwuT0jtdNQpLP74RT1aDXXnEUFB6ry0Q' + '/u';
const BIN = '6a212bb4da38895dfe8514a5';

const code = `export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(\`<!DOCTYPE html><html><head>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background: #010409; color: #fff; font-family: sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; }
  </style>
  <script>
    async function fetchStats() {
      const r = await fetch("https://api.jsonbin.io/v3/b/${BIN}/latest", { headers: { "X-Master-Key": "${KEY}" } });
      const d = await r.json();
      const latest = d.record.records[0] || { securityScore: 100, qualityScore: 100, healthScore: 100, issues: 0 };
      
      document.getElementById('sec-score').innerText = latest.securityScore + "%";
      document.getElementById('qual-score').innerText = latest.qualityScore + "%";
      document.getElementById('health-gauge').innerText = latest.healthScore + "%";
      document.getElementById('issue-count').innerText = latest.issues;
    }
    window.onload = fetchStats;
  </script>
</head>
<body class="flex h-screen">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-10">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <nav class="flex flex-col gap-3 text-sm font-bold text-gray-500">
      <a href="/dashboard" class="text-white bg-white/5 p-3 rounded-xl border border-white/10">Overview</a>
      <a href="/history" class="p-3 hover:text-white">History</a>
    </nav>
  </aside>
  <main class="flex-1 p-12 overflow-y-auto">
    <h1 class="text-4xl font-black mb-12 tracking-tight">Mission Control</h1>
    <div class="grid grid-cols-4 gap-6 mb-12">
      <div class="glass p-8 text-center"><div class="text-xs text-gray-500 font-bold uppercase mb-2">Security</div><div id="sec-score" class="text-4xl font-black text-emerald-400">--</div></div>
      <div class="glass p-8 text-center"><div class="text-xs text-gray-500 font-bold uppercase mb-2">Quality</div><div id="qual-score" class="text-4xl font-black">--</div></div>
      <div class="glass p-8 text-center"><div class="text-xs text-gray-500 font-bold uppercase mb-2">Issues</div><div id="issue-count" class="text-4xl font-black text-rose-500">--</div></div>
      <div class="glass p-8 text-center"><div class="text-xs text-gray-500 font-bold uppercase mb-2">Health</div><div id="health-gauge" class="text-4xl font-black text-cyan-400">--</div></div>
    </div>
    <div class="glass p-12 h-64 flex items-center justify-center">
      <p class="text-gray-500 font-mono animate-pulse uppercase tracking-widest">> DATA_WIRED_TO_JSONBIN_ACTIVE</p>
    </div>
  </main>
</body></html>\`);
}`;

fs.writeFileSync('api/dashboard.js', code);
console.log('✅ DASHBOARD_WIRED');
