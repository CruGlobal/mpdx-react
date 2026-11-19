# Service worker

MPDX ships a service worker built with [Serwist](https://serwist.pages.dev/). It only precaches static files. It never caches user data.

## What the worker caches

### Precache only

The worker is built from `src/sw/index.ts`. It stores the app's static build files (JS, CSS and similar) plus a few public files so they load fast. Nothing else is stored.

- Serwist runs in config mode. `yarn build` (and `yarn build:amplify`) runs `next build` and then `serwist build serwist.config.mjs`. Serwist is not part of `next.config.ts`.
- The serwist step forces `NODE_ENV=production`, so the precache list is always built (in development mode Serwist leaves it empty).
- `serwist.config.mjs` at the repo root holds the settings. It uses `serwist()` from `@serwist/next/config`, and `serwist build` bundles `src/sw/index.ts` with esbuild and adds the precache list.
- Precache files are everything in `.next/static`, plus `public/icons`, `public/images` and `public/manifest.json` (`globPatterns`).
- Source maps (`.map`) are left out. `public/locales` is left out on purpose because precaching every language is about 7MB. Page HTML is left out too (`precachePrerendered: false`). The one exception is the offline page (see below).
- `yarn start` (`next dev`) never builds or registers a worker. `register.ts` only registers in production builds.
- The worker is written to `public/sw.js`. That file is generated, so do not commit it.
- `skipWaiting` is `true`, so a new worker takes over open tabs as soon as it installs. Page HTML is never cached and Next's static files have hashed names, so open tabs keep working. A tab still running the old build loads any old-build files it hasn't fetched yet from the network. `clientsClaim` is `false` because it only matters for the first install, when there's nothing to take over from.
- Turn `skipWaiting` off and add a user-driven reload prompt (MPDX-10164) before the worker caches pages or other files that can change without changing their URL.
- The offline page is the one exception, and it is safe with `skipWaiting` on. It is only ever shown as a full page load, and the same worker install precaches it together with the hashed files it uses, so it never mixes files from two builds.
- The cache name is `mpdx-precache-v2-<scope URL>`. The `mpdx` part is `CACHE_PREFIX` in `src/lib/serviceWorker/cacheNames.ts`.
- `/sw.js` is served with `Cache-Control: no-cache, no-store, must-revalidate` (see `headers` in `next.config.ts`). Browsers must always check for a new worker.
- The app registers the worker in `src/lib/serviceWorker/register.ts`. It creates one `@serwist/window` instance for `/sw.js`, calls `register()` on it and returns it. Later calls return the same instance.

### Network-only rules

The first runtime rule in `src/sw/runtimeCaching.ts` uses `isNetworkOnly` from `src/sw/networkOnly.ts`. It sends these requests straight to the network, with no caching:

- Every same-origin `/api/` route (auth, GraphQL, uploads and so on)
- API hosts like `api.mpdx.org` and `api.*.mpdx.org`
- `/_next/data/` (it carries the session's `apiToken`)
- All page navigations (the HTML)

This data is donor and financial data, so it must never be cached.

### Offline page

When a page load fails because there is no network, the worker shows `/offline` instead of the browser's error page. The address bar keeps the page the user asked for, so the Retry button just reloads it.

- The page is `pages/offline.page.tsx`. It has no data fetching, so Next builds it to static HTML with no user data. Keep it that way, because the worker precaches that HTML (`.next/server/pages/offline.html` in `globPatterns`).
- `/offline` is in `nonAuthenticatedPages` in `pages/_app.page.tsx`, so it renders without a session.
- `src/sw/fallbacks.ts` only serves it for page loads (`request.mode === 'navigate'`). Failed API and data requests still fail.
- The page shows in the user's language offline once they have loaded the app online in that language (see Translations below).

### Translations

`public/locales` is not precached (see above). Instead, the second rule in `src/sw/runtimeCaching.ts` caches the translation files i18next asks for (`/locales/<lang>/translation.json`, matched by `src/sw/translations.ts`). That is the user's language plus its fallbacks, such as `en`, so offline the app stays in their language.

- It uses `StaleWhileRevalidate`. The cached copy is used right away, and a fresh copy is fetched in the background. Locale files aren't hashed and Crowdin updates them on every deploy, so new translations show up on the next load.
- The cache is `mpdx-translations` (`TRANSLATIONS_CACHE` in `src/lib/serviceWorker/cacheNames.ts`). An `ExpirationPlugin` keeps at most 5 files, so switching languages doesn't pile them up.
- It is on the keep list, so it survives sign-out. Translation files hold no personal data.

### The keep list and sign-out

`src/lib/clearSessionData.ts` runs when a user signs out, and when impersonation starts or stops. It deletes every cache whose name does not start with a prefix in `KEEP_ON_SIGN_OUT_PREFIXES` (`src/lib/serviceWorker/cacheNames.ts`). Today that list has `mpdx-precache` and `mpdx-translations`.

### Adding a caching rule

1. Add the rule to `src/sw/runtimeCaching.ts` after the network-only rule. A rule placed before it could catch auth or API requests.
2. A new cache is wiped on sign-out. That is the safe default. Only add its name to the keep list if it is static and public.
3. Never cache personal data, or anything a user viewed while impersonating.

## Check it in DevTools

`yarn start` (`next dev` plus the GraphQL codegen watcher) never registers a worker. That is by design, because `next dev` does not run `serwist build` and `register.ts` only registers in production builds. To test it locally, run `JWT_SECRET=anything yarn build && yarn serve`. `yarn serve` runs `next start`, and the config throws in a production build without `JWT_SECRET`. You can also check the deployed site.

1. Open DevTools, then Application, then Service workers. You should see `/sw.js` as activated.
2. Open Application, then Cache Storage. You should see `mpdx-precache-v2-...` and `mpdx-translations`, which holds only the languages you loaded.
3. Sign out and look again. Any other cache should be gone.
4. In the Network tab, API and page requests should not say "(ServiceWorker)" as a cache hit.

## Rollback

If the worker causes a problem, do not just delete it from the build. Browsers that already installed it keep running it, and it can keep serving old files. Removing the worker from the build alone leaves it installed in browsers.

Instead, ship a kill-switch worker. It deletes every cache, unregisters itself and reloads open tabs.

1. Replace the whole body of `src/sw/index.ts` with this. `serwist build` does not need a `self.__SW_MANIFEST` line, so the kill switch leaves it out. The `export {}` makes the file a module so `yarn lint:ts` passes, and esbuild drops it from the built `sw.js`.

   ```ts
   export {};

   declare const self: ServiceWorkerGlobalScope;

   self.addEventListener('install', () => self.skipWaiting());
   self.addEventListener('activate', (event) => {
     event.waitUntil(
       (async () => {
         await Promise.all(
           (await caches.keys()).map((key) => caches.delete(key)),
         );
         await self.registration.unregister();
         const windows = await self.clients.matchAll({ type: 'window' });
         windows.forEach((client) => client.navigate(client.url));
       })(),
     );
   });
   ```

   While the kill switch is deployed, also remove the `registerServiceWorker()` call from `pages/_app.page.tsx`. Otherwise every page load registers the kill switch, which installs, wipes the caches and unregisters, again and again. Browsers still check existing registrations for updates on navigation, so old workers still pick up the kill switch.

2. Deploy it. Keep `/sw.js` served with `no-cache` so browsers fetch the new file.
3. Leave the kill switch deployed until old workers are gone. Users who have not visited since the rollback still have the old worker, and they only get cleaned up when they next visit. Do not remove `/sw.js` before then.
4. Only after that, remove the worker for good: delete `serwist.config.mjs` and `serwist build` from the `build` and `build:amplify` scripts, the `/sw.js` header in `next.config.ts`, `src/sw` and the registration call.
