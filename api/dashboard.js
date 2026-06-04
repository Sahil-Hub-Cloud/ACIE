export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>ACIE Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: sans-serif; background: #0d1117; color: #c9d1d9; min-height: 100vh; }
    .header { background: #161b22; border-bottom: 1px solid #30363d; padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; }
    .header h1 { color: #58a6ff; font-size: 24px; }
    .container { max-width: 900px; margin: 40px auto; padding: 0 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; }
    .card h2 { font-size: 16px; color: #58a6ff; margin-bottom: 12px; }
    .card p { color: #8b949e; font-size: 14px; line-height: 1.6; }
    .footer { text-align: center; color: #484f58; font-size: 13px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ ACIE Dashboard</h1>
    <a href="/" style="color:#58a6ff; text-decoration:none;">Home</a>
  </div>
  <div class="container">
    <div class="grid">
      <div class="card">
        <h2>📡 Status: Live</h2>
        <p>ACIE is monitoring all pull requests. Every PR gets an automatic blast radius report.</p>
      </div>
      <div class="card">
        <h2>🔍 Intelligence</h2>
        <p>The engine is processing imports, exports, and security risks in real-time.</p>
      </div>
    </div>
  </div>
  <div class="footer"><p>Built by Sahil-Hub-Cloud</p></div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}