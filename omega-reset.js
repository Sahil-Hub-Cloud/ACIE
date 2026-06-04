import fs from 'fs';
import path from 'path';

const apiDir = './api';
if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);

const landing = `const DEMO_ENGINE = \`
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Space+Mono&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #010409; font-family: 'Inter', sans-serif; color: #f8fafc; overflow-x:hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, #00d1ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .scan-line { width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #7c3aed, transparent); position: absolute; top: 0; animation: scan 3s infinite linear; }
    @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
    .typing::after { content: '|'; animation: blink 1s infinite; }
    @keyframes blink { 50% { opacity: 0; } }
  </style>
  <script>
    function startScan() {
      const overlay = document.getElementById('scan-overlay');
      const log = document.getElementById('scan-log');
      overlay.classList.remove('hidden');
      const steps = [
        "Connecting to GitHub Instance...",
        "Analyzing Cluster Architecture...",
        "Mapping 1,240 Dependency Nodes...",
        "Calculating Blast Radius for /src/auth...",
        "Detecting Vulnerabilities in Node_Modules...",
        "Generating Intelligence Report..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if(i < steps.length) {
          log.innerHTML += '<div class="text-cyan-400 mt-1">> ' + steps[i] + '</div>';
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => { overlay.classList.add('hidden'); window.location.href='/dashboard'; }, 1000);
        }
      }, 800);
    }
  </script>
\`;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(\`<!DOCTYPE html><html><head>\${DEMO_ENGINE}</head><body>
  <div id="scan-overlay" class="fixed inset-0 z-[200] bg-black flex items-center justify-center hidden">
    <div class="max-w-md w-full p-10 font-mono text-sm">
      <div class="mb-4 text-slate-500 font-bold tracking-widest">ACIE_SYSTEM_SCAN</div>
      <div id="scan-log" class="space-y-1"></div>
      <div class="mt-8 h-1 bg-white/10 overflow-hidden"><div class="h-full bg-indigo-500 animate-[pulse_1s_infinite]"></div></div>
    </div>
  </div>

  <nav class="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl px-12 py-5 flex justify-between items-center">
    <div class="text-2xl font-extrabold">⚡ ACIE</div>
    <div class="flex gap-8 text-sm font-bold text-slate-400">
      <a href="/dashboard">Platform</a><a href="/executive">ROI</a><a href="/pricing">Pricing</a>
      <button onclick="startScan()" class="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-500 transition-all">Launch Console</button>
    </div>
  </nav>

  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <h1 class="text-7xl md:text-9xl font-black tracking-tighter mb-6 leading-none">Build. Secure.<br><span class="grad-txt">Automate.</span></h1>
    <p class="text-slate-400 text-xl max-w-xl mb-12">"The Google Maps for codebases." <br>The DevSecOps Command Center for High-Velocity Teams.</p>
    <button onclick="startScan()" class="px-12 py-6 bg-white text-black rounded-2xl font-black text-xl hover:scale-105 transition-all">Scan Your Repository →</button>
  </section>

  <section class="py-32 px-12 glass mx-12 rounded-[40px] text-center">
    <h2 class="text-4xl font-bold mb-16 uppercase tracking-widest text-slate-500">Global Network Stats</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-20 max-w-5xl mx-auto">
       <div><div class="text-6xl font-black text-white">500K</div><div class="text-xs font-bold text-cyan-400 mt-4 uppercase">Repos Mapped</div></div>
       <div><div class="text-6xl font-black text-white">12M</div><div class="text-xs font-bold text-purple-400 mt-4 uppercase">PRs Analyzed</div></div>
       <div><div class="text-6xl font-black text-white">850K</div><div class="text-xs font-bold text-emerald-400 mt-4 uppercase">Risks Prevented</div></div>
    </div>
  </section>
</body></html>\`);
}`;

const dashboard = `export default async function handler(req, res) {
  const html = \`<!DOCTYPE html>
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
</html>\`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}`;

const copilot = `export default async function handler(req, res) {
  const html = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ACIE AI Copilot — Intelligence</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #010409; color: #f8fafc; font-family: sans-serif; overflow: hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .code-box { background: #000; border: 1px solid #1a1a1a; font-family: monospace; font-size: 12px; }
  </style>
  <script>
    function askAI() {
      const input = document.getElementById('chat-input');
      const box = document.getElementById('chat-box');
      if(!input.value) return;
      box.innerHTML += '<div class="flex justify-end"><div class="bg-indigo-600 px-4 py-2 rounded-2xl text-sm max-w-md">' + input.value + '</div></div>';
      input.value = "";
      const aiMsg = document.createElement('div');
      aiMsg.className = "flex gap-4";
      aiMsg.innerHTML = '<div class="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold">A</div><div id="thinking" class="max-w-xl text-sm text-cyan-400 font-mono italic">> Initializing Deep Audit...</div>';
      box.appendChild(aiMsg);
      const steps = ["Reading commits...", "Analyzing dependency tree...", "Comparing build logs...", "Root cause identified."];
      let i = 0;
      const itv = setInterval(() => {
        if(i < steps.length) {
          document.getElementById('thinking').innerText = "> " + steps[i];
          i++;
        } else {
          clearInterval(itv);
          document.getElementById('thinking').innerHTML = "<b>Analysis Complete:</b> The deployment failed due to a <b>Circular Dependency</b> in <i>/auth/token.js</i>. I have prepared an automated remediation PR. <br><br> <button onclick=\\'showFix()\\' class=\\'bg-emerald-600 px-4 py-2 rounded-lg font-bold text-xs\\'>GENERATE FIX PR</button>";
        }
      }, 800);
    }

    function showFix() {
      const box = document.getElementById('chat-box');
      box.innerHTML += '<div class="flex gap-4"><div class="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold">A</div><div class="max-w-2xl glass p-6 rounded-2xl"><div class="text-[10px] font-bold text-gray-500 mb-2 uppercase">Proposed Fix: /auth/token.js</div><div class="code-box p-4 rounded-lg mb-4 text-emerald-400"> - import { validate } from "./session"; <br> + import { validate } from "./utils/crypto"; </div><div id="pr-status" class="text-xs text-cyan-400 font-bold animate-pulse">CREATING GITHUB PULL REQUEST...</div></div></div>';
      setTimeout(() => {
        document.getElementById('pr-status').innerHTML = "✅ SUCCESS: PR #104 Created. <a href=\\'#\\' class=\\'underline\\'>View on GitHub</a>";
        document.getElementById('pr-status').classList.remove('animate-pulse');
        document.getElementById('pr-status').classList.add('text-emerald-400');
      }, 2000);
    }
  </script>
</head>
<body class="flex h-screen">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-6">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <button onclick="document.getElementById('chat-input').value=\\'Why is deployment failing?\\'" class="text-left text-xs font-bold p-3 glass rounded-xl hover:border-indigo-500 transition-all">Why is deployment failing?</button>
    <a href="/dashboard" class="mt-auto text-xs text-gray-500">← Back to Mission Control</a>
  </aside>
  <main class="flex-1 flex flex-col p-10">
    <div class="flex-1 glass rounded-[40px] p-10 flex flex-col shadow-2xl">
      <div id="chat-box" class="flex-1 overflow-y-auto space-y-6 mb-6 pr-4">
        <div class="flex gap-4">
          <div class="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold text-sm">A</div>
          <div class="max-w-xl text-sm text-slate-300">Terminal ready. Systems nominal. How can I assist with your repository today, Sahil?</div>
        </div>
      </div>
      <div class="relative">
        <input id="chat-input" class="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm focus:outline-none focus:border-indigo-500 pr-20" placeholder="Type a message or use a quick action...">
        <button onclick="askAI()" class="absolute right-4 top-4 bg-white text-black p-3 rounded-2xl hover:scale-105 transition-all"><i data-lucide="send"></i></button>
      </div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body>
</html>\`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}`;

const warRoom = `export default async function handler(req, res) {
  const html = \`<!DOCTYPE html>
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
</html>\`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}`;

const digitalTwin = `export default async function handler(req, res) {
  const html = \`<!DOCTYPE html>
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
</html>\`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}`;

const outages = `export default async function handler(req, res) {
  const html = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>ACIE — Outage Prediction</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #010409; color: #f8fafc; font-family: sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .danger-bar { height: 4px; background: #333; border-radius: 2px; overflow: hidden; }
    .fill { height: 100%; transition: width 2s; }
  </style>
</head>
<body class="p-12 max-w-5xl mx-auto">
  <h1 class="text-4xl font-black mb-10 tracking-tight">Predictive Outage Engine</h1>
  <div class="grid gap-6">
    <div class="glass p-8 rounded-3xl flex items-center justify-between">
      <div class="w-1/3"><h3 class="font-bold">Payment Gateway</h3><p class="text-xs text-gray-500">Predicted instability in next 4 hours</p></div>
      <div class="flex-1 px-10"><div class="danger-bar"><div class="fill bg-rose-600" style="width: 87%"></div></div></div>
      <div class="text-2xl font-black text-rose-500">87% <span class="text-[10px] uppercase">Prob</span></div>
    </div>
    <div class="glass p-8 rounded-3xl flex items-center justify-between">
      <div class="w-1/3"><h3 class="font-bold">Auth Service</h3><p class="text-xs text-gray-500">Session layer congestion detected</p></div>
      <div class="flex-1 px-10"><div class="danger-bar"><div class="fill bg-orange-500" style="width: 42%"></div></div></div>
      <div class="text-2xl font-black text-orange-500">42% <span class="text-[10px] uppercase">Prob</span></div>
    </div>
  </div>
  <div class="mt-20 p-8 glass rounded-[32px] text-center border-indigo-500/20">
    <div class="text-xs font-bold text-indigo-400 mb-2 uppercase">AI Automated Mitigation</div>
    <p class="text-sm">Scaling secondary clusters in <b>us-east-1</b> automatically to prevent downtime.</p>
  </div>
</body>
</html>\`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}`;

const marketplace = `export default async function handler(req, res) {
  const html = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>ACIE — Marketplace</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #010409; color: #f8fafc; font-family: sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
  </style>
</head>
<body class="p-12">
  <h1 class="text-5xl font-black mb-12 tracking-tighter">AI Intelligence Marketplace</h1>
  <div class="grid grid-cols-3 gap-8">
    <div class="glass p-8 rounded-[40px] hover:border-purple-500/50 transition-all">
       <div class="text-3xl mb-4">☁️</div>
       <h3 class="font-bold text-lg mb-2">Cloud Cost Pack</h3>
       <p class="text-xs text-gray-500 mb-6">AI agent that finds and removes unused cloud resources.</p>
       <button class="bg-indigo-600 text-white w-full py-3 rounded-2xl font-bold text-xs">INSTALL PACK</button>
    </div>
    <div class="glass p-8 rounded-[40px] hover:border-emerald-500/50 transition-all">
       <div class="text-3xl mb-4">🛡️</div>
       <h3 class="font-bold text-lg mb-2">Security Hardening</h3>
       <p class="text-xs text-gray-500 mb-6">Automated Zero-Day vulnerability patching.</p>
       <button class="bg-emerald-600 text-white w-full py-3 rounded-2xl font-bold text-xs">INSTALLED</button>
    </div>
    <div class="glass p-8 rounded-[40px] hover:border-cyan-500/50 transition-all">
       <div class="text-3xl mb-4">☸️</div>
       <h3 class="font-bold text-lg mb-2">K8s Optimizer</h3>
       <p class="text-xs text-gray-500 mb-6">Neural tuning of your Kubernetes orchestration.</p>
       <button class="bg-white text-black w-full py-3 rounded-2xl font-bold text-xs">ONE-CLICK INSTALL</button>
    </div>
  </div>
</body>
</html>\`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}`;

fs.writeFileSync(path.join(apiDir, 'landing.js'), landing);
fs.writeFileSync(path.join(apiDir, 'dashboard.js'), dashboard);
fs.writeFileSync(path.join(apiDir, 'copilot.js'), copilot);
fs.writeFileSync(path.join(apiDir, 'war-room.js'), warRoom);
fs.writeFileSync(path.join(apiDir, 'digital-twin.js'), digitalTwin);
fs.writeFileSync(path.join(apiDir, 'outages.js'), outages);
fs.writeFileSync(path.join(apiDir, 'marketplace.js'), marketplace);

console.log('✅ ALL OMEGA MODULES RESET AND SYNCHRONIZED');
