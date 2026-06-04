export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
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
          document.getElementById('thinking').innerHTML = "<b>Analysis Complete:</b> The deployment failed due to a <b>Circular Dependency</b> in <i>/auth/token.js</i>. I have prepared an automated remediation PR. <br><br> <button onclick='showFix()' class='bg-emerald-600 px-4 py-2 rounded-lg font-bold text-xs'>GENERATE FIX PR</button>";
        }
      }, 800);
    }

    function showFix() {
      const box = document.getElementById('chat-box');
      box.innerHTML += '<div class="flex gap-4"><div class="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold">A</div><div class="max-w-2xl glass p-6 rounded-2xl"><div class="text-[10px] font-bold text-gray-500 mb-2 uppercase">Proposed Fix: /auth/token.js</div><div class="code-box p-4 rounded-lg mb-4 text-emerald-400"> - import { validate } from "./session"; <br> + import { validate } from "./utils/crypto"; </div><div id="pr-status" class="text-xs text-cyan-400 font-bold animate-pulse">CREATING GITHUB PULL REQUEST...</div></div></div>';
      setTimeout(() => {
        document.getElementById('pr-status').innerHTML = "✅ SUCCESS: PR #104 Created. <a href='#' class='underline'>View on GitHub</a>";
        document.getElementById('pr-status').classList.remove('animate-pulse');
        document.getElementById('pr-status').classList.add('text-emerald-400');
      }, 2000);
    }
  </script>
</head>
<body class="flex h-screen">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-6">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <button onclick="document.getElementById('chat-input').value='Why is deployment failing?'" class="text-left text-xs font-bold p-3 glass rounded-xl hover:border-indigo-500 transition-all">Why is deployment failing?</button>
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
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}