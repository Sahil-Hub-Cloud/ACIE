export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html><html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Space+Mono&display=swap');
  :root {
    --bg: #030014;
    --glass: rgba(255, 255, 255, 0.02);
    --border: rgba(255, 255, 255, 0.08);
    --neon-p: #7000ff;
    --neon-b: #00d1ff;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--bg); color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
  .glow-mesh {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(circle at 50% -20%, #1a0033 0%, transparent 60%),
                radial-gradient(circle at 0% 100%, #001a33 0%, transparent 40%);
    z-index: -1;
  }
  .glass {
    background: var(--glass); backdrop-filter: blur(20px);
    border: 1px solid var(--border); border-radius: 24px;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .glass:hover {
    border-color: var(--neon-p); transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(112, 0, 255, 0.15);
  }
  .neon-txt {
    background: linear-gradient(135deg, #fff 40%, var(--neon-b));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

    .hero { height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; }
    h1 { font-size: clamp(50px, 8vw, 110px); font-weight: 800; letter-spacing: -6px; line-height: 0.85; }
    .btn { padding: 20px 40px; background: var(--neon-p); border-radius: 14px; color: #fff; text-decoration: none; font-weight: 800; display: inline-block; box-shadow: 0 0 30px rgba(112, 0, 255, 0.4); transition: 0.3s; }
    .btn:hover { transform: scale(1.05); box-shadow: 0 0 50px rgba(112, 0, 255, 0.6); }
    .floating { width: 320px; padding: 25px; margin: 40px auto; animation: float 5s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
  </style></head><body><div class="glow-mesh"></div><div class="hero"><div><div style="font-size:12px; font-weight:800; letter-spacing:2px; color:var(--neon-b); margin-bottom:20px;">[ PROTOCOL_V.3 ]</div><h1 class="neon-txt">ACIE.IO<br>2050_CORE</h1><p style="color:#666; margin: 30px 0; font-size:18px;">Automated Architectural Code Intelligence.</p><a href="/dashboard" class="btn">INITIATE LINK</a><div class="glass floating"><div style="font-family:'Space Mono'; font-size:12px; color:var(--neon-b);">SCANNING_REPO...</div><div style="margin-top:15px; font-size:14px;">Impact: <span style="color:#ff0055">CRITICAL</span></div><div style="height:2px; background:#222; margin-top:10px;"><div style="width:75%; height:100%; background:var(--neon-p);"></div></div></div></div></div></body></html>`);
}