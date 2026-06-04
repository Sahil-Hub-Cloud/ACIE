export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Inter:wght@400;500;600;700&display=swap');
  :root {
    --bg: #010409; --surface: rgba(13,17,23,0.8); --border: rgba(255,255,255,0.08);
    --cyan: #00d1ff; --purple: #7000ff; --green: #3fb950; --gold: #f2994a;
    --text-p: #ffffff; --text-s: #8b949e;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: var(--bg); color: var(--text-p); font-family: 'Inter', sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .glass { background: var(--surface); backdrop-filter: blur(24px); border: 1px solid var(--border); border-radius: 20px; transition: 0.3s cubic-bezier(0.2, 0, 0, 1); }
  .grad-text { background: linear-gradient(135deg, #fff 40%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .orb { position: fixed; border-radius: 50%; filter: blur(100px); z-index: -1; opacity: 0.4; pointer-events: none; }

  .container { max-width: 1100px; margin: 120px auto; text-align: center; }
  .p-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 60px; }
  .p-card { padding: 50px 30px; display: flex; flex-direction: column; }
  .p-card.pro { border-color: var(--purple); background: linear-gradient(to bottom, rgba(112,0,255,0.05), transparent); }
  .price { font-size: 54px; font-weight: 800; margin: 30px 0; }
  .features { list-style: none; text-align: left; margin-bottom: 40px; flex-grow: 1; }
  .features li { font-size: 14px; color: var(--text-s); margin-bottom: 15px; display: flex; align-items: center; gap: 12px; }
  .features li::before { content: "✔"; color: var(--cyan); font-weight: 900; }
  .btn { padding: 15px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; text-align: center; background: #fff; color: #000; }
</style></head><body>
  <div class="container">
    <h1 style="font-size:56px; margin-bottom:15px;">Elite Infrastructure Plans</h1>
    <p style="color:var(--text-s); font-size:18px;">Power your engineering team with surgical AI intelligence.</p>
    <div class="p-grid">
      <div class="glass p-card"><h3>Starter</h3><div class="price">$0</div><ul class="features"><li>1 Repository</li><li>Blast Radius Map</li><li>AI PR Comments</li></ul><a href="#" class="btn">Get Started</a></div>
      <div class="glass p-card pro"><h3>Professional</h3><div class="price">$29</div><ul class="features"><li>10 Repositories</li><li>Security Guard Scanning</li><li>Predictive Risk Score</li><li>Priority Support</li></ul><a href="#" class="btn" style="background:var(--purple); color:#fff;">Start Free Trial</a></div>
      <div class="glass p-card"><h3>Enterprise</h3><div class="price">Custom</div><ul class="features"><li>Unlimited Repos</li><li>Compliance Automation</li><li>AI CTO Dashboard</li><li>Dedicated SSO</li></ul><a href="#" class="btn">Contact Sales</a></div>
    </div>
  </div>
</body></html>`);}