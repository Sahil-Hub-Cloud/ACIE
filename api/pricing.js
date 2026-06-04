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

    .container { max-width: 1100px; margin: 120px auto; display: flex; gap: 30px; justify-content: center; align-items: center; }
    .card-p { width: 320px; padding: 60px 30px; text-align: center; }
    .featured { border-color: var(--neon-p); background: rgba(112, 0, 255, 0.05); transform: scale(1.1); }
    .price { font-size: 50px; font-weight: 800; margin: 20px 0; }
  </style></head><body><div class="glow-mesh"></div><div class="container"><div class="glass card-p"><h4>CITIZEN</h4><div class="price">$0</div><p style="color:#444; font-size:12px;">Solo Nodes</p></div><div class="glass card-p featured"><h4 style="color:var(--neon-p);">SYNDICATE</h4><div class="price">$29</div><p style="color:#a78bfa; font-size:12px;">Team Clusters</p></div><div class="glass card-p"><h4>CORP</h4><div class="price">$99</div><p style="color:#444; font-size:12px;">Global Grids</p></div></div></body></html>`);
}