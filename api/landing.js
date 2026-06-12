import { getSession } from '../src/auth/session.js';

export default async function handler(req, res) {
  const session = await getSession(req, res);
  const isLoggedIn = !!session.userId;
  
  res.setHeader('Content-Type','text/html');
  return res.status(200).send(`<!DOCTYPE html><html><head><title>ACIE — Google Maps for codebases.</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root { --bg: #020617; --surface: #0b0f1a; --accent: #7c3aed; --cyan: #06b6d4; }
    body { background-color: var(--bg); font-family: 'Plus Jakarta Sans', sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .sidebar-link:hover { background: rgba(124, 58, 237, 0.1); color: #fff; }
    .sidebar-link.active { background: rgba(124, 58, 237, 0.15); color: #fff; border-right: 2px solid var(--accent); }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
  </style>
</head>
<body class="flex flex-col items-center">
  <nav class="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl px-12 py-5 flex justify-between items-center">
    <div class="text-xl font-bold flex items-center gap-2">⚡ ACIE</div>
    <div class="flex gap-8 text-xs font-semibold text-slate-400 items-center">
      ${isLoggedIn 
        ? '<a href="/api/auth/logout" class="hover:text-white">Logout</a><a href="/dashboard" class="bg-white text-black px-5 py-2 rounded-lg">Open Dashboard</a>'
        : '<a href="/api/auth/login" class="hover:text-white">Login</a><a href="/api/auth/login" class="bg-white text-black px-5 py-2 rounded-lg">Get Started</a>'
      }
    </div>
  </nav>

  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <div class="mb-6 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">Intelligence Layer V3.2 Active</div>
    <h1 class="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-tight">Predict the Break.<br><span class="grad-txt">Control the Map.</span></h1>
    <p class="text-slate-400 text-lg max-w-2xl mb-12">"The All-in-One Google Maps for codebases." <br>Architectural impact, security hotspots, and blast radius mapped in real-time.</p>
    <div class="flex gap-4">
      ${isLoggedIn
        ? '<a href="/dashboard" class="px-10 py-4 bg-white text-black rounded-xl font-bold text-sm">Open Dashboard</a>'
        : '<a href="/api/auth/login" class="px-10 py-4 bg-white text-black rounded-xl font-bold text-sm">Launch Command Center</a>'
      }
    </div>
  </section>

  <!-- How It Works Step Timeline -->
  <section class="py-12 w-full max-w-6xl px-6">
    <div class="glass p-10 rounded-[32px] border border-white/5">
      <h2 class="text-2xl font-black mb-10 tracking-tight text-center uppercase text-slate-300">// How It Works</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Step 1 -->
        <div class="flex flex-col items-center text-center p-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 mb-4 text-lg">1</div>
          <h4 class="font-bold text-sm mb-2 text-white">Connect Repository</h4>
          <p class="text-slate-400 text-xs leading-relaxed max-w-[200px]">Install the ACIE GitHub App in seconds to link your repositories.</p>
        </div>
        <!-- Step 2 -->
        <div class="flex flex-col items-center text-center p-4">
          <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 mb-4 text-lg">2</div>
          <h4 class="font-bold text-sm mb-2 text-white">Analyze Architecture</h4>
          <p class="text-slate-400 text-xs leading-relaxed max-w-[200px]">Map downstream imports/exports and component module trees.</p>
        </div>
        <!-- Step 3 -->
        <div class="flex flex-col items-center text-center p-4">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 mb-4 text-lg">3</div>
          <h4 class="font-bold text-sm mb-2 text-white">Detect Risks & Dependencies</h4>
          <p class="text-slate-400 text-xs leading-relaxed max-w-[200px]">Scan entropy for leaked secrets and determine dependency risk.</p>
        </div>
        <!-- Step 4 -->
        <div class="flex flex-col items-center text-center p-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 mb-4 text-lg">4</div>
          <h4 class="font-bold text-sm mb-2 text-white">Fix Issues with Copilot</h4>
          <p class="text-slate-400 text-xs leading-relaxed max-w-[200px]">Resolve logic failures and circular dependencies automatically.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="py-20 w-full max-w-6xl grid grid-cols-3 gap-6 px-6">
    <div class="glass p-8 rounded-3xl"><h3>Blast Radius</h3><p class="text-slate-500 text-sm mt-3">Maps downstream impacts across entire module trees instantly.</p></div>
    <div class="glass p-8 rounded-3xl"><h3>Security Guard</h3><p class="text-slate-500 text-sm mt-3">Active entropy scanning for leaked secrets and vulnerability vectors.</p></div>
    <div class="glass p-8 rounded-3xl"><h3>AI Remediation</h3><p class="text-slate-500 text-sm mt-3">Automated fix PRs generated for logic failures and circular deps.</p></div>
  </section>
</body></html>`);}