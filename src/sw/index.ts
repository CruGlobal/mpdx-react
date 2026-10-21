import { Serwist } from 'serwist';
import { CACHE_PREFIX } from 'src/lib/serviceWorker/cacheNames';
import { fallbackEntries } from './fallbacks';
import { runtimeCaching } from './runtimeCaching';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';

declare const self: ServiceWorkerGlobalScope &
  SerwistGlobalConfig & {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  cacheId: CACHE_PREFIX,
  skipWaiting: true,
  clientsClaim: false,
  navigationPreload: false,
  runtimeCaching,
  // Shows the offline page when a page load fails
  fallbacks: { entries: fallbackEntries },
});

serwist.addEventListeners();
