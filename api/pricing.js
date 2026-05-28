export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>ACIE — Pricing</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; }
    .header { background: #161b22; border-bottom: 1px solid #30363d; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { color: #58a6ff; font-size: 24px; }
    .nav a { color: #58a6ff; text-decoration: none; margin-left: 20px; font-size: 14px; }
    .hero { text-align: center; padding: 60px 40px; }
    .hero h2 { font-size: 40px; font-weight: 800; color: #fff; margin-bottom: 16px; }
    .hero p { color: #8b949e; font-size: 18px; }
    .plans { display: flex; gap: 24px; max-width: 900px; margin: 40px auto; padding: 0 24px; justify-content: center; }
    .plan { background: #161b22; border: 1px solid #30363d; border-radius: 16px; padding: 32px; flex: 1; }
    .plan.popular { border-color: #58a6ff; position: relative; }
    .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #58a6ff; color: #000; font-size: 12px; font-weight: 700; padding: 4px 16px; border-radius: 20px; }
    .plan-name { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .plan-price { font-size: 40px; font-weight: 800; color: #58a6ff; margin-bottom: 4px; }
    .plan-price span { font-size: 16px; color: #8b949e; }
    .plan-desc { color: #8b949e; font-size: 14px; margin-bottom: 24px; }
    .plan-features { list-style: none; margin-bottom: 32px; }
    .plan-features li { color: #c9d1d9; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #21262d; }
    .plan-features li::before { content: "✅ "; }
    .btn { display: block; text-align: center; padding: 14px; border-radius: 8px; font-size: 16px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; width: 100%; }
    .btn-primary { background: #238636; color: #fff; }
    .btn-outline { background: transparent; color: #58a6ff; border: 1px solid #58a6ff; }
    .footer { text-align: center; padding: 40px; color: #484f58; font-size: 14px; border-top: 1px solid #21262d; margin-top: 60px; }
    .footer a { color: #58a6ff; text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ ACIE</h1>
    <div class="nav">
      <a href="/">Home</a>
      <a href="/dashboard">Dashboard</a>
      <a href="/history">PR History</a>
    </div>
  </div>
  <div class="hero">
    <h2>Simple, transparent pricing</h2>
    <p>Start free. Upgrade when you need more.</p>
  </div>
  <div class="plans">
    <div class="plan">
      <div class="plan-name">Free</div>
      <div class="plan-price">$0 <span>/month</span></div>
      <div class="plan-desc">Perfect for solo developers</div>
      <ul class="plan-features">
        <li>1 GitHub repository</li>
        <li>Blast radius detection</li>
        <li>Risk scoring</li>
        <li>PR comments</li>
        <li>50 PRs per month</li>
      </ul>
      <a href="https://github.com/Sahil-Hub-Cloud/ACIE" class="btn btn-outline">Get Started Free</a>
    </div>
    <div class="plan popular">
      <div class="popular-badge">MOST POPULAR</div>
      <div class="plan-name">Pro</div>
      <div class="plan-price">$29 <span>/month</span></div>
      <div class="plan-desc">For growing teams</div>
      <ul class="plan-features">
        <li>10 GitHub repositories</li>
        <li>Blast radius detection</li>
        <li>Risk scoring</li>
        <li>PR comments</li>
        <li>Slack notifications</li>
        <li>Unlimited PRs</li>
        <li>Priority support</li>
      </ul>
      <a href="mailto:sahilshaik4679@gmail.com" class="btn btn-primary">Start Pro Trial</a>
    </div>
    <div class="plan">
      <div class="plan-name">Enterprise</div>
      <div class="plan-price">$99 <span>/month</span></div>
      <div class="plan-desc">For large organizations</div>
      <ul class="plan-features">
        <li>Unlimited repositories</li>
        <li>Blast radius detection</li>
        <li>Risk scoring</li>
        <li>PR comments</li>
        <li>Slack & email notifications</li>
        <li>Unlimited PRs</li>
        <li>Custom integrations</li>
        <li>Dedicated support</li>
      </ul>
      <a href="mailto:sahilshaik4679@gmail.com" class="btn btn-outline">Contact Us</a>
    </div>
  </div>
  <div class="footer">
    <p>Built by <a href="https://github.com/Sahil-Hub-Cloud">Sahil-Hub-Cloud</a> · <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a> · <a href="/">Home</a></p>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}