export const CACHE_PREFIX = 'mpdx';

// Translation files hold no personal data, so they survive sign-out
export const TRANSLATIONS_CACHE = `${CACHE_PREFIX}-translations`;

export const KEEP_ON_SIGN_OUT_PREFIXES: readonly string[] = [
  `${CACHE_PREFIX}-precache`,
  TRANSLATIONS_CACHE,
];

export const shouldKeepOnSignOut = (cacheName: string): boolean =>
  KEEP_ON_SIGN_OUT_PREFIXES.some((prefix) => cacheName.startsWith(prefix));
