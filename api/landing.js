export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>ACIE — AI Change Impact Engine</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #080a10; color: #fff; overflow-x: hidden; }
    
    /* Animated Background Orbs */
    .bg-orb { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.4; z-index: -1; animation: float 8s ease-in-out infinite; }
    .orb-1 { width: 400px; height: 400px; background: #1e3a8a; top: -100px; left: -100px; }
    .orb-2 { width: 300px; height: 300px; background: #58a6ff; bottom: -50px; right: -50px; animation-delay: 2s; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(20px); } }

    /* Navbar */
    nav { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100; background: rgba(8,10,16,0.7); }
    .logo { font-weight: 800; font-size: 22px; text-decoration: none; color: #fff; display: flex; align-items: center; gap: 8px; }
    .logo span { background: linear-gradient(135deg, #58a6ff, #bc8cff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; margin-left: 24px; transition: color 0.2s; font-weight: 500; }
    .nav-links a:hover { color: #fff; }

    /* Hero Section */
    .hero { text-align: center; padding: 100px 24px 60px; max-width: 800px; margin: 0 auto; }
    .pill { display: inline-block; background: rgba(88,166,255,0.1); border: 1px solid rgba(88,166,255,0.2); color: #58a6ff; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 20px; margin-bottom: 24px; }
    .hero h1 { font-size: 64px; font-weight: 800; line-height: 1.1; margin-bottom: 24px; letter-spacing: -2px; }
    .gradient-text { background: linear-gradient(135deg, #fff 0%, #58a6ff 50%, #bc8cff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 20px; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 40px; }
    .buttons { display: flex; gap: 16px; justify-content: center; }
    .btn-primary { background: linear-gradient(135deg, #58a6ff, #bc8cff); color: #fff; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 0 20px rgba(88,166,255,0.3); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(88,166,255,0.5); }
    .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; text-decoration: none; transition: transform 0.2s, background 0.2s; }
    .btn-secondary:hover { transform: translateY(-2px); background: rgba(255,255,255,0.1); }

    /* Features Grid */
    .features { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
    .section-title { text-align: center; font-size: 40px; font-weight: 800; margin-bottom: 60px; letter-spacing: -1px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 32px; backdrop-filter: blur(10px); transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s; }
    .card:hover { transform: translateY(-5px); border-color: rgba(88,166,255,0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .card .icon { font-size: 40px; margin-bottom: 20px; }
    .card h3 { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #fff; }
    .card p { color: rgba(255,255,255,0.5); font-size: 15px; line-height: 1.6; }

    /* CTA */
    .cta { text-align: center; padding: 80px 24px; }
    .cta h2 { font-size: 48px; font-weight: 800; margin-bottom: 16px; letter-spacing: -1px; }
    .cta p { color: rgba(255,255,255,0.5); font-size: 18px; margin-bottom: 40px; }

    /* Footer */
    footer { text-align: center; padding: 40px; border-top: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); font-size: 14px; }
    footer a { color: rgba(255,255,255,0.5); text-decoration: none; transition: color 0.2s; }
    footer a:hover { color: #58a6ff; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 40px; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="bg-orb orb-1"></div>
  <div class="bg-orb orb-2"></div>
  
  <nav>
    <a href="/" class="logo">⚡ <span>ACIE</span></a>
    <div class="nav-links">
      <a href="/dashboard">Dashboard</a>
      <a href="/pricing">Pricing</a>
      <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
    </div>
  </nav>

  <div class="hero">
    <div class="pill">✨ Now in Public Beta</div>
    <h1>The Google Maps for <br><span class="gradient-text">your codebase</span></h1>
    <p>Stop guessing what your code changes will break. ACIE maps your dependencies, scores your risk, and blocks bad code before it's merged.</p>
    <div class="buttons">
      <a href="https://github.com/apps/acie-bot" class="btn-primary">Install ACIE Free →</a>
      <a href="/dashboard" class="btn-secondary">View Dashboard</a>
    </div>
  </div>

  <div class="features">
    <h2 class="section-title">Enterprise-grade <span class="gradient-text">Code Intelligence</span></h2>
    <div class="grid">
      <div class="card">
        <div class="icon">💥</div>
        <h3>Blast Radius Engine</h3>
        <p>Instantly maps every file affected by a PR across your entire repository. No more surprise breaks.</p>
      </div>
      <div class="card">
        <div class="icon">🎯</div>
        <h3>0-100% Health Score</h3>
        <p>Quantitative code quality scoring based on complexity, security, and style. Just like Lighthouse for code.</p>
      </div>
      <div class="card">
        <div class="icon">🛡️</div>
        <h3>Security Shield</h3>
        <p>Detects hardcoded secrets, API keys, and passwords. Automatically blocks merging until fixed.</p>
      </div>
      <div class="card">
        <div class="icon">🚦</div>
        <h3>Merge Gatekeeper</h3>
        <p>Turns the GitHub merge button red ❌ for high-risk PRs. Enforce quality without leaving GitHub.</p>
      </div>
      <div class="card">
        <div class="icon">🎨</div>
        <h3>Style Guardian</h3>
        <p>Flags mixed naming conventions (like snake_case in JS) so your codebase stays clean and uniform.</p>
      </div>
      <div class="card">
        <div class="icon">📱</div>
        <h3>Instant Alerts</h3>
        <p>Real-time Slack and Email notifications the second a risky PR is opened. Never miss a critical review.</p>
      </div>
    </div>
  </div>

  <div class="cta">
    <h2>Ready to ship <span class="gradient-text">safer code?</span></h2>
    <p>Install ACIE on your GitHub repo in under 60 seconds.</p>
    <a href="https://github.com/apps/acie-bot" class="btn-primary">Install ACIE Free →</a>
  </div>

  <footer>
    Built by <a href="https://github.com/Sahil-Hub-Cloud">Sahil-Hub-Cloud</a> · <a href="/dashboard">Dashboard</a> · <a href="/pricing">Pricing</a> · <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
  </footer>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}