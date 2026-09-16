/**
 * Resolve the origin the *browser* used, not the internal one.
 *
 * Behind Vercel's proxy `req.url` points at an internal host, so the
 * forwarded headers are the only reliable source. This matters for GitHub
 * OAuth, where the redirect_uri must match a registered callback URL exactly.
 */
export function getRequestOrigin(req: Request): string {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (!forwardedHost) return url.origin;

  const proto =
    req.headers.get('x-forwarded-proto') ||
    (forwardedHost.startsWith('localhost') || forwardedHost.startsWith('127.0.0.1')
      ? 'http'
      : 'https');

  return `${proto}://${forwardedHost}`;
}
