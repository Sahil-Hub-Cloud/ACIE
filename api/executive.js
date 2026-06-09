export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html><html><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>ACIE — Engineering ROI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root { --accent: #7c3aed; }
    body { background: #020617; color: #f8fafc; font-family: sans-serif; display: flex; height: 100vh; overflow: hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 32px; }
    .grad-txt { background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .sidebar-link:hover { background: rgba(124, 58, 237, 0.1); color: #fff; }
    .sidebar-link.active { background: rgba(124, 58, 237, 0.15); color: #fff; border-right: 2px solid var(--accent); }
  </style>
  <script>
    function openDrawer() {
      document.getElementById('sidebar').classList.remove('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.add('opacity-100', 'pointer-events-auto');
    }
    function closeDrawer() {
      document.getElementById('sidebar').classList.add('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.remove('opacity-100', 'pointer-events-auto');
    }

    function animateValue(element, start, end, duration, formatFn) {
      if(!element) return;
      const startTime = performance.now();
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress); // Ease out quad
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

    async function loadROI() {
      try {
        const r = await fetch("/api/telemetry?view=summary");
        const d = await r.json();
        const count = d.count || 0;
        
        document.getElementById('money-saved').innerText = "$" + (count * 5000).toLocaleString();
        document.getElementById('hours-saved').innerText = (count * 40).toLocaleString() + " hrs";
        document.getElementById('pr-count').innerText = count + " Production PRs";
      } catch (e) {
        console.error("Telemetry fetch failed", e);
      }
    }

    window.onload = async () => {
      await loadROI();
      
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
      lucide.createIcons();
    };
  </script>
</head>
<body>
  <!-- Sidebar Backdrop Overlay -->
  <div id="sidebar-overlay" onclick="closeDrawer()" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300 md:hidden"></div>

  <!-- Sidebar -->
  <aside id="sidebar" class="fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#010409] border-r border-white/5 flex flex-col h-full transition-transform duration-300 transform -translate-x-full md:translate-x-0 shrink-0">
    <button onclick="closeDrawer()" class="absolute top-6 right-6 text-slate-500 hover:text-white md:hidden focus:outline-none"><i data-lucide="x" class="w-6 h-6"></i></button>
    <div class="p-8 text-xl font-bold flex items-center gap-2">⚡ ACIE</div>
    <nav class="flex-1 px-4 space-y-1">
      <a href="/dashboard" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="layout-grid"></i> Overview</a>
      <a href="/copilot" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="bot"></i> AI Copilot</a>
      <a href="/war-room" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="map"></i> War Room</a>
      <a href="/history" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="history"></i> Logs</a>
      <a href="/executive" class="sidebar-link active flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-white"><i data-lucide="trending-up"></i> ROI</a>
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
  <main class="flex-1 flex flex-col h-full min-w-0 overflow-hidden text-center">
    <!-- Mobile Header -->
    <header class="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#010409]/50 md:hidden shrink-0 w-full text-left">
      <button onclick="openDrawer()" class="text-white focus:outline-none"><i data-lucide="menu" class="w-6 h-6"></i></button>
      <div class="text-lg font-bold flex items-center gap-2">⚡ ACIE</div>
      <div class="w-6"></div>
    </header>

    <!-- Page Content Scroll Area -->
    <div class="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col justify-center items-center w-full max-w-6xl mx-auto">
      <h1 class="text-5xl md:text-6xl font-black tracking-tighter mb-4">Engineering ROI</h1>
      <p id="pr-count" class="text-gray-500 text-lg md:text-xl mb-12 md:mb-20 italic">Loading telemetry...</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div class="glass p-12"><div id="money-saved" class="text-5xl font-black grad-txt">$0</div><div class="text-[10px] font-bold text-gray-600 mt-4 uppercase">Estimated Cost Savings</div></div>
        <div class="glass p-12"><div id="hours-saved" class="text-5xl font-black text-white">0 hrs</div><div class="text-[10px] font-bold text-gray-600 mt-4 uppercase">Time Reclaimed</div></div>
        <div class="glass p-12"><div class="text-5xl font-black text-cyan-400">+24%</div><div class="text-[10px] font-bold text-gray-600 mt-4 uppercase">Velocity Boost</div></div>
      </div>
    </div>
  </main>
</body></html>`);
}
