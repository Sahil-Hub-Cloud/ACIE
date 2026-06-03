export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ACIE — AI Change Impact Engine</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #050507; color: #fff; overflow-x: hidden; }
    
    /* 3D Animated Aurora Background */
    .aurora-bg { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; overflow: hidden; opacity: 0.6; }
    .aurora { position: absolute; width: 150vw; height: 150vh; top: -50%; left: -50%; background: conic-gradient(from 0deg, #ff0080, #7928ca, #0070f3, #00dfd8, #ff0080); animation: rotateAurora 12s linear infinite; filter: blur(120px); }
    .aurora:nth-child(2) { animation-direction: reverse; opacity: 0.5; width: 100vw; height: 100vh; top: 0; left: 0; background: conic-gradient(from 90deg, #00dfd8, #0070f3, #7928ca, #ff0080, #00dfd8); }
    @keyframes rotateAurora { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* Navbar */
    nav { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100; background: rgba(5,5,7,0.6); }
    .logo { font-weight: 900; font-size: 24px; text-decoration: none; color: #fff; display: flex; align-items: center; gap: 10px; }
    .logo span { background: linear-gradient(135deg, #fff 0%, #7928ca 50%, #ff0080 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-size: 200% auto; animation: shimmerText 3s linear infinite; }
    @keyframes shimmerText { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
    .nav-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; margin-left: 24px; font-weight: 500; transition: color 0.3s; }
    .nav-links a:hover { color: #fff; }

    /* Hero */
    .hero { text-align: center; padding: 120px 24px 80px; max-width: 900px; margin: 0 auto; position: relative; z-index: 2; }
    .pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 13px; font-weight: 600; padding: 8px 20px; border-radius: 100px; margin-bottom: 32px; box-shadow: 0 0 20px rgba(121,40,202,0.2); }
    .dot { width: 8px; height: 8px; background: #00dfd8; border-radius: 50%; animation: pulseDot 2s infinite; }
    @keyframes pulseDot { 0% { box-shadow: 0 0 0 0 rgba(0,223,216,0.7); } 70% { box-shadow: 0 0 0 10px rgba(0,223,216,0); } 100% { box-shadow: 0 0 0 0 rgba(0,223,216,0); } }
    .hero h1 { font-size: 80px; font-weight: 900; line-height: 0.95; margin-bottom: 28px; letter-spacing: -3px; text-transform: uppercase; }
    .holographic-text { background: linear-gradient(90deg, #fff, #7928ca, #ff0080, #0070f3, #fff); background-size: 400% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmerText 6s linear infinite; }
    .hero p { font-size: 20px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 48px; max-width: 600px; margin-left: auto; margin-right: auto; }
    .buttons { display: flex; gap: 16px; justify-content: center; }
    .btn-primary { background: linear-gradient(135deg, #7928ca, #ff0080); color: #fff; padding: 18px 36px; border-radius: 14px; font-size: 16px; font-weight: 700; text-decoration: none; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 10px 40px rgba(121,40,202,0.4); border: 1px solid rgba(255,255,255,0.1); }
    .btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 20px 60px rgba(121,40,202,0.6); }
    .btn-secondary { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 18px 36px; border-radius: 14px; font-size: 16px; font-weight: 700; text-decoration: none; transition: transform 0.3s, background 0.3s; backdrop-filter: blur(10px); }
    .btn-secondary:hover { transform: translateY(-3px); background: rgba(255,255,255,0.08); }

    /* Features 3D Grid */
    .features { padding: 80px 24px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 2; }
    .section-title { text-align: center; font-size: 48px; font-weight: 900; margin-bottom: 60px; letter-spacing: -2px; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; perspective: 1000px; }
    .card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 32px; backdrop-filter: blur(20px); transition: transform 0.5s cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow 0.5s ease, border-color 0.5s ease; transform-style: preserve-3d; box-shadow: 0 0 0 1px rgba(255,255,255,0.05); position: relative; overflow: hidden; }
    .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(121,40,202,0.15), transparent 60%); opacity: 0; transition: opacity 0.3s; z-index: -1; }
    .card:hover { transform: translateY(-10px) rotateX(10deg) rotateY(-10deg) scale(1.02); border-color: rgba(121,40,202,0.4); box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 30px rgba(121,40,202,0.2); }
    .card:hover::before { opacity: 1; }
    .card .icon { font-size: 48px; margin-bottom: 24px; text-shadow: 0 0 20px rgba(121,40,202,0.5); }
    .card h3 { font-size: 22px; font-weight: 700; margin-bottom: 14px; color: #fff; transform: translateZ(20px); }
    .card p { color: rgba(255,255,255,0.5); font-size: 15px; line-height: 1.7; transform: translateZ(10px); }

    /* CTA */
    .cta { text-align: center; padding: 100px 24px; position: relative; z-index: 2; }
    .cta h2 { font-size: 64px; font-weight: 900; margin-bottom: 20px; letter-spacing: -2px; text-transform: uppercase; }
    .cta p { color: rgba(255,255,255,0.5); font-size: 20px; margin-bottom: 48px; }

    /* Footer */
    footer { text-align: center; padding: 40px; border-top: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); font-size: 14px; position: relative; z-index: 2; }
    footer a { color: rgba(255,255,255,0.5); text-decoration: none; transition: color 0.3s; }
    footer a:hover { color: #ff0080; }

    /* Mouse tracking script for 3D tilt */
    .tilt-card { transform-style: preserve-3d; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 48px; letter-spacing: -1px; }
      .grid { grid-template-columns: 1fr; }
      .section-title { font-size: 32px; }
      .cta h2 { font-size: 40px; }
    }
  </style>
</head>
<body>
  <div class="aurora-bg">
    <div class="aurora"></div>
    <div class="aurora"></div>
  </div>

  <nav>
    <a href="/" class="logo">⚡ <span>ACIE</span></a>
    <div class="nav-links">
      <a href="/dashboard">Dashboard</a>
      <a href="/pricing">Pricing</a>
      <a href="https://github.com/Sahil-Hub-Cloud/ACIE">GitHub</a>
    </div>
  </nav>

  <div class="hero">
    <div class="pill"><span class="dot"></span> Public Beta Live</div>
    <h1>The Google Maps for <br><span class="holographic-text">your codebase</span></h1>
    <p>Stop guessing what your code changes will break. ACIE maps your dependencies, scores your risk, and blocks bad code before it's merged.</p>
    <div class="buttons">
      <a href="https://github.com/apps/acie-bot" class="btn-primary">Install ACIE Free →</a>
      <a href="/dashboard" class="btn-secondary">View Dashboard</a>
    </div>
  </div>

  <div class="features">
    <h2 class="section-title">3D Code <span class="holographic-text">Intelligence</span></h2>
    <div class="grid" id="card-grid">
      <div class="card tilt-card">
        <div class="icon">💥</div>
        <h3>Blast Radius Engine</h3>
        <p>Instantly maps every file affected by a PR across your entire repository. No more surprise breaks.</p>
      </div>
      <div class="card tilt-card">
        <div class="icon">🎯</div>
        <h3>0-100% Health Score</h3>
        <p>Quantitative code quality scoring based on complexity, security, and style. Just like Lighthouse for code.</p>
      </div>
      <div class="card tilt-card">
        <div class="icon">🛡️</div>
        <h3>Security Shield</h3>
        <p>Detects hardcoded secrets, API keys, and passwords. Automatically blocks merging until fixed.</p>
      </div>
      <div class="card tilt-card">
        <div class="icon">🚦</div>
        <h3>Merge Gatekeeper</h3>
        <p>Turns the GitHub merge button red ❌ for high-risk PRs. Enforce quality without leaving GitHub.</p>
      </div>
      <div class="card tilt-card">
        <div class="icon">🎨</div>
        <h3>Style Guardian</h3>
        <p>Flags mixed naming conventions (like snake_case in JS) so your codebase stays clean and uniform.</p>
      </div>
      <div class="card tilt-card">
        <div class="icon">📱</div>
        <h3>Instant Alerts</h3>
        <p>Real-time Slack and Email notifications the second a risky PR is opened. Never miss a critical review.</p>
      </div>
    </div>
  </div>

  <div class="cta">
    <h2>Ready to ship <span class="holographic-text">safer code?</span></h2>
    <p>Install ACIE on your GitHub repo in under 60 seconds.</p>
    <a href="https://github.com/apps/acie-bot" class="btn-primary">Install ACIE Free →</a>
  </div>

  <footer>
    Built by <a href="https://github.com/Sahil-Hub-Cloud">Sahil-Hub-Cloud</a> · <a href="/dashboard">Dashboard</a> · <a href="/pricing">Pricing</a>
  </footer>

  <script>
    // 3D Tilt Effect on Mouse Move
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        card.style.transform = \`translateY(-10px) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg) scale(1.02)\`;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateX(0) rotateY(0) scale(1)';
      });
    });
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}