export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ACIE — Executive Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #020617; color: #f8fafc; font-family: sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .grad-txt { background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  </style>
</head>
<body class="p-12 max-w-6xl mx-auto">
  <nav class="flex justify-between items-center mb-20">
    <div class="text-2xl font-black">⚡ ACIE <span class="text-xs ml-2 text-gray-500 font-bold uppercase tracking-widest">Executive</span></div>
    <a href="/dashboard" class="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">Mission Control</a>
  </nav>

  <header class="mb-16">
    <h1 class="text-5xl font-black tracking-tighter mb-4">Strategic Engineering ROI</h1>
    <p class="text-gray-500 text-lg">Measurable impact of ACIE Intelligence across your organization.</p>
  </header>

  <div class="grid grid-cols-3 gap-6 mb-6">
    <div class="glass p-10 rounded-[32px] border-t-2 border-yellow-500/20">
       <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Estimated Cost Savings</div>
       <div class="text-5xl font-black grad-txt">$142,500</div>
       <p class="text-[10px] text-gray-600 mt-4 font-bold uppercase">BASED ON 2,480 DEV HOURS SAVED</p>
    </div>
    <div class="glass p-10 rounded-[32px]">
       <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Incidents Prevented</div>
       <div class="text-5xl font-black text-white">42</div>
       <p class="text-[10px] text-emerald-500 mt-4 font-bold uppercase">Zero P1 Outages since install</p>
    </div>
    <div class="glass p-10 rounded-[32px]">
       <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Release Velocity</div>
       <div class="text-5xl font-black text-cyan-400">+24%</div>
       <p class="text-[10px] text-gray-600 mt-4 font-bold uppercase">Automated PR reviews active</p>
    </div>
  </div>

  <div class="glass p-12 rounded-[40px]">
    <h3 class="text-xl font-bold mb-8">Technical Debt Reduction Trend</h3>
    <div class="h-40 w-full flex items-end gap-3">
       <div class="flex-1 bg-white/5 rounded-lg h-[90%]"></div>
       <div class="flex-1 bg-white/5 rounded-lg h-[75%]"></div>
       <div class="flex-1 bg-white/5 rounded-lg h-[60%]"></div>
       <div class="flex-1 bg-indigo-500 rounded-lg h-[40%] animate-pulse"></div>
       <div class="flex-1 bg-indigo-600 rounded-lg h-[25%]"></div>
    </div>
    <div class="flex justify-between text-[10px] font-bold text-gray-600 mt-4 uppercase">
       <span>January</span><span>May (ACIE INSTALL)</span><span>June (Current)</span>
    </div>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
