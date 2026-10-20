export const CACHE_PREFIX = 'mpdx';

export const KEEP_ON_SIGN_OUT_PREFIXES: readonly string[] = [
  `${CACHE_PREFIX}-precache`,
];

export const shouldKeepOnSignOut = (cacheName: string): boolean =>
  KEEP_ON_SIGN_OUT_PREFIXES.some((prefix) => cacheName.startsWith(prefix));
