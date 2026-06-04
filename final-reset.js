import fs from 'fs';

const UI = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>ACIE — Google Maps for codebases.</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;800&display=swap" rel="stylesheet">
    <style>
        body { background: #010409; color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x:hidden; }
        .grad { background: linear-gradient(135deg, #fff, #00d1ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .glass { background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; }
    </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen text-center px-6">
    <div class="mb-6 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-4 py-2 rounded-full text-[10px] font-black tracking-[0.3em]">SYSTEM ONLINE</div>
    <h1 class="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-6">Build. Secure.<br><span class="grad">Automate. Scale.</span></h1>
    <p class="text-gray-400 text-xl italic mb-10">"The All-in-One Google Maps for codebases."</p>
    <div class="flex gap-4">
        <a href="/dashboard.html" class="px-10 py-5 bg-white text-black rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">Launch Console →</a>
    </div>
</body>
</html>`;

const DASH = `<!DOCTYPE html><html><head><title>ACIE Dashboard</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-[#010409] text-white p-10">
    <h1 class="text-4xl font-black mb-10">Mission Control</h1>
    <div class="grid grid-cols-2 gap-6">
        <div class="p-10 border border-white/10 rounded-3xl bg-white/5"><h3>Security</h3><div class="text-4xl font-black text-emerald-400">98%</div></div>
        <div class="p-10 border border-white/10 rounded-3xl bg-white/5"><h3>Quality</h3><div class="text-4xl font-black">96%</div></div>
    </div>
</body></html>`;

fs.writeFileSync('./public/index.html', UI);
fs.writeFileSync('./public/dashboard.html', DASH);
console.log('✅ OMEGA CORE WRITTEN TO PUBLIC FOLDER');
