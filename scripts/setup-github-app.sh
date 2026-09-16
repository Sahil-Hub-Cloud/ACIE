#!/usr/bin/env bash
#
# Push GitHub App credentials to Vercel and verify the result.
#
# Usage:
#   scripts/setup-github-app.sh <app-id> <path-to-private-key.pem> [options]
#
# Options:
#   --client-id <id>          GitHub App "Client ID"
#   --client-secret <secret>  GitHub App client secret
#   --slug <slug>             App URL slug (e.g. acie-bot)
#   --env <environment>       Vercel environment (default: production)
#   --no-deploy               Skip the redeploy that activates the variables
#
# Example:
#   scripts/setup-github-app.sh 1234567 ~/Downloads/acie.2026-09-16.private-key.pem \
#     --client-id Iv1.abc123 --client-secret s3cret --slug acie-bot

set -euo pipefail

APP_ID="${1:-}"
PEM_PATH="${2:-}"
shift 2 2>/dev/null || true

CLIENT_ID=""
CLIENT_SECRET=""
SLUG=""
TARGET_ENV="production"
DEPLOY=1

while [ $# -gt 0 ]; do
  case "$1" in
    --client-id)     CLIENT_ID="$2"; shift 2 ;;
    --client-secret) CLIENT_SECRET="$2"; shift 2 ;;
    --slug)          SLUG="$2"; shift 2 ;;
    --env)           TARGET_ENV="$2"; shift 2 ;;
    --no-deploy)     DEPLOY=0; shift ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [ -z "$APP_ID" ] || [ -z "$PEM_PATH" ]; then
  sed -n '2,20p' "$0"
  exit 1
fi

if [ ! -f "$PEM_PATH" ]; then
  echo "Private key not found: $PEM_PATH" >&2
  exit 1
fi

command -v vercel >/dev/null 2>&1 || { echo "vercel CLI not found. Run: npm i -g vercel" >&2; exit 1; }

# The PEM must survive being stored as a single-line env var. Vercel treats
# newlines inconsistently across dashboards, so base64 is the safe transport;
# the app decodes it at runtime (see apps/web/src/lib/github-app.ts).
if base64 --help 2>&1 | grep -q '\-w'; then
  KEY_B64="$(base64 -w0 "$PEM_PATH")"
else
  KEY_B64="$(base64 "$PEM_PATH" | tr -d '\n')"   # macOS / BSD base64
fi

if ! grep -q "BEGIN RSA PRIVATE KEY\|BEGIN PRIVATE KEY" "$PEM_PATH"; then
  echo "Warning: $PEM_PATH does not look like a PEM private key." >&2
fi

set_var() {
  local name="$1" value="$2"
  # `vercel env add` refuses to overwrite, so clear any existing value first.
  vercel env rm "$name" "$TARGET_ENV" --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | vercel env add "$name" "$TARGET_ENV" >/dev/null
  echo "  set $name"
}

echo "Configuring GitHub App credentials for the '$TARGET_ENV' environment..."
set_var GITHUB_APP_ID "$APP_ID"
set_var GITHUB_APP_PRIVATE_KEY "$KEY_B64"
[ -n "$CLIENT_ID" ]     && set_var GITHUB_CLIENT_ID "$CLIENT_ID"
[ -n "$CLIENT_SECRET" ] && set_var GITHUB_CLIENT_SECRET "$CLIENT_SECRET"
[ -n "$SLUG" ]          && set_var GITHUB_APP_SLUG "$SLUG"

if [ "$DEPLOY" -eq 1 ]; then
  echo
  echo "Redeploying so the new variables take effect..."
  vercel --prod --yes >/dev/null
  echo "  deployed"
fi

echo
echo "Done. Verify with:"
echo "  curl -s https://<your-domain>/api/auth/status"
