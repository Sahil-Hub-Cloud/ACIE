import axios from 'axios';

const JSONBIN_ID = process.env.JSONBIN_ID;
const JSONBIN_KEY = process.env.JSONBIN_KEY;

export default async function handler(req, res) {
  let records = [];
  try {
    if (!JSONBIN_ID || !JSONBIN_KEY) {
      throw new Error('JSONBin environment variables are not configured');
    }

    const r = await axios.get(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY },
      timeout: 5000
    });
    records = r.data.record.records || [];
  } catch (e) {
    console.error('JSONBin fetch error:', e.message);
  }

  const riskColor = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' };
  const riskIcon = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' };

  const rows = records.length === 0
    ? `<tr><td colspan="6" style="text-align:center;color:rgba(255,255,255,0.3);padding:40px">No PR history yet — open a Pull Request on your repo to see data here</td></tr>`
    : records.map(r => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);transition:background .15s" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background=''">
        <td style="padding:12px 16px;font-size:12px;color:rgba(255,255,255,0.4)">#${r.prNumber}</td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><a href="${r.prUrl}" target="_blank" style="color:#fff;text-decoration:none">${r.prTitle || 'Untitled PR'}</a></td>
        <td style="padding:12px 16px;font-size:12px;color:rgba(255,255,255,0.5)">@${r.prAuthor}</td>
        <td style="padding:12px 16px"><span style="background:${riskColor[r.risk]}18;color:${riskColor[r.risk]};padding:3px 10px;border-radius:6px;font-size:10px;font-weight:800">${r.risk}</span></td>
        <td style="padding:12px 16px;font-size:12px;color:rgba(255,255,255,0.5)">${r.affectedCount} files</td>
        <td style="padding:12px 16px;font-size:11px;color:rgba(255,255,255,0.3)">${new Date(r.timestamp).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</td>
      </tr>`).join('');

  const mobileCards = records.length === 0
    ? `<div style="text-align:center;color:rgba(255,255,255,0.3);padding:40px" class="glass rounded-2xl">No PR history yet — open a Pull Request on your repo to see data here</div>`
    : records.map(r => `
      <div class="glass p-5 rounded-2xl border border-white/5 space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-xs text-slate-500 font-mono">PR #${r.prNumber}</span>
          <span style="background:${riskColor[r.risk]}18;color:${riskColor[r.risk]};" class="px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider">${r.risk} RISK</span>
        </div>
        <div>
          <a href="${r.prUrl}" target="_blank" class="text-white hover:underline text-sm font-semibold block mb-1" style="text-decoration:none">${r.prTitle || 'Untitled PR'}</a>
          <span class="text-xs text-slate-400">by @${r.prAuthor}</span>
        </div>
        <div class="flex justify-between items-center text-[10px] text-slate-500 font-medium">
          <span>${r.affectedCount} affected files</span>
          <span>${new Date(r.timestamp).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
        </div>
      </div>`).join('');

  const high = records.filter(r => r.risk === 'HIGH').length;
  const med = records.filter(r => r.risk === 'MEDIUM').length;
  const low = records.filter(r => r.risk === 'LOW').length;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ACIE — PR History</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*:{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#02040a;color:#fff;display:flex;height:100vh;overflow:hidden}
:root { --accent: #7c3aed; }
.glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; }
.sidebar-link:hover { background: rgba(124, 58, 237, 0.1); color: #fff; }
.sidebar-link.active { background: rgba(124, 58, 237, 0.15); color: #fff; border-right: 2px solid var(--accent); }
.main{flex:1;display:flex;flex-direction:column;height:100vh;overflow:hidden;min-w-0}
.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}
.page-title{font-size:22px;font-weight:800;letter-spacing:-0.5px}
.page-sub{font-size:12px;color:rgba(255,255,255,0.35);margin-top:3px}
.stats{display:grid;grid-template-columns:repeat(2,1fr);lg:grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
@media (min-width: 1024px) {
  .stats { grid-template-columns: repeat(4, 1fr); }
}
.stat{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px 20px}
.stat-val{font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:4px}
.stat-label{font-size:11px;color:rgba(255,255,255,0.35);font-weight:600;text-transform:uppercase;letter-spacing:.8px}
.table-wrap{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden}
.table-header{padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center}
.table-title{font-size:14px;font-weight:700}
.refresh-btn{background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);color:#a78bfa;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;text-decoration:none}
table{width:100%;border-collapse:collapse}
th{padding:10px 16px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.8px;text-align:left;background:rgba(255,255,255,0.01)}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
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
      <a href="/history" class="sidebar-link active flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-white"><i data-lucide="history"></i> Logs</a>
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
<div class="main flex-1 flex flex-col h-full min-w-0 overflow-hidden">
  <!-- Mobile Header -->
  <header class="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#010409]/50 md:hidden shrink-0 w-full">
    <button onclick="openDrawer()" class="text-white focus:outline-none"><i data-lucide="menu" class="w-6 h-6"></i></button>
    <div class="text-lg font-bold flex items-center gap-2">⚡ ACIE</div>
    <div class="w-6"></div>
  </header>

  <!-- Page Content Scroll Area -->
  <div class="flex-1 overflow-y-auto p-6 md:p-12 space-y-8">
    <div class="topbar">
      <div>
        <div class="page-title">PR History</div>
        <div class="page-sub">Every pull request analyzed by ACIE</div>
      </div>
      <a href="/history" class="refresh-btn">↻ Refresh</a>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-val">${records.length}</div><div class="stat-label">Total PRs</div></div>
      <div class="stat"><div class="stat-val" style="color:#ef4444">${high}</div><div class="stat-label">High risk</div></div>
      <div class="stat"><div class="stat-val" style="color:#f59e0b">${med}</div><div class="stat-label">Medium risk</div></div>
      <div class="stat"><div class="stat-val" style="color:#10b981">${low}</div><div class="stat-label">Low risk</div></div>
    </div>
    
    <!-- Desktop Table (hidden on mobile, visible on md+) -->
    <div class="hidden md:block table-wrap">
      <div class="table-header">
        <div class="table-title">All pull requests</div>
      </div>
      <table>
        <thead><tr>
          <th>PR</th><th>Title</th><th>Author</th><th>Risk</th><th>Blast radius</th><th>Date</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <!-- Mobile Card List (visible on mobile, hidden on md+) -->
    <div class="block md:hidden space-y-4">
      ${mobileCards}
    </div>
  </div>
</div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
