export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ACIE AI Copilot</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #010409; color: #f8fafc; font-family: sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .typing::after { content: '|'; animation: blink 1s infinite; }
    @keyframes blink { 50% { opacity: 0; } }
  </style>
  <script>
    function askAI() {
      const input = document.getElementById('chat-input');
      const box = document.getElementById('chat-box');
      if(!input.value) return;

      // User Message
      box.innerHTML += '<div class="flex justify-end"><div class="bg-indigo-600 px-4 py-2 rounded-2xl text-sm max-w-md">' + input.value + '</div></div>';
      
      const query = input.value;
      input.value = "";

      // AI Investigation Sequence
      const aiMsg = document.createElement('div');
      aiMsg.className = "flex gap-4";
      aiMsg.innerHTML = '<div class="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold">A</div><div id="thinking" class="max-w-xl text-sm text-cyan-400 font-mono italic">AI is investigating...</div>';
      box.appendChild(aiMsg);

      const steps = [
        "Analyzing repository structure...",
        "Searching deployment logs...",
        "Reading recent commits by sahilshaik...",
        "Cross-referencing dependency graph...",
        "Root cause identified."
      ];

      let i = 0;
      const itv = setInterval(() => {
        if(i < steps.length) {
          document.getElementById('thinking').innerText = "> " + steps[i];
          i++;
        } else {
          clearInterval(itv);
          document.getElementById('thinking').classList.remove('text-cyan-400', 'font-mono', 'italic');
          document.getElementById('thinking').classList.add('text-slate-200');
          document.getElementById('thinking').innerHTML = "<b>Analysis Complete:</b> The deployment failed due to a <b>Circular Dependency</b> introduced in <i>/auth/token.js</i>. I recommend applying the automated fix I've prepared. <br><br> <button class='bg-emerald-600 px-4 py-2 rounded-lg font-bold text-xs mt-2'>GENERATE FIX PR</button>";
        }
      }, 1000);
    }
  </script>
</head>
<body class="flex h-screen">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-6">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Quick Actions</div>
    <button onclick="document.getElementById('chat-input').value='Explain this repository'" class="text-left text-xs font-bold p-3 glass rounded-xl hover:border-indigo-500 transition-all">Explain Repository</button>
    <button onclick="document.getElementById('chat-input').value='Find security vulnerabilities'" class="text-left text-xs font-bold p-3 glass rounded-xl hover:border-rose-500 transition-all">Find Vulnerabilities</button>
    <a href="/dashboard" class="mt-auto text-xs text-gray-500 hover:text-white">← Back to Mission Control</a>
  </aside>
  <main class="flex-1 flex flex-col p-10 bg-[#010409]">
    <div class="flex-1 glass rounded-3xl p-8 flex flex-col shadow-2xl">
      <div id="chat-box" class="flex-1 overflow-y-auto space-y-6 mb-6">
        <div class="flex gap-4">
          <div class="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold">A</div>
          <div class="max-w-xl text-sm text-slate-300">Hello Sahil. I am ACIE Intelligence. How can I help you secure or optimize your repository today?</div>
        </div>
      </div>
      <div class="relative">
        <input id="chat-input" class="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm focus:outline-none focus:border-indigo-500 pr-20" placeholder="Type a message or use a quick action...">
        <button onclick="askAI()" class="absolute right-3 top-3 bg-white text-black p-2 rounded-xl hover:scale-105 transition-all"><i data-lucide="send"></i></button>
      </div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}