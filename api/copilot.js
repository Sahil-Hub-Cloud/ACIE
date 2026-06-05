export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html><html><head>
  <meta charset="UTF-8"><title>ACIE Copilot — Investigative AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background: #010409; color: #f8fafc; font-family: sans-serif; overflow: hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 40px; }
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
      aiMsg.innerHTML = '<div class="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-bold">A</div><div id="thinking" class="max-w-xl text-sm text-cyan-400 font-mono italic">> Initializing Deep Audit...</div>';
      box.appendChild(aiMsg);
      const steps = ["Reading commits...", "Analyzing dependency tree...", "Comparing build logs...", "Root cause identified."];
      let i = 0;
      const itv = setInterval(() => {
        if(i < steps.length) {
          document.getElementById('thinking').innerText = "> " + steps[i];
          i++;
        } else {
          clearInterval(itv);
          document.getElementById('thinking').innerHTML = "<b>Analysis Complete:</b> The deployment failed due to a <b>Circular Dependency</b> in <i>/auth/token.js</i>. <br><br> <button class='bg-emerald-600 px-4 py-2 rounded-lg font-bold text-xs mt-2'>GENERATE FIX PR</button>";
        }
      }, 800);
    }
  </script>
</head>
<body class="flex h-screen">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-6">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <a href="/dashboard" class="text-xs font-bold text-gray-500 hover:text-white uppercase">← Back to Dashboard</a>
  </aside>
  <main class="flex-1 flex flex-col p-10 bg-[#010409]">
    <div class="flex-1 glass p-10 flex flex-col shadow-2xl">
      <div id="chat-box" class="flex-1 overflow-y-auto space-y-6">
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-bold">A</div>
          <div class="max-w-xl text-sm text-slate-300 bg-white/5 p-5 rounded-2xl border border-white/5">
            Hello Sahil. I am ACIE Intelligence. Ask me "Why is deployment failing?" to start investigation.
          </div>
        </div>
      </div>
      <div class="mt-10 relative">
        <input id="chat-input" class="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm focus:outline-none focus:border-indigo-500 pr-20" placeholder="Ask AI about your codebase...">
        <button onclick="askAI()" class="absolute right-4 top-4 bg-white text-black p-3 rounded-2xl hover:scale-105 transition-all"><i data-lucide="send"></i></button>
      </div>
    </div>
  </main>
</body></html>`);
}