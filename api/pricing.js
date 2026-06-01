export default async function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ACIE — Pricing</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Inter',sans-serif;background:#080c14;color:#c9d1d9;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .nav{background:#080c14cc;backdrop-filter:blur(12px);border-bottom:1px solid #21262d;padding:16px 40px;display:flex;justify-content:space-between;align-items:center;}
    .nav-logo{color:#fff;font-weight:700;font-size:18px;text-decoration:none;}
    .nav-logo span{color:#58a6ff;}
    .nav-links a{color:#8b949e;text-decoration:none;font-size:14px;margin-left:24px;transition:color .2s;}
    .nav-links a:hover{color:#fff;}
    .hero{text-align:center;padding:72px 24px 48px;}
    .hero h1{font-size:clamp(32px,6vw,52px);font-weight:800;color:#fff;letter-spacing:-2px;margin-bottom:14px;animation:fadeUp .5s ease both;}
    .hero p{color:#8b949e;font-size:16px;animation:fadeUp .5s .1s ease both;}
    .toggle-row{display:flex;align-items:center;justify-content:center;gap:12px;margin:28px 0;animation:fadeUp .5s .2s ease both;}
    .toggle-label{font-size:14px;color:#8b949e;}
    .save-badge{background:#0d2a14;color:#3fb950;font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px;}
    .plans{display:flex;gap:20px;max-width:960px;margin:0 auto 80px;padding:0 24px;align-items:stretch;animation:fadeUp .5s .3s ease both;}
    .plan{background:#0d1117;border:1px solid #21262d;border-radius:16px;padding:32px;flex:1;display:flex;flex-direction:column;transition:border-color .2s,transform .2s;position:relative;}
    .plan:hover{transform:translateY(-4px);border-color:#58a6ff33;}
    .plan.popular{border-color:#58a6ff;background:#0a1628;}
    .pop-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#1f6feb,#388bfd);color:#fff;font-size:11px;font-weight:700;padding:4px 16px;border-radius:20px;white-space:nowrap;}
    .plan-name{font-size:14px;font-weight:600;color:#8b949e;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;}
    .plan-price{font-size:48px;font-weight:800;color:#fff;letter-spacing:-2px;margin-bottom:4px;}
    .plan-price sup{font-size:20px;vertical-align:top;margin-top:10px;display:inline-block;}
    .plan-price span{font-size:15px;color:#8b949e;font-weight:400;}
    .plan-desc{color:#8b949e;font-size:13px;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #21262d;}
    .plan-features{list-style:none;flex:1;margin-bottom:28px;}
    .plan-features li{color:#c9d1d9;font-size:14px;padding:9px 0;border-bottom:1px solid #21262d11;display:flex;align-items:center;gap:8px;}
    .plan-features li::before{content:'✓';color:#3fb950;font-weight:700;font-size:13px;}
    .plan-features li.no::before{content:'✗';color:#484f58;}
    .plan-features li.no{color:#484f58;}
    .btn{display:block;text-align:center;padding:13px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;transition:all .2s;}
    .btn-primary{background:linear-gradient(135deg,#1f6feb,#388bfd);color:#fff;}
    .btn-primary:hover{opacity:.9;transform:translateY(-1px);}
    .btn-outline{background:transparent;color:#58a6ff;border:1px solid #21364f;}
    .btn-outline:hover{background:#0d1f35;border-color:#58a6ff;}
    .faq{max-width:640px;margin:0 auto 80px;padding:0 24px;}
    .faq h2{font-size:24px;font-weight:700;color:#fff;text-align:center;margin-bottom:32px;letter-spacing:-1px;}
    .faq-item{border-bottom:1px solid #21262d;padding