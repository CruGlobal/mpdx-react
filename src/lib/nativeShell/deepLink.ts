/**
 * Pure deep-link routing core (deep-links design §4.2).
 *
 * The `deepLink` value is a same-origin absolute web path — path + query, no
 * scheme, no host (e.g. `/accountLists/<alid>/contacts/<cid>?tab=Donations`).
 * Same-origin is the load-bearing security check: every output begins with a
 * single `/`, so `router.push` can never leave the app's origin.
 */

const FALLBACK_ROUTE = '/accountLists';

/** Hosts whose universal links we are willing to route in-app. */
export const allowedDeepLinkHosts = (): string[] => [
  // window.location.host covers server.url mode (prod or stage shell)
  window.location.host,
];

/**
 * Validates an in-payload web path (from push data). Returns a safe
 * same-origin path or null.
 *
 * Rules: must be a string, start with exactly one '/' (rejects
 * protocol-relative '//host' and absolute URLs/schemes), no backslashes
 * (browsers treat '\' as '/'), no whitespace, decodes cleanly.
 */
export const sanitizeDeepLinkPath = (value: unknown): string | null => {
  if (typeof value !== 'string' || value === '') {
    return null;
  }
  if (!value.startsWith('/') || value.startsWith('//')) {
    return null;
  }
  if (value.includes('\\') || /\s/.test(value)) {
    return null;
  }
  try {
    decodeURIComponent(value);
  } catch {
    return null;
  }
  return value;
};

/**
 * Converts a universal-link URL (`appUrlOpen`) to an in-app path.
 *
 * Returns null for disallowed hosts/schemes (the caller ignores the event and
 * lets nothing happen rather than navigating somewhere unexpected). The host
 * check is exact-match against `allowedHosts` — no suffix matching.
 */
export const deepLinkFromUrl = (
  url: string,
  allowedHosts: string[],
): string | null => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') {
    return null;
  }
  if (!allowedHosts.includes(parsed.host)) {
    return null;
  }
  return sanitizeDeepLinkPath(parsed.pathname + parsed.search + parsed.hash);
};

/**
 * Extracts the route from a push notification's data payload.
 *
 * Reads `data.deepLink` (string — master plan §3.4 R2), falling back to
 * `/accountLists` when missing or invalid — a push tap must always land
 * somewhere sensible.
 */
export const routeFromPushData = (data: unknown): string => {
  if (typeof data === 'object' && data !== null) {
    const sanitized = sanitizeDeepLinkPath(
      (data as Record<string, unknown>).deepLink,
    );
    if (sanitized) {
      return sanitized;
    }
  }
  return FALLBACK_ROUTE;
};
