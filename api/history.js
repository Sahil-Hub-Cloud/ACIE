import axios from 'axios';

const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;

export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>ACIE — PR History</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; }
    .header { background: #161b22; border-bottom: 1px solid #30363d; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; }
    .header h1 { color: #58a6ff; font-size: 24px; }
    .nav a { color: #58a6ff; text-decoration: none; margin-left: 20px; font-size: 14px; }
    .container { max-width: 900px; margin: 40px auto; padding: 0 24px; }
    .pr-card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .pr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .pr-title { color: #fff; font-size: 16px; font-weight: 600; }
    .pr-repo { color: #8b949e; font-size: 13px; margin-top: 4px; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .LOW { background: #1a3a1a; color: #3fb950; }
    .MEDIUM { background: #3a2a0a; color: #d29922; }
    .HIGH { background: #3a0a0a; color: #f85149; }
    .pr-details { display: flex; gap: 20px; font-size: 13px; color: #8b949e; }
    .pr-link { color: #58a6ff; text-decoration: none; font-size: 13px; }
    .empty { text-align: center; color: #8b949e; padding: 60px; }
    .loading { text-align: center; color: #8b949e; padding: 60px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ ACIE — PR History</h1>
    <div class="nav">
      <a href="/">Home</a>
      <a href="/dashboard">Dashboard</a>
    </div>
  </div>
  <div class="container">
    <div id="content" class="loading">Loading PR history...</div>
  </div>
  <script>
    fetch('/api/history-data')
      .then(r => r.json())
      .then(data => {
        const content = document.getElementById('content');
        if (!data.records || data.records.length === 0) {
          content.innerHTML = '<div class="empty">No PR history yet. Open a PR to see reports here!</div>';
          return;
        }
        content.innerHTML = data.records.reverse().map(pr => \`
          <div class="pr-card">
            <div class="pr-header">
              <div>
                <div class="pr-title">PR #\${pr.prNumber}: \${pr.repo}</div>
                <div class="pr-repo">\${pr.filesChanged} file(s) changed · \${pr.affectedCount} affected · \${new Date(pr.timestamp).toLocaleString()}</div>
              </div>
              <span class="badge \${pr.risk}">\${pr.risk}</span>
            </div>
            <div class="pr-details">
              <a href="\${pr.prUrl}" target="_blank" class="pr-link">View PR →</a>
            </div>
          </div>
        \`).join('');
      })
      .catch(() => {
        document.getElementById('content').innerHTML = '<div class="empty">No PR history yet.</div>';
      });
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}