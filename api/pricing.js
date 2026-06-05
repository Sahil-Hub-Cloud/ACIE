export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>ACIE — Pricing & Licensing</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root { --bg: #020617; --surface: #0b0f1a; --accent: #7c3aed; --cyan: #06b6d4; }
    body { background-color: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .glass { background: rgba(11, 15, 26, 0.35); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.06); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); }
    .glass-inner { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.04); }
    .sidebar-link:hover { background: rgba(124, 58, 237, 0.1); color: #fff; }
    .sidebar-link.active { background: rgba(124, 58, 237, 0.15); color: #fff; border-right: 2px solid var(--accent); }
    
    .dashboard-card {
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .dashboard-card:hover {
      transform: translateY(-4px) scale(1.005);
      border-color: rgba(124, 58, 237, 0.25);
      box-shadow: 0 16px 40px -10px rgba(124, 58, 237, 0.2);
    }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
  </style>
</head>
<body class="flex h-screen overflow-hidden">
  <!-- Sidebar -->
  <aside class="w-64 bg-[#010409] border-r border-white/5 flex flex-col h-full shrink-0">
    <div class="p-8 text-xl font-bold">⚡ ACIE</div>
    <nav class="flex-1 px-4 space-y-1">
      <a href="/dashboard" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-500 hover:text-white"><i data-lucide="layout-grid"></i> Overview</a>
      <a href="/war-room" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-500 hover:text-white"><i data-lucide="map"></i> War Room</a>
      <a href="/history" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-500 hover:text-white"><i data-lucide="history"></i> Logs</a>
      <a href="/pricing" class="sidebar-link active flex items-center gap-3 p-3 rounded-lg text-sm font-medium"><i data-lucide="credit-card"></i> Pricing</a>
    </nav>
    <div class="p-6 border-t border-white/5 bg-[#010409]">
      <div class="glass p-4 rounded-xl text-center relative overflow-hidden group">
        <div class="text-[10px] font-bold text-slate-500 uppercase mb-1">System Integrity</div>
        <div id="sys-integrity-val" class="text-lg font-black text-emerald-400 mb-2">0.0%</div>
        <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div id="sys-integrity-bar" class="h-full bg-emerald-500 rounded-full transition-all duration-[1500ms] ease-out" style="width: 0%"></div>
        </div>
      </div>
    </div>
  </aside>

  <!-- Main Content Area -->
  <main class="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950">
    <header class="h-16 border-b border-white/5 flex items-center justify-between px-10 bg-[#010409]/50 shrink-0">
      <div class="text-xs font-bold text-slate-500 uppercase tracking-widest">Plans & Licensing / <span class="text-white">PRICING</span></div>
      <div class="flex items-center gap-4 text-xs font-bold"><span class="text-emerald-500 flex items-center gap-1"><span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> AGENTS ONLINE</span></div>
    </header>

    <div class="p-10 space-y-12 max-w-6xl mx-auto w-full">
      <!-- Hero Header -->
      <div class="text-center space-y-3">
        <div class="text-[10px] font-bold text-cyan-400 tracking-[0.3em] uppercase">PRICING_MATRIX</div>
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">Simple, transparent <span class="bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">pricing</span></h1>
        <p class="text-xs text-slate-400 font-mono tracking-widest uppercase">Start free · Upgrade when ready · No contracts</p>
      </div>

      <!-- Pricing Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Free Tier Card -->
        <div class="glass p-8 rounded-[32px] flex flex-col justify-between border border-white/5 relative overflow-hidden group dashboard-card">
          <div class="absolute inset-0 bg-gradient-to-tr from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div>
            <div class="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">// FREE_TIER</div>
            <div class="flex items-baseline mb-3">
              <span class="text-5xl font-black">$0</span>
              <span class="text-xs text-slate-500 ml-1">/mo</span>
            </div>
            <p class="text-xs text-slate-400 mb-6 leading-relaxed">Perfect for solo developers trying ACIE.</p>
            <ul class="space-y-3 mb-8 text-xs text-slate-300">
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> 1 GitHub repository</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Blast radius detection</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Risk scoring</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> PR comments</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> 50 PRs per month</li>
              <li class="flex items-center gap-2.5 text-white/20"><i data-lucide="x" class="w-4 h-4 text-white/10"></i> Slack notifications</li>
              <li class="flex items-center gap-2.5 text-white/20"><i data-lucide="x" class="w-4 h-4 text-white/10"></i> Email reports</li>
              <li class="flex items-center gap-2.5 text-white/20"><i data-lucide="x" class="w-4 h-4 text-white/10"></i> Priority support</li>
            </ul>
          </div>
          <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="block text-center py-3.5 px-6 rounded-xl border border-white/10 hover:border-accent hover:bg-accent/10 transition-all font-semibold text-xs text-slate-300 hover:text-white uppercase tracking-wider">[ GET_STARTED ]</a>
        </div>

        <!-- Pro Tier Card (Featured) -->
        <div class="glass p-8 rounded-[32px] flex flex-col justify-between border border-accent/30 bg-accent/5 relative overflow-hidden group dashboard-card">
          <div class="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div class="absolute top-4 right-4 bg-accent/25 text-white text-[9px] font-bold px-3 py-1 rounded-full border border-accent/30 uppercase tracking-widest">MOST_POPULAR</div>
          <div>
            <div class="text-[10px] font-bold text-accent tracking-widest uppercase mb-4">// PRO_TIER</div>
            <div class="flex items-baseline mb-3">
              <span class="text-5xl font-black text-white">$29</span>
              <span class="text-xs text-slate-500 ml-1">/mo</span>
            </div>
            <p class="text-xs text-slate-300 mb-6 leading-relaxed">For teams that ship code every day.</p>
            <ul class="space-y-3 mb-8 text-xs text-slate-200">
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> 10 GitHub repositories</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Blast radius detection</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Risk scoring</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> PR comments</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Unlimited PRs</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Slack notifications</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Email reports</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Priority support</li>
            </ul>
          </div>
          <a href="mailto:sahilshaik4679@gmail.com" class="block text-center py-3.5 px-6 rounded-xl border border-accent bg-accent/25 hover:bg-accent/40 transition-all font-bold text-xs text-white uppercase tracking-wider">[ START_TRIAL ]</a>
        </div>

        <!-- Enterprise Tier Card -->
        <div class="glass p-8 rounded-[32px] flex flex-col justify-between border border-white/5 relative overflow-hidden group dashboard-card">
          <div class="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div>
            <div class="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">// ENTERPRISE_TIER</div>
            <div class="flex items-baseline mb-3">
              <span class="text-5xl font-black">$99</span>
              <span class="text-xs text-slate-500 ml-1">/mo</span>
            </div>
            <p class="text-xs text-slate-400 mb-6 leading-relaxed">For large engineering organizations.</p>
            <ul class="space-y-3 mb-8 text-xs text-slate-300">
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Unlimited repositories</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Blast radius detection</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Risk scoring</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> PR comments</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Unlimited PRs</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Slack and email alerts</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Custom integrations</li>
              <li class="flex items-center gap-2.5"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Dedicated support</li>
            </ul>
          </div>
          <a href="mailto:sahilshaik4679@gmail.com" class="block text-center py-3.5 px-6 rounded-xl border border-white/10 hover:border-accent hover:bg-accent/10 transition-all font-semibold text-xs text-slate-300 hover:text-white uppercase tracking-wider">[ CONTACT_US ]</a>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="glass p-8 rounded-[32px] border border-white/5 space-y-6">
        <h2 class="text-xl font-bold tracking-tight mb-8 text-center flex items-center justify-center gap-2"><i data-lucide="help-circle" class="text-accent w-5 h-5"></i> FAQ</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="glass-inner p-6 border border-white/5 bg-slate-950/20 rounded-2xl hover:border-white/10 transition-colors">
            <h3 class="font-bold text-xs text-cyan-400 mb-2 uppercase tracking-wide">HOW DOES ACIE WORK?</h3>
            <p class="text-[11px] text-slate-400 leading-relaxed">ACIE installs as a GitHub App. Every PR triggers a webhook that scans all changed files, maps their imports across the entire codebase, and posts a blast radius report as a PR comment.</p>
          </div>
          <div class="glass-inner p-6 border border-white/5 bg-slate-950/20 rounded-2xl hover:border-white/10 transition-colors">
            <h3 class="font-bold text-xs text-cyan-400 mb-2 uppercase tracking-wide">DO DEVELOPERS NEED TO CHANGE ANYTHING?</h3>
            <p class="text-[11px] text-slate-400 leading-relaxed">No. ACIE works completely in the background. Developers open PRs exactly as they always have.</p>
          </div>
          <div class="glass-inner p-6 border border-white/5 bg-slate-950/20 rounded-2xl hover:border-white/10 transition-colors">
            <h3 class="font-bold text-xs text-cyan-400 mb-2 uppercase tracking-wide">WHAT LANGUAGES ARE SUPPORTED?</h3>
            <p class="text-[11px] text-slate-400 leading-relaxed">Currently JavaScript and TypeScript. Python, Go, and Java support coming soon.</p>
          </div>
          <div class="glass-inner p-6 border border-white/5 bg-slate-950/20 rounded-2xl hover:border-white/10 transition-colors">
            <h3 class="font-bold text-xs text-cyan-400 mb-2 uppercase tracking-wide">CAN I CANCEL ANYTIME?</h3>
            <p class="text-[11px] text-slate-400 leading-relaxed">Yes. No contracts, no lock-in. Cancel your plan anytime.</p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    function animateValue(element, start, end, duration, formatFn) {
      if(!element) return;
      const startTime = performance.now();
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress);
        const current = start + ease * (end - start);
        element.innerHTML = formatFn ? formatFn(current) : Math.round(current);
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.innerHTML = formatFn ? formatFn(end) : end;
        }
      }
      requestAnimationFrame(update);
    }
    
    window.onload = () => {
      const integrityVal = document.getElementById('sys-integrity-val');
      if (integrityVal) {
        animateValue(integrityVal, 0, 98.4, 1500, (v) => v.toFixed(1) + "%");
      }
      const integrityBar = document.getElementById('sys-integrity-bar');
      if (integrityBar) {
        setTimeout(() => {
          integrityBar.style.width = '98.4%';
        }, 100);
      }
    };
    lucide.createIcons();
  </script>
</body>
</html>`);
}