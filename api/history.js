import axios from 'axios';

const JSONBIN_ID = '6a212bb4da38895dfe8514a5';
const JSONBIN_KEY = '$2a$10$OLH.A4d17J6/.mDf9XtqwuT0jtdNQpLP74RT1aDXXnEUFB6ry0Q/u';

export default async function handler(req, res) {
  let records = [];
  try {
    const r = await axios.get(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY }
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

  const high = records.filter(r => r.risk === 'HIGH').length;
  const med = records.filter(r => r.risk === 'MEDIUM').length;
  const low = records.filter(r => r.risk === 'LOW').length;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ACIE — PR History</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#02040a;color:#fff;display:flex;min-height:100vh}
.sidebar{width:220px;background:#060810;border-right:1px solid rgba(255,255,255,0.06);padding:20px 12px;display:flex;flex-direction:column;flex-shrink:0}
.logo{display:flex;align-items:center;gap:9px;text-decoration:none;color:#fff;font-weight:800;font-size:16px;margin-bottom:32px;padding:0 8px}
.logo-icon{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#2563eb);display:grid;place-items:center;font-size:14px;flex-shrink:0;box-shadow:0 0 16px rgba(124,58,237,0.5)}
.nav-label{font-size:10px;font-weight:700;letter-spacing:1.2px;color:rgba(255,255,255,0.25);text-transform:uppercase;padding:0 10px;margin:16px 0 6px}
.nav-item{display:flex;align-items:center;gap:9px;padding:9px 10px;color:rgba(255,255,255,0.4);text-decoration:none;border-radius:8px;margin-bottom:1px;font-weight:500;font-size:13px;transition:all .15s}
.nav-item:hover{background:rgba(255,255,255,0.05);color:#fff}
.nav-item.active{background:rgba(124,58,237,0.12);color:#fff}
.main{flex:1;overflow-y:auto;padding:40px 48px}
.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}
.page-title{font-size:22px;font-weight:800;letter-spacing:-0.5px}
.page-sub{font-size:12px;color:rgba(255,255,255,0.35);margin-top:3px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
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
</head>
<body>
<div class="sidebar">
  <a href="/" class="logo"><div class="logo-icon">⚡</div>ACIE</a>
  <div class="nav-label">Main</div>
  <a href="/dashboard" class="nav-item">▦ Dashboard</a>
  <a href="/history" class="nav-item active">◷ PR History</a>
  <div class="nav-label">Account</div>
  <a href="/pricing" class="nav-item">◈ Plans</a>
  <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="nav-item">⌥ GitHub</a>
</div>
<div class="main">
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
  <div class="table-wrap">
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
</div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}