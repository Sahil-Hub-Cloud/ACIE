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

    .layout { display: flex; height: 100vh; padding: 20px; gap: 20px; }
    .side { width: 280px; padding: 40px; }
    .main { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .stat { padding: 30px; text-align: center; }
    .num { font-size: 50px; font-weight: 800; color: var(--neon-b); letter-spacing: -2px; }
    .feed { grid-column: span 2; padding: 40px; font-family: 'Space Mono'; }
  </style></head><body><div class="glow-mesh"></div><div class="layout"><div class="glass side"><h2 class="neon-txt">CORE_SYS</h2><nav style="margin-top:50px; display:flex; flex-direction:column; gap:25px;"><a href="/" style="color:#fff; text-decoration:none; font-size:14px; font-weight:800;">OVERVIEW</a><a href="/pricing" style="color:#444; text-decoration:none; font-size:14px;">UPGRADES</a><a href="/history" style="color:#444; text-decoration:none; font-size:14px;">DATA_LOGS</a></nav></div><div class="main"><div class="glass stat"><div class="num">99.9%</div><div style="font-size:10px; color:#555;">SYSTEM_STABILITY</div></div><div class="glass stat"><div class="num">04ms</div><div style="font-size:10px; color:#555;">NEURAL_LATENCY</div></div><div class="glass feed"><h3 style="margin-bottom:20px; font-size:14px; color:var(--neon-p);">[ HOLOGRAPHIC_STREAM ]</h3><div style="font-size:13px; color:#0f0;">> PR_102: ARCHITECTURE_SECURE [PASS]<br>> PR_101: <span style="color:#f0f;">LEAK_DETECTED</span> [BLOCK_INITIALIZED]</div></div></div></div></body></html>`);
}