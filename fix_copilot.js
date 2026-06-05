import fs from 'fs';

const code = `export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(\`<!DOCTYPE html><html><head>
  <meta charset="UTF-8"><title>ACIE Copilot</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background: #010409; color: #f8fafc; font-family: sans-serif; overflow: hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 40px; }
  </style>
</head>
<body class="flex h-screen">
  <aside class="w-64 bg-black border-r border-white/5 p-8 flex flex-col gap-6">
    <div class="text-2xl font-black">⚡ ACIE</div>
    <a href="/dashboard" class="text-xs font-bold text-gray-500 hover:text-white">← MISSION CONTROL</a>
  </aside>
  <main class="flex-1 flex flex-col p-10 bg-[#010409]">
    <div class="flex-1 glass p-10 flex flex-col shadow-2xl">
      <div id="chat-box" class="flex-1 overflow-y-auto space-y-6">
        <div class="flex gap-4">
          <div class="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-bold">A</div>
          <div class="max-w-xl text-sm text-slate-300 bg-white/5 p-5 rounded-2xl border border-white/5">
            Hello Sahil. I am ACIE Intelligence. How can I help you secure or optimize your repository today?
          </div>
        </div>
      </div>
      <div class="mt-10 relative">
        <input class="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm focus:outline-none focus:border-indigo-500 transition-all pr-20" placeholder="Ask AI about your codebase...">
        <button class="absolute right-4 top-4 bg-white text-black p-3 rounded-2xl hover:scale-105 transition-all"><i data-lucide="send"></i></button>
      </div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>\`);
}`;

fs.writeFileSync('api/copilot.js', code);
console.log('✅ ELITE_COPILOT_RESTORED');
