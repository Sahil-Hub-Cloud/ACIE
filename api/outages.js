export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>ACIE — Outage Prediction</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #010409; color: #f8fafc; font-family: sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .danger-bar { height: 4px; background: #333; border-radius: 2px; overflow: hidden; }
    .fill { height: 100%; transition: width 2s; }
  </style>
</head>
<body class="p-12 max-w-5xl mx-auto">
  <h1 class="text-4xl font-black mb-10 tracking-tight">Predictive Outage Engine</h1>
  <div class="grid gap-6">
    <div class="glass p-8 rounded-3xl flex items-center justify-between">
      <div class="w-1/3"><h3 class="font-bold">Payment Gateway</h3><p class="text-xs text-gray-500">Predicted instability in next 4 hours</p></div>
      <div class="flex-1 px-10"><div class="danger-bar"><div class="fill bg-rose-600" style="width: 87%"></div></div></div>
      <div class="text-2xl font-black text-rose-500">87% <span class="text-[10px] uppercase">Prob</span></div>
    </div>
    <div class="glass p-8 rounded-3xl flex items-center justify-between">
      <div class="w-1/3"><h3 class="font-bold">Auth Service</h3><p class="text-xs text-gray-500">Session layer congestion detected</p></div>
      <div class="flex-1 px-10"><div class="danger-bar"><div class="fill bg-orange-500" style="width: 42%"></div></div></div>
      <div class="text-2xl font-black text-orange-500">42% <span class="text-[10px] uppercase">Prob</span></div>
    </div>
  </div>
  <div class="mt-20 p-8 glass rounded-[32px] text-center border-indigo-500/20">
    <div class="text-xs font-bold text-indigo-400 mb-2 uppercase">AI Automated Mitigation</div>
    <p class="text-sm">Scaling secondary clusters in <b>us-east-1</b> automatically to prevent downtime.</p>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
