# ACIE Demo Guide

Exact steps to install the GitHub App on a test repo, open a PR, and see the blast-radius comment appear.

---

## Prerequisites

- A GitHub account with **admin access** to a test organization/repo
- ACIE deployed (or running locally with `pnpm dev` + ngrok/tunnel)
- Turso database created (free at https://turso.tech)

---

## 1. Create the GitHub App

1. Go to **GitHub → Settings → Developer settings → GitHub Apps → New GitHub App**
2. Fill in:
   - **GitHub App name**: `ACIE Demo` (or your choice)
   - **Homepage URL**: `https://your-deployment.vercel.app` (or `http://localhost:3000` for local)
   - **Callback URL**: `https://your-deployment.vercel.app/login` (or `http://localhost:3000/login`)
   - **Webhook URL**: `https://your-deployment.vercel.app/api/webhooks/analyze` (or tunnel URL + `/api/webhooks/analyze`)
   - **Webhook secret**: Generate a random string (save this!)

3. **Permissions** (Repository permissions):
   - **Pull requests**: Read & write
   - **Contents**: Read
   - **Metadata**: Read
   - **Checks**: Read & write (for Check Runs)

4. **Subscribe to events**:
   - Pull request
   - Installation
   - Installation repositories

5. **Create the App** → note the **App ID** (number at top)

6. **Generate Private Key**:
   - Scroll to "Private keys" → **Generate a private key**
   - Save the `.pem` file securely

7. **Client Secrets**:
   - Copy **Client ID** and generate a **Client Secret**

---

## 2. Configure Environment

```bash
# In your ACIE repo
cp .env.example .env.local

# Fill in all values:
GITHUB_APP_ID=123456                    # From step 1
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"          # Contents of .pem file (with newlines!)
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxxxxx   # From step 7
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxx # From step 7
GITHUB_WEBHOOK_SECRET=your-webhook-secret # From step 1
JWT_SECRET=$(openssl rand -hex 32)       # Generate fresh
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

**Important**: The private key must include the full PEM with newlines. In `.env.local`, you can use multiline:

```env
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----"
```

---

## 3. Start ACIE (Local Development)

```bash
# Terminal 1: Start ngrok for webhook tunnel
ngrok http 3000
# Copy the HTTPS URL, e.g., https://abc123.ngrok.io

# Terminal 2: Start ACIE
pnpm dev
# Web at http://localhost:3000
# CLI at ./apps/cli/dist/index.js
```

**Update GitHub App settings** with the ngrok URL:
- Callback URL: `https://abc123.ngrok.io/login`
- Webhook URL: `https://abc123.ngrok.io/api/webhooks/analyze`

---

## 4. Install the App on a Test Repo

1. Go to **GitHub → Settings → Developer settings → GitHub Apps → [Your App] → Install App**
2. Choose your test organization/account
3. Select **Only select repositories** → pick a TypeScript repo with some history
4. Click **Install**

The app will auto-register the repo in ACIE's database.

---

## 5. Seed Demo Data (Optional)

To see the dashboard populated immediately:

```bash
# Run the seed script (requires env vars set)
pnpm --filter @acie/web tsx scripts/seed-demo.ts

# Or use the dev endpoint (if running locally)
curl -X POST http://localhost:3000/api/dev/seed
```

---

## 6. Open a Pull Request

1. In your test repo, create a new branch:
   ```bash
   git checkout -b demo-change
   ```

2. Make a change that touches shared code (e.g., a utility function, type, or middleware):
   ```typescript
   // src/utils/date.ts
   - export function formatDate(d: Date) { return d.toISOString(); }
   + export function formatDate(d: Date, format = 'iso') { 
   +   return format === 'iso' ? d.toISOString() : d.toLocaleDateString(); 
   + }
   ```

3. Commit and push:
   ```bash
   git add src/utils/date.ts
   git commit -m "feat: add format option to formatDate"
   git push origin demo-change
   ```

4. Open a PR on GitHub (base: `main`, compare: `demo-change`)

---

## 7. Watch the Magic

Within 10-30 seconds, you'll see:

### On the PR:
- A **comment** from the ACIE bot with:
  - Risk badge (🚨/🔴/⚠️/✅) and score (0-100)
  - Impacted services with entry points
  - Dependency chain with **proof paths** (exact import chains)
  - **Test selection** — heuristic list of likely affected tests with confidence
  - **Suggested reviewers** from CODEOWNERS
  - Recommendations

- A **GitHub Check Run** (✓/✗) with the same analysis in the Checks tab

### In the ACIE Dashboard:
1. Go to `http://localhost:3000` (or your deployed URL)
2. Sign in with GitHub
3. Visit **/repos** → see your installed repo
4. Click the repo → **Analysis** tab
5. Click any analysis row → full detail with:
   - Proof paths for each impacted file
   - Test selection table
   - Reviewer suggestions

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Webhook not received | Check ngrok URL matches GitHub App webhook URL exactly; verify `GITHUB_WEBHOOK_SECRET` matches |
| "Installation token unavailable" | Ensure the repo is selected in the App installation; re-install if needed |
| "JWT_SECRET not set" | Generate with `openssl rand -hex 32` and add to `.env.local` |
| Private key error | Ensure the PEM includes `-----BEGIN RSA PRIVATE KEY-----` and newlines are preserved |
| Dashboard empty | Run seed script or wait for first PR webhook to auto-register repo |
| Check Run not appearing | Ensure "Checks: Read & write" permission on GitHub App |

---

## Expected Output (Example)

**PR Comment:**
```
## ⚡ ACIE Blast Radius Report — PR #42

![Risk Level](https://img.shields.io/badge/Risk-HIGH-ff4444?style=for-the-badge) 
![Score](https://img.shields.io/badge/Score-64%2F100-ff4444?style=for-the-badge)

### 🔴 Risk Assessment
| Metric | Value |
|--------|-------|
| Risk Score | **64/100** |
| Risk Level | **HIGH** |
| Changed Files | 2 |
| Impacted Files | 5 |
| Impacted Services | 2 |
| Entry Points Affected | ⚠️ Yes |

### 📦 Impacted Services
  - **payments** (1 entry points)
  - **billing**

### 🔗 Dependency Chain with Proof Paths (top 10)
  - `src/services/exchange.ts` (depth: 1) [symbols: convertCurrency]
    → `src/services/exchange.ts` imports `convertCurrency` (via `convertCurrency`) [imports]
  - `src/api/payments/charge.ts` (depth: 2) [symbols: convertCurrency]
    → `src/api/payments/charge.ts` imports `convertCurrency` (via `convertCurrency`) [imports]

### 🧪 Test Selection (heuristic — "likely affected tests")
- 🔴 `tests/services/exchange.test.ts` — **high** confidence: Direct test of changed file `src/services/exchange.ts`
- 🟡 `tests/api/payments.test.ts` — **medium** confidence: Tests impacted file `src/api/payments/charge.ts` (depth 2)
- 🟢 `tests/services/currency.test.ts` — **low** confidence: Co-located in `src/services/`

### 👥 Suggested Reviewers
- `src/services/currency.ts`: @payments-team, @alice (CODEOWNERS)
- `src/services/exchange.ts`: @payments-team (CODEOWNERS)

### 💡 Recommendations
- 🚨 Entry points (routes/controllers/handlers) are in the blast radius — runtime behavior may change.
- 🧪 Run integration tests against all affected endpoints before merging.
- 👥 Request review from senior engineers and affected service owners.
```

---

## Clean Up

```bash
# Stop ngrok
Ctrl+C

# Stop ACIE
Ctrl+C in pnpm dev terminal
```

---

## Next Steps

- Explore the **Analysis Detail** page in the dashboard for proof paths
- Check the **Check Run** in the PR's "Checks" tab
- Modify `src/utils/date.ts` further and push to see updated analysis
- Review `docs/AUDIT.md` for known limitations