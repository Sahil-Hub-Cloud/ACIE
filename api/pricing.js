export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  :root {
    --bg: #020617; --sidebar: #010409; --border: rgba(255,255,255,0.08);
    --purple: #7c3aed; --blue: #3b82f6; --text: #f8fafc; --sub: #94a3b8;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
  .glass { background: rgba(255,255,255,0.02); backdrop-filter: blur(12px); border: 1px solid var(--border); border-radius: 16px; transition: 0.3s; }
  .btn { display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: 0.2s; cursor: pointer; }
  .btn-p { background: var(--purple); color: #fff; border: none; }
  .btn-p:hover { background: #6d28d9; transform: translateY(-1px); }
  .btn-s { background: transparent; color: #fff; border: 1px solid var(--border); }
  .btn-s:hover { background: rgba(255,255,255,0.05); }

  .container { max-width: 1100px; margin: 100px auto; padding: 0 24px; }
  .p-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 60px; }
  .p-card { padding: 48px 32px; display: flex; flex-direction: column; }
  .p-card.pro { border-color: var(--purple); background: linear-gradient(to bottom, rgba(124,58,237,0.05), transparent); }
  .p-name { font-size: 14px; font-weight: 700; color: var(--purple); text-transform: uppercase; letter-spacing: 1px; }
  .p-price { font-size: 48px; font-weight: 800; margin: 24px 0; }
  .p-price span { font-size: 16px; color: var(--sub); font-weight: 400; }
  .p-list { list-style: none; margin-bottom: 40px; flex: 1; }
  .p-list li { color: var(--sub); font-size: 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
  .p-list li::before { content: "✓"; color: var(--purple); font-weight: 800; }
</style></head><body>
  <div class="container" style="text-align:center;">
    <h1 style="font-size:48px;">Plans for every team</h1>
    <p style="color:var(--sub); font-size:18px; margin-top:16px;">Scale your code security with surgical precision.</p>
    <div class="p-grid">
      <div class="glass p-card">
        <div class="p-name">Starter</div>
        <div class="p-price">$0<span>/mo</span></div>
        <ul class="p-list">
          <li>1 GitHub Repository</li>
          <li>Blast Radius Analysis</li>
          <li>Basic PR Comments</li>
          <li>Community Support</li>
        </ul>
        <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn btn-s">Get Started</a>
      </div>
      <div class="glass p-card pro">
        <div class="p-name">Professional</div>
        <div class="p-price">$29<span>/mo</span></div>
        <ul class="p-list">
          <li>Up to 10 Repositories</li>
          <li>Full Security Guard Scanning</li>
          <li>Detailed Health Scoring</li>
          <li>Slack & Email Notifications</li>
          <li>Priority 24/7 Support</li>
        </ul>
        <a href="mailto:sahilshaik4679@gmail.com" class="btn btn-p">Start Free Trial</a>
      </div>
      <div class="glass p-card">
        <div class="p-name">Enterprise</div>
        <div class="p-price">$99<span>/mo</span></div>
        <ul class="p-list">
          <li>Unlimited Repositories</li>
          <li>Custom Security Rules</li>
          <li>SOC2 & GDPR Compliance</li>
          <li>Dedicated Account Manager</li>
          <li>Single Sign-On (SSO)</li>
        </ul>
        <a href="mailto:sahilshaik4679@gmail.com" class="btn btn-s">Talk to Sales</a>
      </div>
    </div>
  </div>
</body></html>`);}