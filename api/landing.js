const DEMO_ENGINE = `
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Space+Mono&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #010409; font-family: 'Inter', sans-serif; color: #f8fafc; overflow-x:hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, #00d1ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .scan-line { width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #7c3aed, transparent); position: absolute; top: 0; animation: scan 3s infinite linear; }
    @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
    .typing::after { content: '|'; animation: blink 1s infinite; }
    @keyframes blink { 50% { opacity: 0; } }
  </style>
  <script>
    function startScan() {
      const overlay = document.getElementById('scan-overlay');
      const log = document.getElementById('scan-log');
      overlay.classList.remove('hidden');
      const steps = [
        "Connecting to GitHub Instance...",
        "Analyzing Cluster Architecture...",
        "Mapping 1,240 Dependency Nodes...",
        "Calculating Blast Radius for /src/auth...",
        "Detecting Vulnerabilities in Node_Modules...",
        "Generating Intelligence Report..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if(i < steps.length) {
          log.innerHTML += '<div class="text-cyan-400 mt-1">> ' + steps[i] + '</div>';
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => { overlay.classList.add('hidden'); window.location.href='/dashboard'; }, 1000);
        }
      }, 800);
    }
  </script>
`;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html><html><head>${DEMO_ENGINE}</head><body>
  <div id="scan-overlay" class="fixed inset-0 z-[200] bg-black flex items-center justify-center hidden">
    <div class="max-w-md w-full p-10 font-mono text-sm">
      <div class="mb-4 text-slate-500 font-bold tracking-widest">ACIE_SYSTEM_SCAN</div>
      <div id="scan-log" class="space-y-1"></div>
      <div class="mt-8 h-1 bg-white/10 overflow-hidden"><div class="h-full bg-indigo-500 animate-[pulse_1s_infinite]"></div></div>
    </div>
  </div>

  <nav class="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl px-12 py-5 flex justify-between items-center">
    <div class="text-2xl font-extrabold">⚡ ACIE</div>
    <div class="flex gap-8 text-sm font-bold text-slate-400">
      <a href="/dashboard">Platform</a><a href="/executive">ROI</a><a href="/pricing">Pricing</a>
      <button onclick="startScan()" class="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-500 transition-all">Launch Console</button>
    </div>
  </nav>

  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <h1 class="text-7xl md:text-9xl font-black tracking-tighter mb-6 leading-none">Build. Secure.<br><span class="grad-txt">Automate.</span></h1>
    <p class="text-slate-400 text-xl max-w-xl mb-12">"The Google Maps for codebases." <br>The DevSecOps Command Center for High-Velocity Teams.</p>
    <button onclick="startScan()" class="px-12 py-6 bg-white text-black rounded-2xl font-black text-xl hover:scale-105 transition-all">Scan Your Repository →</button>
  </section>

  <section class="py-32 px-12 glass mx-12 rounded-[40px] text-center">
    <h2 class="text-4xl font-bold mb-16 uppercase tracking-widest text-slate-500">Global Network Stats</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-20 max-w-5xl mx-auto">
       <div><div class="text-6xl font-black text-white">500K</div><div class="text-xs font-bold text-cyan-400 mt-4 uppercase">Repos Mapped</div></div>
       <div><div class="text-6xl font-black text-white">12M</div><div class="text-xs font-bold text-purple-400 mt-4 uppercase">PRs Analyzed</div></div>
       <div><div class="text-6xl font-black text-white">850K</div><div class="text-xs font-bold text-emerald-400 mt-4 uppercase">Risks Prevented</div></div>
    </div>
  </section>
</body></html>`);
}