export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Login — ACIE Intelligence</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #020617; font-family: 'Inter', sans-serif; color: #f8fafc; overflow: hidden; -webkit-font-smoothing: antialiased; }
    h1, h2, h3, .nav-text { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; }
    .grad-txt { background: linear-gradient(135deg, #fff 40%, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .input-field { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: white; transition: 0.2s; }
    .input-field:focus { border-color: #7c3aed; outline: none; background: rgba(255, 255, 255, 0.05); box-shadow: 0 0 20px rgba(124, 58, 237, 0.1); }
    .aurora { position: fixed; inset: 0; filter: blur(100px); z-index: -1; opacity: 0.4; pointer-events: none; }
    .orb { position: absolute; border-radius: 50%; animation: float 20s infinite alternate; }
    .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #7c3aed22, transparent 70%); top: -100px; right: -100px; }
    @keyframes float { from { transform: translate(0,0); } to { transform: translate(-50px, 50px); } }
  </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen p-6">
  <div class="aurora"><div class="orb orb-1"></div></div>

  <!-- Branding -->
  <a href="/" class="mb-10 flex items-center gap-2 text-2xl font-extrabold transition-transform hover:scale-105">
    <span class="text-indigo-500">⚡</span> ACIE
  </a>

  <!-- Login Card -->
  <div class="glass w-full max-w-md p-10 shadow-2xl border-t-white/10">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-black mb-2">Welcome Back</h2>
      <p class="text-slate-500 text-sm font-medium tracking-wide">Enter the engineering command center</p>
    </div>

    <form class="space-y-5" onsubmit="return false">
      <div>
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Identity / Email</label>
        <input type="email" class="input-field w-full px-5 py-4 rounded-xl text-sm" placeholder="name@enterprise.com">
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Access Key / Password</label>
        <input type="password" class="input-field w-full px-5 py-4 rounded-xl text-sm" placeholder="••••••••">
      </div>

      <div class="flex items-center justify-between px-1">
        <label class="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" class="w-4 h-4 rounded border-white/10 bg-white/5 accent-indigo-600">
          <span class="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">Stay logged in</span>
        </label>
        <a href="#" class="text-xs text-indigo-400 hover:text-indigo-300 font-bold">Forgot Key?</a>
      </div>

      <button class="w-full bg-white text-black font-black py-4 rounded-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all transform active:scale-[0.98] tracking-widest text-xs">
        AUTHORIZE SESSION
      </button>
    </form>

    <div class="relative my-8">
      <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/5"></div></div>
      <div class="relative flex justify-center text-[10px] uppercase"><span class="bg-[#020617] px-4 text-slate-600 font-black tracking-[0.3em]">External Provider</span></div>
    </div>

    <!-- GitHub Button -->
    <button class="w-full glass py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm hover:bg-white/5 transition-all border-white/10 group">
      <i data-lucide="github" class="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"></i>
      Continue with GitHub
    </button>

    <p class="mt-8 text-center text-slate-500 text-[11px] font-medium tracking-wide">
      No corporate access? <a href="/pricing" class="text-indigo-400 font-bold hover:underline">Provision account</a>
    </p>
  </div>

  <footer class="mt-12 text-slate-700 text-[9px] font-black uppercase tracking-[0.4em]">
    Secure Auth Layer // ACIE_OS_V3.2
  </footer>

  <script>lucide.createIcons();</script>
</body>
</html>`);
}