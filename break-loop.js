import fs from 'fs';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>ACIE — Google Maps for codebases.</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #010409; color: #fff; font-family: sans-serif; }
        .grad { background: linear-gradient(135deg, #fff 40%, #00d1ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen text-center bg-[#010409]">
    <nav class="fixed top-0 w-full p-10 flex justify-between items-center border-b border-white/5 backdrop-blur-xl">
        <div class="text-2xl font-black">⚡ ACIE</div>
        <div class="flex gap-6 text-xs font-bold text-gray-400">
            <a href="/dashboard.html">DASHBOARD</a>
            <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="text-white">GITHUB</a>
        </div>
    </nav>
    <h1 class="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-6">Build. Secure.<br><span class="grad">Automate. Scale.</span></h1>
    <p class="text-gray-400 text-xl italic mb-10">"The All-in-One Google Maps for codebases."</p>
    <a href="/dashboard.html" class="px-10 py-5 bg-white text-black rounded-2xl font-bold text-xl hover:scale-105 transition-all">Launch Platform →</a>
</body>
</html>`;

const dashboard = `<!DOCTYPE html>
<html>
<head>
    <title>ACIE — Command Center</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#010409] text-white p-20">
    <h1 class="text-5xl font-black mb-10">Mission Control</h1>
    <div class="grid grid-cols-4 gap-6">
        <div class="p-10 border border-white/10 rounded-3xl bg-white/5"><div class="text-xs text-gray-500 font-bold uppercase mb-2">Security</div><div class="text-4xl font-black text-emerald-400">98%</div></div>
        <div class="p-10 border border-white/10 rounded-3xl bg-white/5"><div class="text-xs text-gray-500 font-bold uppercase mb-2">Quality</div><div class="text-4xl font-black text-white">96%</div></div>
        <div class="p-10 border border-white/10 rounded-3xl bg-white/5"><div class="text-xs text-gray-500 font-bold uppercase mb-2">Vulnerabilities</div><div class="text-4xl font-black text-rose-500">12</div></div>
        <div class="p-10 border border-white/10 rounded-3xl bg-white/5"><div class="text-xs text-gray-500 font-bold uppercase mb-2">Stability</div><div class="text-4xl font-black text-cyan-400">94%</div></div>
    </div>
</body>
</html>`;

fs.writeFileSync('./public/index.html', html);
fs.writeFileSync('./public/dashboard.html', dashboard);
console.log('✅ UI FILES CREATED IN PUBLIC FOLDER');
