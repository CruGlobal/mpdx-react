# Serwist service worker and sign-out cleanup

Date: 2026-10-16
Tickets: MPDX-10161 (replace next-pwa with Serwist), MPDX-10165 (keep auth and API
traffic out of the cache, clear caches on sign-out). Epic MPDX-10160.
Branch: `MPDX-10161-serwist`. One PR for both tickets. MPDX-10164 (reload prompt) is
deferred: the worker uses `skipWaiting: true` until it caches anything that can go stale.

## Why

`next-pwa` 5.x is a factory (`withPWA(opts)(nextConfig)`), but `next.config.ts` passes it
straight to `next-compose-plugins` with a `pwa` key, so it returns a function instead of
a config and no service worker has ever been built. There are no old workers in
browsers to clean up. The package is
unmaintained (last release 5.6.0, August 2022) and doesn't support Next 15. Its maintained
fork, [`@ducanh2912/next-pwa`](https://www.npmjs.com/package/@ducanh2912/next-pwa), now
tells users to migrate to [`@serwist/next`](https://serwist.pages.dev/docs/next), which
comes from the same maintainer and is built on a fork of Workbox.

MPDX shows donor and financial data, and the epic ships straight to prod with no feature
flag. The worker must never cache personal data or auth responses, and nothing cached may
survive a sign-out. That's why MPDX-10165 lands in the same PR.

## Goals

- `@serwist/next` + `serwist` replace `next-pwa`. Stage and prod serve `/sw.js` and
  DevTools shows it activated.
- The worker precaches built static assets only.
- Nothing from auth, the API, `/_next/data`, or page HTML is ever cached.
- Every sign-out path runs one shared cleanup helper that empties localStorage and the
  Apollo store, and deletes every cache except the ones on a keep list (the precache).
- `yarn start` never registers a worker.
- Rollback steps are written down in the repo.

## Non-goals

- Offline fallback page (MPDX-10163), reload prompt (MPDX-10164), offline indicator,
  IndexedDB cache persistence, blocking saves (later tickets).
- Caching translations for offline use (MPDX-10176).
- Manifest cleanup (MPDX-10162).
- Cross-tab sign-out. Another open tab can persist its Apollo cache back to localStorage
  after this tab's cleanup runs. That leak already exists and is handled in MPDX-10169.

## Anti-goals

- Storing data viewed while impersonating another user for offline use. Impersonation lets
  admins debug someone else's account, so none of that data belongs on the admin's
  machine. This PR holds because the worker caches no data and impersonation start and
  stop both run the cleanup helper. The Apollo cache persistence gap is MPDX-10169's.
  Admin and supervisor views (for example the MPD Supervisor Report) are normal use, not
  impersonation, and follow the same rules as everything else.
- Any runtime caching of pages, API calls or `/_next/data`.
- Serwist's `defaultCache` preset (it network-first caches same-origin `/api/` and
  navigations).

## Current state (measured)

- Next 15.0.3, webpack build, `next-compose-plugins` in `next.config.ts`.
- `.gitignore` already ignores `/public/sw*` and `/public/workbox*`.
- Prod build: 254 JS files, 6.4MB raw / ~1.85MB gzipped. 29MB of `.map` files in
  `.next/static` (uploaded to Datadog). `public/locales` is 7MB across 24 languages,
  loaded at runtime by `i18next-http-backend` from `/locales/{{lng}}/translation.json`.
- Sign-out paths (each does `signOut(...).then(() => { clearDatadogUser();
client.clearStore(); })`):
  1. `pages/logout.page.tsx`
  2. `AUTHENTICATION_ERROR` handler in `src/lib/apollo/client.ts`
  3. `src/components/Layouts/Primary/TopBar/Items/ProfileMenu/ProfileMenu.tsx`
  4. `src/components/Layouts/Primary/NavBar/NavTools/ProfileMenuPanel/ProfileMenuPanel.tsx`
  5. `src/components/Settings/integrations/Organization/ConnectOrganization.tsx`
     (not listed in the ticket)
  - Also `handleStopImpersonating` in `ProfileMenu.tsx`, which does
    `window.localStorage.clear()` then sends the browser to `/api/stop-impersonating`.
  - Impersonation starts in `src/components/Settings/Admin/ImpersonateUser/ImpersonateUserAccordion.tsx`
    and `src/components/Settings/Organization/ImpersonateUser/ImpersonateUserAccordion.tsx`.
    Both POST to `/api/auth/impersonate/*` and then `push('/login')` with no cleanup, so
    the admin's own cached data carries into the impersonated session.
  - In prod, `persistCache` saves the Apollo cache to localStorage at module load,
    including while impersonating (fixed in MPDX-10169).

## Design

### Worker (`src/sw/`)

- `src/sw/index.ts`: the Serwist `swSrc`. Builds the `Serwist` instance with
  `precacheEntries: self.__SW_MANIFEST`, `runtimeCaching` from `runtimeCaching.ts`,
  `skipWaiting: true`, `clientsClaim: false`, `navigationPreload: false`, then calls
  `addEventListeners()`. The only file that touches `self`.
  - `skipWaiting: true` is safe while the worker only precaches hashed static files and
    never caches HTML: an old tab that misses an old-build file goes to the network, the
    same as with no worker. Worker fixes (like a change to the network-only rules) reach
    every open tab on the next update check. Switch to a user-driven reload (MPDX-10164)
    before caching pages or files whose content can change under the same URL.
- `src/sw/networkOnly.ts`: pure matcher(s) for everything that must always hit the
  network: every same-origin `/api` path (`/api` itself or anything under `/api/`), any
  `api.mpdx.org` / `api.*.mpdx.org` request (hostname starts with `api.` and ends with
  `.mpdx.org`), any `/_next/data/` URL, and any navigation (`request.mode === 'navigate'`,
  which covers all page HTML).
- `src/sw/runtimeCaching.ts`: the ordered `RuntimeCaching[]`. Today it holds one entry:
  `networkOnly` matcher → `NetworkOnly` handler. It goes first so later tickets can't add a
  rule that shadows it. (Precache routing runs before runtime caching in Serwist, which is
  fine because nothing forbidden is in the precache manifest.)
- `src/sw/tsconfig.json` extends the root config with `lib: ["esnext", "webworker"]` and
  `types: ["@serwist/next/typings", "jest"]`, so the tests next to the worker code are
  type-checked there. Root `tsconfig.json` excludes `src/sw`. `lint:ts` runs both
  (`tsc && tsc -p src/sw`). Jest tests for `src/sw` modules only import pure modules,
  never `index.ts`.

- `src/lib/serviceWorker/cacheNames.ts`: the shared cache names, imported by both the
  worker and the app. Exports `CACHE_PREFIX = 'mpdx'` (the worker passes it as Serwist's
  `cacheId`) and `KEEP_ON_SIGN_OUT_PREFIXES`, the name prefixes of caches with no
  personal data that survive sign-out, plus `shouldKeepOnSignOut(name)`. Prefixes, not
  full names, because Serwist appends the scope URL (`mpdx-precache-v2-https://…/`).
  Today the list is only `mpdx-precache`. MPDX-10176 (translations) will add its cache
  here.

My calls: `messages.ts` and `fallbacks.ts` from the ticket's layout are left for
MPDX-10164 and MPDX-10163. The ticket's `CLEAR_CACHES` message isn't needed because the
page can delete Cache Storage entries itself (see below). The rollback worker deletes
every cache on the origin, so it doesn't need the keep list.

### Precache manifest

Serwist runs in config mode: `next build && serwist build serwist.config.mjs` (both
`build` and `build:amplify`). `serwist.config.mjs` uses `serwist()` from
`@serwist/next/config` with `swSrc: 'src/sw/index.ts'`, `swDest: 'public/sw.js'`,
`precachePrerendered: false` (the default would precache page HTML), `globPatterns`
limited to `.next/static/**/*`, `public/icons/**/*`, `public/images/**/*` and
`public/manifest.json` so `public/locales` is not precached, and `globIgnores: ['**/*.map']`.
A manifest transform encodes `[`, `]` and `@` the same way the webpack plugin did, so
dynamic route chunks match the URLs Next requests. The esbuild target is Next's default
browserslist with Safari raised to 14.1, because esbuild can't lower async arrow functions
with destructured params for older Safari. Expected install download: ~2.5MB gzipped. Only
changed hashed chunks re-download on later deploys.

My call: locales are excluded. Precaching all 24 languages is 7MB for one used language.
Offline translations are handled by MPDX-10176 with a runtime cache rule for the user's
locale.

### Registration (`src/lib/serviceWorker/`)

- Config mode injects nothing into the page, so `register.ts` creates the window instance.
  `registerServiceWorker()` builds `new Serwist('/sw.js', { scope: '/', type: 'classic' })`
  from `@serwist/window` only when `process.env.NODE_ENV === 'production'` and the browser
  supports service workers, calls `register()`, and returns the instance. It memoizes the
  instance at module level, so MPDX-10164's hook listens for `waiting` on the same one
  that registered. It returns `undefined` in dev and in unsupported browsers.
- Called once from a `useEffect` in `pages/_app.page.tsx`.
- `next-pwa` removed from `next.config.ts` and `package.json`. Serwist stays out of
  `next.config.ts`. `@serwist/next@9` is ESM only, and Next 15.0.3 compiles
  `next.config.ts` to CommonJS, which can't `require()` it under Yarn PnP; config mode
  avoids that. Pin `@serwist/next`, `@serwist/cli`, `serwist` and `@serwist/window` to
  `^9` (a 10.0 preview exists).

### `sw.js` must not be cached by HTTP

Add a `headers()` entry in `next.config.ts` for `/sw.js`: `Cache-Control: no-cache,
no-store, must-revalidate`. Browsers already revalidate the worker script at least every
24h, but Amplify's CDN could still serve a stale copy. Verify on the Amplify preview
branch with `curl -I`. If Amplify ignores `headers()` for public files, fall back to a
`customHttp.yml`.

### Sign-out cleanup (`src/lib/clearSessionData.ts`)

```ts
export const clearSessionData = async (client: ApolloClient<unknown>) => { ... }
```

In order: `clearDatadogUser()`, `window.localStorage.clear()`, `await client.clearStore()`,
then delete every key from `caches.keys()` where `shouldKeepOnSignOut` is false (skip when
`'caches' in window` is false). Unknown caches are deleted by default, so a cache added
later is wiped until someone puts it on the keep list on purpose. The precache stays
because it only holds built static assets, and wiping it would make the next sign-in
download ~2.5MB again (MPDX-10165 was updated to say this).
Each step is wrapped so one failure doesn't stop the rest. MPDX-10169 will add the
persistor purge here.

Every sign-out path becomes `await clearSessionData(client); signOut(...)`. Cleanup runs
**before** `signOut`, not in its `.then`, because `signOut` navigates away and an async
cache delete started afterwards can be cut off by the unload.

My calls:

- `ConnectOrganization.tsx` is a sign-out path, so it uses the helper too.
- Both impersonation start points run the helper once the impersonate POST succeeds, then
  keep their existing `push('/login')`. Stop impersonating ends in a logout and a fresh
  login, so it just swaps its `window.localStorage.clear()` for the helper to stay
  consistent with the other paths.
- `localStorage.clear()` on every sign-out is new for paths 1-5. It wipes the persisted
  Apollo cache (good) and the `i18nextLng` language choice, so the next sign-in starts in
  the browser language until the user's preference loads. The ticket asks for this.

### Rollback

`docs/service-worker.md` documents: if the worker misbehaves, replace `src/sw/index.ts`
with a kill-switch worker that on `install` calls `self.skipWaiting()`, and on `activate`
deletes every cache, calls `self.registration.unregister()`, and reloads open clients via
`clients.matchAll({ type: 'window' })` + `client.navigate(client.url)`. Keep it deployed
until traffic shows old workers are gone. Removing the worker from the build alone does
not remove it from browsers. Also covers how to check a worker in DevTools.

## Commits

1. `MPDX-10165 - Add a shared sign-out cleanup helper` (helper + tests, all sign-out paths
   and stop impersonating switched, path tests updated).
2. `MPDX-10165 - Clear session data when impersonation starts` (both accordions + tests).
3. `MPDX-10161 - Replace next-pwa with Serwist` (deps, `next.config.ts`, `src/sw/index.ts`,
   worker tsconfig, `lint:ts`, registration in `_app`).
4. `MPDX-10165 - Keep auth, API, data and page requests network-only in the service
worker` (`networkOnly.ts`, `runtimeCaching.ts`, tests).
5. `MPDX-10161 - Serve sw.js with no-cache`.
6. `MPDX-10161 - Document the service worker rollback plan`.

Plus this spec and the plan as their own docs commit first.

## Verification

- `yarn test`, `yarn lint:ts`, `yarn lint:ci`, `prettier:check`.
- `yarn build` emits `public/sw.js`. Inspect its precache list: no `.map`, no
  `/locales`, no HTML, no `/_next/data`.
- `yarn serve` locally: worker activates, Cache Storage holds only precache entries after
  browsing contacts and the dashboard; sign out leaves only the precache.
- `yarn start`: no worker registered.
- Amplify preview: `curl -I <preview>/sw.js` shows `no-cache`.

## Left to the builder

Exact matcher shapes, test file layout, and how to make `self.__SW_MANIFEST` typing work.
