import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from 'serwist';
import type {
  PrecacheEntry,
  RuntimeCaching,
  SerwistGlobalConfig,
} from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/*
 * SECURITY: Do NOT reintroduce `defaultCache` from `@serwist/next/worker`
 * here, and do NOT add NetworkFirst/StaleWhileRevalidate handlers for HTML
 * documents, `/_next/data/*.json`, `/api/*`, or the GraphQL host.
 *
 * MPDX is an authenticated app. Every SSR page embeds the NextAuth session
 * (including `apiToken` and `impersonatorApiToken`) in `__NEXT_DATA__` via
 * `pages/api/utils/pagePropsHelpers.ts`. The Cache API ignores
 * `Cache-Control: no-store`, so any handler that writes those responses
 * into CacheStorage leaks API tokens to the next user of a shared device
 * and persists them past logout. The same applies to GraphQL responses
 * cached by URL only -- they would cross-leak data between accounts.
 *
 * The allowlist below stores ONLY immutable, content-hashed static assets
 * and public fonts. Everything else is `NetworkOnly` so it is never
 * written to CacheStorage. Serwist's `fallbacks` option attaches a
 * `PrecacheFallbackPlugin` to every `Strategy` handler (including the
 * `NetworkOnly` catch-all), so when a navigation fetch fails offline the
 * precached `/offline` document is served instead.
 */
const runtimeCaching: RuntimeCaching[] = [
  {
    // Immutable, content-hashed Next.js build output (JS/CSS/media chunks).
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && url.pathname.startsWith('/_next/static/'),
    handler: new CacheFirst({
      cacheName: 'next-static',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    }),
  },
  {
    // Google Fonts stylesheet + font files.
    matcher: ({ url }) =>
      url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com',
    handler: new StaleWhileRevalidate({
      cacheName: 'google-fonts',
    }),
  },
  {
    // Same-origin static media (fonts, images, audio) served from /public.
    matcher: ({ url, sameOrigin }) =>
      sameOrigin &&
      !url.pathname.startsWith('/_next/data/') &&
      !url.pathname.startsWith('/api/') &&
      /\.(?:woff2?|ttf|otf|eot|png|jpe?g|gif|svg|ico|webp|mp3)$/i.test(
        url.pathname,
      ),
    handler: new StaleWhileRevalidate({
      cacheName: 'static-assets',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 128,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    }),
  },
  {
    // Catch-all: HTML documents, /_next/data, /api/*, and any cross-origin
    // GET (including the GraphQL host) are passed straight through to the
    // network and never written to CacheStorage. The `fallbacks` option
    // below makes failed navigation requests serve the precached /offline
    // document via PrecacheFallbackPlugin.handlerDidError.
    matcher: () => true,
    handler: new NetworkOnly(),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // skipWaiting stays false so a new service worker never takes over
  // mid-session; ServiceWorkerUpdatePrompt asks the user first
  skipWaiting: false,
  // clientsClaim stays false so the first-installed SW does NOT
  // immediately intercept already-authenticated tabs that loaded before
  // the SW was registered -- a defense-in-depth measure on top of the
  // NetworkOnly catch-all above.
  clientsClaim: false,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

// Delete precaches left behind by the previous next-pwa/workbox service
// worker; Serwist uses its own precache name and would otherwise leave the
// old ones taking up storage forever
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('workbox-precache'))
          .map((key) => caches.delete(key)),
      ),
    ),
  );
});

serwist.addEventListeners();
