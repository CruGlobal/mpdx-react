import type {
  HandlerDidErrorCallbackParam,
  PrecacheFallbackEntry,
} from 'serwist';

// Must match a precache entry. serwist.config.mjs precaches the built HTML for
// pages/offline.page.tsx, which has no user data.
export const OFFLINE_PAGE_URL = '/offline';

// Only page loads get the offline page. A failed API or data request must still
// fail, or the app would try to read HTML as a response.
export const isPageLoad = ({
  request,
}: Pick<HandlerDidErrorCallbackParam, 'request'>): boolean =>
  request.mode === 'navigate';

export const fallbackEntries: PrecacheFallbackEntry[] = [
  { url: OFFLINE_PAGE_URL, matcher: isPageLoad },
];
