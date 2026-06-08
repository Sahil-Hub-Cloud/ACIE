export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html><html><head>
  <meta charset="UTF-8"><title>ACIE Copilot — Intelligence</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background: #010409; color: #f8fafc; font-family: sans-serif; overflow: hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 40px; }
  </style>
  <script>
    async function askAI() {
      const input = document.getElementById('chat-input');
      const box = document.getElementById('chat-box');
      if(!input.value) return;

      const userQuery = input.value;
      box.innerHTML += '<div class="flex justify-end"><div class="bg-indigo-600 px-4 py-2 rounded-2xl text-sm max-w-md">' + userQuery.replace(/</g, "&lt;") + '</div></div>';
      input.value = "";

      const aiMsg = document.createElement('div');
      aiMsg.className = "flex gap-4";
      aiMsg.innerHTML = '<div class="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold text-xs">A</div><div id="thinking" class="max-w-xl text-sm text-cyan-400 font-mono italic">> Initializing query...</div>';
      box.appendChild(aiMsg);
      box.scrollTop = box.scrollHeight;

      try {
        const r = await fetch('/api/copilot-brain?q=' + encodeURIComponent(userQuery));
        const data = await r.json();
        
        let i = 0;
        const itv = setInterval(() => {
          if(i < data.steps.length) {
            document.getElementById('thinking').innerText = "> " + data.steps[i];
            i++;
          } else {
            clearInterval(itv);
            const thinkNode = document.getElementById('thinking');
            thinkNode.id = ""; 
            thinkNode.classList.remove('text-cyan-400', 'font-mono', 'italic');
            thinkNode.innerHTML = data.finalAnswer;
          }
          box.scrollTop = box.scrollHeight;
        }, 600);
      } catch (e) {
        document.getElementById('thinking').innerText = "!! Communication Error with ACIE_CORE";
      }
    }
  </script>
</head>
<body class="flex h-screen">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-6">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Context: ACIE_PROD</div>
    <button onclick="document.getElementById('chat-input').value='Why did deployment fail?'" class="text-left text-xs font-bold p-3 glass rounded-xl hover:border-indigo-500 transition-all">Why did deployment fail?</button>
    <button onclick="document.getElementById('chat-input').value='What is the impact?'" class="text-left text-xs font-bold p-3 glass rounded-xl hover:border-cyan-500 transition-all">What is the impact?</button>
    <a href="/dashboard" class="mt-auto text-xs text-gray-500 hover:text-white uppercase">← Back to Dashboard</a>
  </aside>
  <main class="flex-1 flex flex-col p-10 bg-[#010409]">
    <div class="flex-1 glass p-10 flex flex-col shadow-2xl overflow-hidden">
      <div id="chat-box" class="flex-1 overflow-y-auto space-y-6 mb-6 pr-4">
        <div class="flex gap-4">
          <div class="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold text-xs">A</div>
          <div class="max-w-xl text-sm text-slate-300 bg-white/5 p-5 rounded-2xl border border-white/5">
            Neural link established. I have access to your repository's telemetry records. How can I assist you today?
          </div>
        </div>
      </div>
      <div class="relative">
        <input id="chat-input" onkeypress="if(event.key==='Enter') askAI()" class="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm focus:outline-none focus:border-indigo-500 transition-all pr-20" placeholder="Ask intelligence...">
        <button onclick="askAI()" class="absolute right-4 top-4 bg-white text-black p-3 rounded-2xl hover:scale-105 transition-all"><i data-lucide="send" class="w-4 h-4"></i></button>
      </div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>\`);
}