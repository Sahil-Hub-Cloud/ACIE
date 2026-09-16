# ACIE — GitHub App Setup

ACIE connects to GitHub as a **GitHub App** rather than a classic OAuth App.
That choice buys three things a classic OAuth App cannot give you:

| Capability | Classic OAuth App | GitHub App |
|---|---|---|
| Callback URLs | **1** | **10** |
| Can receive webhooks | No | Yes |
| Repo access | Broad `repo` scope over everything you own | Scoped to repos the app is installed on |
| Token lifetime | Long-lived | 1 hour, auto-refreshed |
| Acts as itself | No | Yes (App JWT) |

The single-callback limit is what breaks preview deployments and custom
domains — each new URL is a `redirect_uri` mismatch. A GitHub App removes that
class of bug entirely.

---

## 1. Register the app

Go to **https://github.com/settings/apps** → **New GitHub App**.

| Field | Value |
|---|---|
| **GitHub App name** | `ACIE` (must be globally unique) |
| **Homepage URL** | `https://acie-gamma.vercel.app` |
| **Callback URL** | `https://acie-gamma.vercel.app/login` |
| **Setup URL** | `https://acie-gamma.vercel.app/api/auth/github/setup` |
| **Webhook URL** | `https://acie-gamma.vercel.app/api/webhooks/analyze` |
| **Webhook secret** | `openssl rand -hex 32` — save this value |

Click **Add callback URL** as many times as you need — for example a second
entry for `http://localhost:3000/login` so local development works against the
same app.

> **Leave "Request user authorization (OAuth) during installation" unchecked.**
> If you check it, GitHub hides the Setup URL field and sends users through the
> Callback URL instead.

### Permissions

Under **Repository permissions**, set only what ACIE needs:

| Permission | Access | Why |
|---|---|---|
| **Pull requests** | Read & write | Read the diff, post the blast radius comment |
| **Contents** | Read | Read files to resolve imports |
| **Metadata** | Read | Required by GitHub for every app |

### Events

Under **Subscribe to events**, tick:

- **Pull request**
- **Installation**
- **Installation repositories**

Then click **Create GitHub App**.

---

## 2. Collect the credentials

On the app's settings page:

| ACIE variable | Where to find it |
|---|---|
| `GITHUB_APP_ID` | Top of the page, "App ID" (a number like `1234567`) |
| `GITHUB_APP_PRIVATE_KEY` | **Generate a private key** — downloads a `.pem` |
| `GITHUB_CLIENT_ID` | "Client ID" |
| `GITHUB_CLIENT_SECRET` | **Generate a new client secret** |
| `GITHUB_WEBHOOK_SECRET` | The value you typed in step 1 |
| `GITHUB_APP_SLUG` | Optional. The slug in `https://github.com/apps/<slug>` |

The private key is multi-line PEM. Store it as a single env var — the code
accepts raw PEM, base64-encoded PEM, or PEM with literal `\n` escapes:

```bash
# Base64 is the least error-prone for env vars and dashboards
base64 -w0 your-app.private-key.pem
```

---

## 3. Configure the environment

### Automated

```bash
scripts/setup-github-app.sh <app-id> <path-to-private-key.pem> \
  --client-id <client-id> --client-secret <client-secret> --slug <app-slug>
```

The script base64-encodes the PEM, pushes every variable to Vercel, and
redeploys. Re-running it overwrites existing values safely.

### Manual

Set these on Vercel (Project → Settings → Environment Variables) or in `.env.local`:

```bash
GITHUB_APP_ID=1234567
GITHUB_APP_PRIVATE_KEY=<base64 PEM>
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxx
GITHUB_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
JWT_SECRET=<openssl rand -hex 32>
```

Optional:

```bash
# Only if the registered callback URL differs from https://<current-host>/login
GITHUB_OAUTH_REDIRECT_URI=https://acie-gamma.vercel.app/login

# Only if the App is not installed on a repo (PAT fallback)
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

Redeploy after changing `NEXT_PUBLIC_*` variables; server-side variables take
effect on the next deployment.

---

## 4. Verify

### Is everything wired up?

```bash
curl -s https://acie-gamma.vercel.app/api/auth/status | jq
```

```json
{
  "oauth":      { "configured": true, "clientId": "Iv1.xxxx" },
  "githubApp":  { "configured": true, "slug": "acie-bot",
                  "installUrl": "https://github.com/apps/acie-bot/installations/new" },
  "repoAccess": { "configured": true, "patFallback": false },
  "webhooks":   { "configured": true, "endpoint": "/api/webhooks/analyze" },
  "sessions":   { "configured": true }
}
```

### The endpoint itself

```bash
curl -s https://acie-gamma.vercel.app/api/webhooks/analyze | jq
```

Then in the GitHub App settings page click **Advanced** → **Recent Deliveries**.
GitHub sends a `ping` on save; you should see a green `200` with the `zen` echoed back.

### Exercise the analysis without commenting

Add `?dryRun=1` to the webhook URL to run the full pipeline and get the comment
back in the response instead of posting it to the PR. Ideal when you don't want
to spam a real repository:

```bash
curl -s -X POST "https://acie-gamma.vercel.app/api/webhooks/analyze?dryRun=1" \
  -H "Content-Type: application/json" \
  -d @pull_request_payload.json | jq '.riskScore, .commentAction'
```

`comment` will read `skipped` and `commentPreview` will hold the Markdown body.

### Install the app

1. Sign in to ACIE at `/login`
2. Open `/api/auth/github/install`, or click **Add to GitHub** on the landing page
3. Pick the repositories to grant access to
4. GitHub redirects to the Setup URL, then on to `/repos`

Open a pull request and the bot comments with the blast radius report.

---

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| GitHub **404** "not the web page you are looking for" | The client ID does not exist — usually a stale ID cached in the browser | Hard-refresh. Confirm the ID at https://github.com/settings/apps |
| **"The redirect_uri is not associated with this application."** | Callback URL not registered on the app | Add `https://<host>/login` to **Callback URL** on the app. GitHub Apps allow 10 |
| **401 Invalid signature** in the webhook logs | `GITHUB_WEBHOOK_SECRET` does not match the app's webhook secret | Re-copy the secret from the app settings |
| Webhook returns `503 No GitHub credentials configured` | Neither the App nor a PAT can read the repo | Install the app on the repo, or set `GITHUB_TOKEN` |
| Webhook returns `ignored: true` | Event was not an analyzed `pull_request` action | Only `opened`, `synchronize`, `reopened` are analyzed |
| No comment on the PR | The app lacks **Pull requests: Read & write** | Fix the permission, then re-approve the installation |
| Analysis isn't saved to the dashboard | No database configured | Set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` |

### Security notes

- Webhook signatures are verified with a **constant-time** comparison against
  the raw request body, before any parsing.
- OAuth uses a random `state` stored in an `httpOnly` cookie and compared on
  callback, so a forged callback cannot complete a login.
- Installation tokens are cached in memory and refreshed a minute before expiry.
- No secret is ever sent to the browser. `/api/auth/status` reports only
  booleans and the public client ID.
