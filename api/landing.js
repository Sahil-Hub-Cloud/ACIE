export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #020617; font-family: 'Inter', sans-serif; color: #f8fafc; }
    h1, h2, h3 { font-family: 'Plus Jakarta Sans', sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .aurora { position: fixed; inset: 0; filter: blur(100px); z-index: -1; opacity: 0.5; }
    .orb { position: absolute; border-radius: 50%; animation: float 20s infinite alternate; }
    .orb-p { width: 600px; height: 600px; background: radial-gradient(circle, #7c3aed33, transparent 70%); top: -200px; left: -100px; }
    .orb-c { width: 500px; height: 500px; background: radial-gradient(circle, #06b6d422, transparent 70%); bottom: -100px; right: -100px; }
    @keyframes float { from { transform: translate(0,0); } to { transform: translate(100px, 50px); } }
    .neon-border { border: 1px solid transparent; background-image: linear-gradient(#020617, #020617), linear-gradient(135deg, #7c3aed, #06b6d4); background-origin: border-box; background-clip: padding-box, border-box; }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .brain-pulse { animation: brain-glow 4s infinite alternate; }
    @keyframes brain-glow { from { filter: drop-shadow(0 0 10px #7c3aed33); } to { filter: drop-shadow(0 0 40px #7c3aed88); } }
  </style>
</head><body>
  <div class="aurora"><div class="orb orb-p"></div><div class="orb orb-c"></div></div>
  <nav class="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl px-12 py-5 flex justify-between items-center">
    <div class="text-2xl font-extrabold flex items-center gap-2"><span class="text-cyan-400">⚡</span> ACIE</div>
    <div class="flex gap-10 text-sm font-semibold text-slate-400">
      <a href="/dashboard" class="hover:text-white transition-colors">Platform</a>
      <a href="/copilot" class="hover:text-white transition-colors">AI Copilot</a>
      <a href="/pricing" class="hover:text-white transition-colors">Pricing</a>
      <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="bg-white text-black px-6 py-2 rounded-full hover:scale-105 transition-transform">Get Started</a>
    </div>
  </nav>

  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <div class="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-4 py-2 rounded-full text-xs font-bold tracking-widest mb-8">
      <span class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span> SYSTEM LEVEL: TITAN ACTIVE
    </div>
    <h1 class="text-7xl md:text-9xl font-extrabold tracking-tighter mb-8 leading-[0.85]">Build. Secure.<br><span class="grad-txt">Automate. Scale.</span></h1>
    <p class="text-slate-400 text-xl max-w-2xl mb-12">The AI-Powered DevSecOps Intelligence Platform. <br>The All-in-One <span class="text-white font-bold">Google Maps for codebases.</span></p>
    <div class="flex gap-4">
      <button class="px-10 py-5 bg-white text-black rounded-2xl font-bold text-lg hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all">Start Free</button>
      <button class="px-10 py-5 glass rounded-2xl font-bold text-lg">Book Demo</button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-12 mt-32 w-full max-w-5xl">
       <div><div class="text-4xl font-bold text-white">250+</div><div class="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Repositories</div></div>
       <div><div class="text-4xl font-bold text-cyan-400">98%</div><div class="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Security Score</div></div>
       <div><div class="text-4xl font-bold text-purple-400">96%</div><div class="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Code Quality</div></div>
       <div><div class="text-4xl font-bold text-emerald-400">125+</div><div class="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">AI Predictions</div></div>
    </div>
  </section>

  <section class="py-32 px-12">
    <h2 class="text-5xl font-extrabold text-center mb-20 tracking-tighter">Powered by <span class="text-cyan-400">Intelligence.</span></h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
       <div class="glass p-10 hover:border-indigo-500/50 transition-all group">
         <div class="text-4xl mb-6">🧠</div>
         <h3 class="text-2xl font-bold mb-4">AI Code Review</h3>
         <p class="text-slate-500">Automated structural and logic analysis for every single pull request.</p>
       </div>
       <div class="glass p-10 hover:border-cyan-500/50 transition-all">
         <div class="text-4xl mb-6">🛡️</div>
         <h3 class="text-2xl font-bold mb-4">Security Scanning</h3>
         <p class="text-slate-500">Instant detection of hardcoded secrets and leaked API keys.</p>
       </div>
       <div class="glass p-10 hover:border-emerald-500/50 transition-all">
         <div class="text-4xl mb-6">⚡</div>
         <h3 class="text-2xl font-bold mb-4">PR Intelligence</h3>
         <p class="text-slate-500">Predictive impact analysis and blast radius mapping across modules.</p>
       </div>
    </div>
  </section>
</body></html>`);}