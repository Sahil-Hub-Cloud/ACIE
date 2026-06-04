import fs from 'fs';

const head = `
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background: #010409; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass { background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; }
    .grad { background: linear-gradient(135deg, #fff, #00d1ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  </style>
`;

const landing = `<!DOCTYPE html><html><head><title>ACIE</title>${head}</head><body class="flex flex-col items-center justify-center min-h-screen text-center"><h1 class="text-8xl font-black tracking-tighter mb-6">Build. Secure.<br><span class="grad">Automate. Scale.</span></h1><p class="text-gray-400 text-xl italic mb-10">"The All-in-One Google Maps for codebases."</p><a href="/dashboard.html" class="px-10 py-5 bg-white text-black rounded-2xl font-bold text-xl hover:scale-105 transition-all">Launch Console →</a></body></html>`;

const dashboard = `<!DOCTYPE html><html><head><title>ACIE Dashboard</title>${head}</head><body class="p-10"><h1 class="text-4xl font-black mb-10">Mission Control</h1><div class="grid grid-cols-2 gap-6"><div class="glass p-10"><h3>Security</h3><div class="text-4xl font-black text-emerald-400">98%</div></div><div class="glass p-10"><h3>Quality</h3><div class="text-4xl font-black text-white">96%</div></div></div></body></html>`;

fs.writeFileSync('index.html', landing);
fs.writeFileSync('dashboard.html', dashboard);
console.log('✅ SYSTEM CLEANED AND CORE UI RESTORED');
