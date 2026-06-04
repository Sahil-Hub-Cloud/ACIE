export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
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
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
