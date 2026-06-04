export default async function handler(req,res){res.setHeader('Content-Type','text/html');return res.status(200).send(`<!DOCTYPE html><html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Inter:wght@400;500;600;700&display=swap');
  :root { --bg: #010309; --glass: rgba(255,255,255,0.02); --border: rgba(255,255,255,0.08); --cyan: #00d1ff; --purple: #7c3aed; --green: #10b981; --red: #ff0055; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background: var(--bg); color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  .aurora { position: fixed; inset: 0; background: radial-gradient(circle at 20% 20%, #4338ca10 0, transparent 40%), radial-gradient(circle at 80% 80%, #6d28d910 0, transparent 40%); filter: blur(100px); z-index: -1; }
  .glass { background: var(--glass); backdrop-filter: blur(24px); border: 1px solid var(--border); border-radius: 20px; transition: 0.4s; }
  .grad-txt { background: linear-gradient(135deg, #fff 40%, var(--cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .pulse-dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; display: inline-block; box-shadow: 0 0 10px var(--green); animation: pulse 2s infinite; margin-right: 8px; }
  @keyframes pulse { 0% { transform: scale(0.9); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(0.9); opacity: 1; } }

  .layout { display: flex; height: 100vh; }
  .side { width: 280px; background: #010409; border-right: 1px solid var(--border); padding: 40px 24px; }
  .nav-l { display: block; padding: 14px 18px; color: #8b949e; text-decoration: none; border-radius: 12px; margin-bottom: 5px; font-size: 14px; font-weight: 600; }
  .nav-l.active { background: rgba(112, 0, 255, 0.1); color: #fff; }
  .main { flex: 1; padding: 50px; overflow-y: auto; }
  .w-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
  .w-card { padding: 30px; text-align: center; }
  .w-val { font-size: 34px; font-weight: 800; margin-bottom: 4px; }
  .w-lbl { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; }
  .gauge { width: 140px; height: 140px; border-radius: 50%; border: 8px solid var(--glass); border-top-color: var(--purple); display: grid; place-items: center; margin: 0 auto 20px; font-size: 32px; font-weight: 900; }
</style></head><body>
  <div class="layout">
    <div class="side"><div style="font-weight:800; font-size:24px; margin-bottom:60px;">⚡ ACIE</div>
      <a href="#" class="nav-l active">Dashboard</a><a href="#" class="nav-l">Security</a><a href="#" class="nav-l">AI Assistant</a><a href="#" class="nav-l">Analytics</a><a href="/pricing" class="nav-l" style="margin-top:auto; color:var(--gold);">👑 Pro Plan</a>
    </div>
    <div class="main">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:48px;">
        <h1 style="font-size:32px; font-weight:900;">Intelligence Dashboard</h1>
        <div class="glass" style="padding:10px 24px; font-size:11px; font-weight:800; color:var(--cyan);"><span class="pulse-dot"></span>SYSTEM ONLINE</div>
      </div>
      <div class="w-grid">
        <div class="glass w-card"><div class="w-val" style="color:var(--green)">98%</div><div class="w-lbl">Security Score</div></div>
        <div class="glass w-card"><div class="w-val">96%</div><div class="w-lbl">Quality Score</div></div>
        <div class="glass w-card"><div class="w-val" style="color:var(--purple)">99.2%</div><div class="w-lbl">Deploy Success</div></div>
        <div class="glass w-card"><div class="w-val" style="color:var(--red)">12</div><div class="w-lbl">Vulnerabilities</div></div>
      </div>
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
        <div class="glass" style="padding:40px;"><h3>Live Analysis Stream</h3><div style="font-family:'Space Mono'; font-size:13px; color:#475569; margin-top:20px;">> Listening for inbound Pull Request webhooks...</div></div>
        <div class="glass" style="padding:40px; text-align:center;"><h3>Health Index</h3><div class="gauge">94%</div><div class="w-lbl">Overall Health</div></div>
      </div>
    </div>
  </div>
</body></html>`);}