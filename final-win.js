import fs from 'fs';

const ui = `<!DOCTYPE html>
<html>
<head>
    <title>ACIE — Google Maps for codebases.</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #010409; color: #fff; font-family: sans-serif; }
        .grad { background: linear-gradient(135deg, #fff, #00d1ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen text-center bg-[#010409]">
    <h1 class="text-7xl font-black tracking-tighter mb-6">Build. Secure.<br><span class="grad">Automate. Scale.</span></h1>
    <p class="text-gray-400 text-xl mb-10">The All-in-One Google Maps for codebases.</p>
    <a href="/dashboard.html" class="px-10 py-5 bg-white text-black rounded-2xl font-bold text-xl hover:scale-105 transition-all">Launch Platform</a>
</body>
</html>`;

const dash = `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-[#010409] text-white p-20">
    <h1 class="text-5xl font-black mb-10">Mission Control</h1>
    <div class="p-10 border border-white/10 rounded-3xl bg-white/5">
        <div class="text-emerald-400 text-4xl font-black">98% Security Score</div>
    </div>
</body></html>`;

// WRITE DIRECTLY TO THE ROOT
fs.writeFileSync('index.html', ui);
fs.writeFileSync('dashboard.html', dash);
console.log('DONE: Files written to root.');
