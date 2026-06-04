export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
  :root {
    --bg: #010409; --surface: rgba(13,17,23,0.7); --border: rgba(255,255,255,0.06);
    --cyan: #00d1ff; --purple: #7000ff; --green: #3fb950; --gold: #f2994a;
    --text-p: #ffffff; --text-s: #8b949e;
  }
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: var(--bg); color: var(--text-p); font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
  .glass { background: var(--surface); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 16px; }
  .grad-text { background: linear-gradient(135deg, #fff 40%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  .container { max-width: 1100px; margin: 100px auto; text-align: center; }
  .p-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 60px; }
  .p-card { padding: 50px 30px; position: relative; overflow: hidden; }
  .p-card.featured { border-color: var(--purple); background: linear-gradient(to bottom, rgba(112,0,255,0.05), transparent); }
  .price { font-size: 50px; font-weight: 800; margin: 20px 0; }
  .features { list-style: none; text-align: left; margin-bottom: 30px; }
  .features li { font-size: 14px; color: var(--text-s); margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
  .features li::before { content: "✔"; color: var(--cyan); }
</style></head><body>
  <div class="container">
    <h1 style="font-size:50px;">Billion-Dollar Infrastructure Plans</h1>
    <div class="p-grid">
      <div class="glass p-card"><h3>Starter</h3><div class="price">$0</div><ul class="features"><li>1 Repo</li><li>AI Code Review</li><li>Security Scanning</li></ul></div>
      <div class="glass p-card featured"><h3>Professional</h3><div class="price">$29</div><ul class="features"><li>10 Repos</li><li>Predictive Risk Engine</li><li>Slack/Email Alerts</li><li>AI DevOps Engineer</li></ul></div>
      <div class="glass p-card" style="border-color:var(--gold);"><h3>Enterprise</h3><div class="price">Custom</div><ul class="features"><li>Unlimited Repos</li><li>Compliance Automation</li><li>AI CTO Dashboard</li><li>Dedicated Support</li></ul></div>
    </div>
  </div>
</body></html>`);}