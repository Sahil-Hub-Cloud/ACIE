export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ACIE Enterprise Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #010409; color: #f8fafc; font-family: sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
  </style>
</head>
<body class="flex h-screen overflow-hidden">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-8">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <nav class="flex flex-col gap-2">
      <a href="/dashboard" class="px-4 py-2 bg-white/5 rounded-lg font-bold">Command Room</a>
      <a href="/war-room" class="px-4 py-2 text-gray-500 font-bold hover:text-white transition-colors">Global Map</a>
      <a href="/time-machine" class="px-4 py-2 text-gray-500 font-bold hover:text-white transition-colors">Time Machine</a>
      <a href="/copilot" class="px-4 py-2 text-gray-500 font-bold hover:text-white transition-colors">AI Agents</a>
    </nav>
  </aside>
  <main class="flex-1 p-10 overflow-y-auto">
    <h1 class="text-3xl font-black mb-8 tracking-tight">Mission Control</h1>
    
    <div class="glass rounded-3xl overflow-hidden mb-10">
      <table class="w-full text-left text-sm">
        <thead class="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <tr><th class="p-6">Repository</th><th>Health</th><th>Risk</th><th>Status</th><th>AI Agent</th></tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr class="hover:bg-white/5 transition-all"><td class="p-6 font-bold">acie-core</td><td class="text-emerald-400 font-black">98%</td><td><span class="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full">LOW</span></td><td>ONLINE</td><td class="text-indigo-400 font-bold">Security_V3</td></tr>
          <tr class="hover:bg-white/5 transition-all"><td class="p-6 font-bold">payment-gateway</td><td class="text-orange-400 font-black">74%</td><td><span class="text-xs bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full">HIGH</span></td><td>SCANNING...</td><td class="text-indigo-400 font-bold">DevOps_V1</td></tr>
          <tr class="hover:bg-white/5 transition-all"><td class="p-6 font-bold">auth-service</td><td class="text-emerald-400 font-black">92%</td><td><span class="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full">LOW</span></td><td>STABLE</td><td class="text-indigo-400 font-bold">Architect_X</td></tr>
        </tbody>
      </table>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div class="glass p-8 rounded-3xl">
        <h3 class="text-xs font-black uppercase text-gray-500 mb-6">AI Incident Timeline</h3>
        <div class="space-y-4 border-l-2 border-white/5 ml-2 pl-6 relative">
          <div class="relative"><div class="absolute -left-8 top-1 w-3 h-3 bg-rose-500 rounded-full"></div><div class="text-xs font-bold">09:21</div><div class="text-sm">Vulnerability detected in /auth/token.js</div></div>
          <div class="relative"><div class="absolute -left-8 top-1 w-3 h-3 bg-indigo-500 rounded-full"></div><div class="text-xs font-bold">09:24</div><div class="text-sm">AI Remediation PR #104 generated</div></div>
          <div class="relative"><div class="absolute -left-8 top-1 w-3 h-3 bg-emerald-500 rounded-full"></div><div class="text-xs font-bold">09:29</div><div class="text-sm">Issue resolved. Threat neutralized.</div></div>
        </div>
      </div>
      <div class="glass p-8 rounded-3xl h-fit">
        <h3 class="text-xs font-black uppercase text-gray-500 mb-4 text-center">Executive Summary</h3>
        <div class="text-4xl font-black text-center mb-2">$142,500</div>
        <div class="text-[10px] font-bold text-gray-600 text-center uppercase tracking-widest">Savings Generated This Month</div>
      </div>
    </div>
  </main>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}