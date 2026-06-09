export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html><html><head>
  <meta charset="UTF-8"><title>ACIE Copilot — Intelligence</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root { --accent: #7c3aed; }
    body { background: #010409; color: #f8fafc; font-family: sans-serif; overflow: hidden; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 40px; }
    .sidebar-link:hover { background: rgba(124, 58, 237, 0.1); color: #fff; }
    .sidebar-link.active { background: rgba(124, 58, 237, 0.15); color: #fff; border-right: 2px solid var(--accent); }
  </style>
  <script>
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

    async function submitChip(text) {
      document.getElementById('chat-input').value = text;
      await askAI();
    }

    async function askAI() {
      const input = document.getElementById('chat-input');
      const box = document.getElementById('chat-box');
      if(!input.value) return;

      const userQuery = input.value;
      box.innerHTML += '<div class="flex justify-end"><div class="bg-indigo-600 px-4 py-2 rounded-2xl text-sm max-w-md">' + userQuery.replace(/</g, "&lt;") + '</div></div>';
      input.value = "";

      const aiMsg = document.createElement('div');
      aiMsg.className = "flex gap-4";
      aiMsg.innerHTML = '<div class="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold text-xs">A</div><div id="thinking" class="max-w-xl text-sm text-cyan-400 font-mono italic">> Initializing query...</div>';
      box.appendChild(aiMsg);
      box.scrollTop = box.scrollHeight;

      try {
        const r = await fetch('/api/copilot-brain?q=' + encodeURIComponent(userQuery));
        const data = await r.json();
        
        let i = 0;
        const itv = setInterval(() => {
          if(i < data.steps.length) {
            document.getElementById('thinking').innerText = "> " + data.steps[i];
            i++;
          } else {
            clearInterval(itv);
            const thinkNode = document.getElementById('thinking');
            thinkNode.id = ""; 
            thinkNode.classList.remove('text-cyan-400', 'font-mono', 'italic');
            thinkNode.innerHTML = data.finalAnswer;
          }
          box.scrollTop = box.scrollHeight;
        }, 600);
      } catch (e) {
        document.getElementById('thinking').innerText = "!! Communication Error with ACIE_CORE";
      }
    }

    function openDrawer() {
      document.getElementById('sidebar').classList.remove('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.add('opacity-100', 'pointer-events-auto');
    }
    function closeDrawer() {
      document.getElementById('sidebar').classList.add('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.remove('opacity-100', 'pointer-events-auto');
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
  </script>
</head>
<body class="flex h-screen bg-[#010409] text-[#f8fafc]">
  <!-- Sidebar Backdrop Overlay -->
  <div id="sidebar-overlay" onclick="closeDrawer()" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300 md:hidden"></div>

  <!-- Sidebar -->
  <aside id="sidebar" class="fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#010409] border-r border-white/5 flex flex-col h-full transition-transform duration-300 transform -translate-x-full md:translate-x-0 shrink-0">
    <button onclick="closeDrawer()" class="absolute top-6 right-6 text-slate-500 hover:text-white md:hidden focus:outline-none"><i data-lucide="x" class="w-6 h-6"></i></button>
    <div class="p-8 text-xl font-bold flex items-center gap-2">⚡ ACIE</div>
    <nav class="flex-1 px-4 space-y-1">
      <a href="/dashboard" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="layout-grid"></i> Overview</a>
      <a href="/copilot" class="sidebar-link active flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-white"><i data-lucide="bot"></i> AI Copilot</a>
      <a href="/war-room" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="map"></i> War Room</a>
      <a href="/history" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="history"></i> Logs</a>
      <a href="/executive" class="sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-500 hover:text-white"><i data-lucide="trending-up"></i> ROI</a>
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

  <!-- Main Content -->
  <main class="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#010409]">
    <!-- Mobile Header -->
    <header class="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#010409]/50 md:hidden shrink-0 w-full">
      <button onclick="openDrawer()" class="text-white focus:outline-none"><i data-lucide="menu" class="w-6 h-6"></i></button>
      <div class="text-lg font-bold flex items-center gap-2">⚡ ACIE</div>
      <div class="w-6"></div>
    </header>

    <div class="flex-1 glass p-4 md:p-10 m-4 md:m-10 flex flex-col shadow-2xl overflow-hidden">
      <div id="chat-box" class="flex-1 overflow-y-auto space-y-6 mb-6 pr-4">
        <div class="flex gap-4">
          <div class="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold text-xs">A</div>
          <div class="max-w-xl text-sm text-slate-300 bg-white/5 p-5 rounded-2xl border border-white/5">
            Neural link established. I have access to your repository's telemetry records. How can I assist you today?
          </div>
        </div>
      </div>

      <!-- Suggestion Chips -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button onclick="submitChip('Why Did Deployment Fail?')" class="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/50 rounded-full transition-all text-slate-300 hover:text-white cursor-pointer select-none">
          Why Did Deployment Fail?
        </button>
        <button onclick="submitChip('Explain Blast Radius')" class="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/50 rounded-full transition-all text-slate-300 hover:text-white cursor-pointer select-none">
          Explain Blast Radius
        </button>
        <button onclick="submitChip('Show Impacted Files')" class="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/50 rounded-full transition-all text-slate-300 hover:text-white cursor-pointer select-none">
          Show Impacted Files
        </button>
        <button onclick="submitChip('Summarize Risk')" class="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/50 rounded-full transition-all text-slate-300 hover:text-white cursor-pointer select-none">
          Summarize Risk
        </button>
        <button onclick="submitChip('Generate Fix Plan')" class="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/50 rounded-full transition-all text-slate-300 hover:text-white cursor-pointer select-none">
          Generate Fix Plan
        </button>
      </div>

      <div class="relative">
        <input id="chat-input" onkeypress="if(event.key==='Enter') askAI()" class="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm focus:outline-none focus:border-indigo-500 transition-all pr-20" placeholder="Ask intelligence...">
        <button onclick="askAI()" class="absolute right-4 top-4 bg-white text-black p-3 rounded-2xl hover:scale-105 transition-all"><i data-lucide="send" class="w-4 h-4"></i></button>
      </div>
    </div>
  </main>
  <script>lucide.createIcons();</script>
</body></html>`);
}