import { ExpirationPlugin, NetworkOnly, StaleWhileRevalidate } from 'serwist';
import { TRANSLATIONS_CACHE } from 'src/lib/serviceWorker/cacheNames';
import { isNetworkOnly } from './networkOnly';
import { isTranslationFile } from './translations';
import type { RuntimeCaching } from 'serwist';

// The network-only rule must stay first so later rules can't shadow it.
export const runtimeCaching: RuntimeCaching[] = [
  { matcher: isNetworkOnly, handler: new NetworkOnly() },
  // Only the languages a user loads get cached, and the cached copy refreshes
  // in the background so new translations show up on the next load
  {
    matcher: isTranslationFile,
    handler: new StaleWhileRevalidate({
      cacheName: TRANSLATIONS_CACHE,
      plugins: [new ExpirationPlugin({ maxEntries: 5 })],
    }),
  },
];
