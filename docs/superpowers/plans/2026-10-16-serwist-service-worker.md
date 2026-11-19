# Serwist Service Worker and Sign-out Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dead `next-pwa` setup with a precache-only Serwist service worker, and make every sign-out and impersonation change run one cleanup helper.

**Architecture:** A shared `clearSessionData(client)` helper clears Datadog user, localStorage, the Apollo store and every Cache Storage entry not on a keep list, and runs before every `signOut` and around impersonation. `@serwist/next` builds `public/sw.js` from `src/sw/index.ts`. It precaches built static assets only, and its first runtime rule sends auth, API, `/_next/data` and navigations straight to the network. The app registers through the `window.serwist` instance the plugin injects.

**Tech Stack:** Next 15.0.3 (Pages Router, webpack), `@serwist/next@^9`, `serwist@^9`, `@serwist/window@^9`, Apollo Client 3, next-auth 4, Jest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-16-serwist-service-worker-design.md`

## Global Constraints

- Branch `MPDX-10161-serwist`, cut from `main`. Commit subjects start with the ticket: `MPDX-10165 - ...` or `MPDX-10161 - ...`.
- Pin `@serwist/next`, `serwist`, `@serwist/window` to `^9`.
- No runtime caching of pages, API calls or `/_next/data`. Never use Serwist's `defaultCache`.
- `skipWaiting: false`, `clientsClaim: false`, `navigationPreload: false`, `reloadOnOnline: false`.
- Worker disabled outside `NODE_ENV === 'production'`.
- Precache excludes `.map` files and `public/locales`. `globPublicPatterns`: `icons/**`, `images/**`, `manifest.json`.
- Cache prefix is `mpdx`. Only caches whose name starts with `mpdx-precache` survive sign-out.
- Cleanup runs before `signOut(...)`, never in its `.then`.
- Named exports only. `//` comments only for non-obvious "why".
- Use `yarn` (Node 22.14.0 via asdf). Run `yarn gql` before `yarn lint:ts` if generated files are missing.

## Review Focus

1. Cleanup step throws (for example `caches.keys()` rejects, or `clearStore()` rejects mid-query): the rest of the cleanup still runs and `signOut` is still called. Test in Task 1.
2. Browser without Cache Storage (`'caches' in window` is false, as in some private modes): cleanup skips that step without throwing. Test in Task 1.
3. Impersonate POST fails (non-200): no cleanup runs, so the admin keeps their own session data and sees the error. Test in Task 2.
4. Matcher edges: `/api/auth/session?update`, `https://api.stage.mpdx.org/graphql`, a `/_next/data/<build>/contacts.json?x=1` URL all match. `/_next/static/chunks/x.js`, `/icons/icon.png` and `https://mpdx.org/apiary` do not. Test in Task 4.
5. Dev or unsupported browser (`window.serwist` undefined): `registerServiceWorker()` returns `undefined` and doesn't throw. Test in Task 3.

---

### Task 0: Branch and docs commit

**Files:**

- Add: `docs/superpowers/specs/2026-10-16-serwist-service-worker-design.md`
- Add: `docs/superpowers/plans/2026-10-16-serwist-service-worker.md`

- [ ] **Step 1:** `git switch -c MPDX-10161-serwist`
- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-10-16-serwist-service-worker-design.md docs/superpowers/plans/2026-10-16-serwist-service-worker.md
git commit -m "MPDX-10161 - Add Serwist service worker design and plan"
```

---

### Task 1: Shared sign-out cleanup helper on every sign-out path

**Files:**

- Create: `src/lib/serviceWorker/cacheNames.ts`
- Create: `src/lib/clearSessionData.ts`
- Test: `src/lib/clearSessionData.test.ts`
- Modify: `pages/logout.page.tsx:18-23`
- Modify: `src/lib/apollo/client.ts:47-51`
- Modify: `src/components/Layouts/Primary/TopBar/Items/ProfileMenu/ProfileMenu.tsx:163-172` (stop impersonating) and `:408-411` (sign out)
- Modify: `src/components/Layouts/Primary/NavBar/NavTools/ProfileMenuPanel/ProfileMenuPanel.tsx:202-205`
- Modify: `src/components/Settings/integrations/Organization/ConnectOrganization.tsx:227-230`
- Test: `src/lib/apollo/client.test.ts`, `ProfileMenu.test.tsx`, `ProfileMenuPanel.test.tsx`, `ConnectOrganization.test.tsx`, new `pages/logout.test.tsx`

**Interfaces:**

- Produces: `CACHE_PREFIX = 'mpdx'`, `KEEP_ON_SIGN_OUT_PREFIXES: readonly string[]` (`['mpdx-precache']`), `shouldKeepOnSignOut(cacheName: string): boolean` in `cacheNames.ts`. No imports from `serwist` in this file; the worker imports it too.
- Produces: `clearSessionData(client: ApolloClient<unknown>): Promise<void>` in `src/lib/clearSessionData.ts`.

- [ ] **Step 1: Write the failing helper tests** in `src/lib/clearSessionData.test.ts`. Mock `src/lib/dataDog`. Stub `window.caches` with `keys`/`delete` jest fns, and restore it after each test.

```ts
describe('clearSessionData', () => {
  it('clears Datadog, localStorage, the Apollo store and non-kept caches', async () => {
    window.localStorage.setItem('apollo-cache-persist', '{}');
    keys.mockResolvedValue([
      'mpdx-precache-v2-https://mpdx.org/',
      'mpdx-runtime',
      'other',
    ]);
    await clearSessionData(client);
    expect(clearDatadogUser).toHaveBeenCalled();
    expect(window.localStorage.length).toBe(0);
    expect(client.clearStore).toHaveBeenCalled();
    expect(deleteCache.mock.calls).toEqual([['mpdx-runtime'], ['other']]);
  });

  it('keeps going when a step throws', async () => {
    client.clearStore.mockRejectedValue(new Error('in flight'));
    keys.mockRejectedValue(new Error('denied'));
    await expect(clearSessionData(client)).resolves.toBeUndefined();
    expect(window.localStorage.length).toBe(0);
  });

  it('skips Cache Storage when the browser has none', async () => {
    delete (window as Partial<Window>).caches;
    await expect(clearSessionData(client)).resolves.toBeUndefined();
    expect(client.clearStore).toHaveBeenCalled();
  });
});

describe('shouldKeepOnSignOut', () => {
  it.each([
    ['mpdx-precache-v2-https://mpdx.org/', true],
    ['mpdx-runtime', false],
    ['serwist-precache-v2-https://mpdx.org/', false],
  ])('%s -> %s', (name, keep) => expect(shouldKeepOnSignOut(name)).toBe(keep));
});
```

- [ ] **Step 2:** `yarn test src/lib/clearSessionData.test.ts` → FAIL (module not found).
- [ ] **Step 3: Implement** `cacheNames.ts` and `clearSessionData.ts`. Order: `clearDatadogUser()`, `localStorage.clear()`, `await client.clearStore()`, then `caches.keys()` → `Promise.all` of `caches.delete` for names where `!shouldKeepOnSignOut`. Wrap each step in its own try/catch. Add a one-line comment noting MPDX-10169 adds the persistor purge here.
- [ ] **Step 4:** `yarn test src/lib/clearSessionData.test.ts` → PASS.
- [ ] **Step 5: Write the failing path tests.** In each test file, `jest.mock('src/lib/clearSessionData')` (resolves `undefined`) and assert it was called with the Apollo client _before_ `signOut`. Use `invocationCallOrder`:

```ts
expect(clearSessionData).toHaveBeenCalled();
expect(signOut).toHaveBeenCalledWith({ callbackUrl: 'signOut' });
expect(
  (clearSessionData as jest.Mock).mock.invocationCallOrder[0],
).toBeLessThan((signOut as jest.Mock).mock.invocationCallOrder[0]);
```

- `pages/logout.test.tsx` (new): render the page in `GqlMockedProvider` and assert the above.
- `client.test.ts`: new test `'clears session data then signs out on AUTHENTICATION_ERROR'`. Make the mocked `batchLink` return `{ errors: [{ message: 'x', extensions: { code: 'AUTHENTICATION_ERROR' } }] }` and assert the order with `signOut` called with `{ redirect: true, callbackUrl: 'signOut' }`.
- `ProfileMenu.test.tsx`: extend `'Ensure Sign Out is called with callback'` with the order assertion. New test `'clears session data before stopping impersonation'` asserts `clearSessionData` was called and `window.location.href` ends with `/api/stop-impersonating` (render with an impersonating session).
- `ProfileMenuPanel.test.tsx` and `ConnectOrganization.test.tsx`: same order assertion on their sign-out click.
- [ ] **Step 6:** Run those five test files → the new assertions FAIL.
- [ ] **Step 7: Switch each path** to `await clearSessionData(client); signOut(...)` (make the handler `async`; in `client.ts` wrap it in an async IIFE inside the `forEach`). Drop the now-unused `clearDatadogUser` imports. In `handleStopImpersonating`, replace `window.localStorage.clear()` with `await clearSessionData(client)`.
- [ ] **Step 8:** Run the five test files plus `src/lib/clearSessionData.test.ts` → PASS. Then `yarn lint:ts`.
- [ ] **Step 9: Commit**

```bash
git add src/lib/serviceWorker/cacheNames.ts src/lib/clearSessionData.ts src/lib/clearSessionData.test.ts pages/logout.page.tsx pages/logout.test.tsx src/lib/apollo/client.ts src/lib/apollo/client.test.ts src/components/Layouts/Primary/TopBar/Items/ProfileMenu src/components/Layouts/Primary/NavBar/NavTools/ProfileMenuPanel src/components/Settings/integrations/Organization
git commit -m "MPDX-10165 - Add a shared sign-out cleanup helper"
```

---

### Task 2: Clear session data when impersonation starts

**Files:**

- Modify: `src/components/Settings/Admin/ImpersonateUser/ImpersonateUserAccordion.tsx:84-91`
- Modify: `src/components/Settings/Organization/ImpersonateUser/ImpersonateUserAccordion.tsx` (same `status === 200` branch)
- Test: both `ImpersonateUserAccordion.test.tsx` files

**Interfaces:**

- Consumes: `clearSessionData(client)` from Task 1. Get `client` with `useApolloClient()`. Both tests already render inside `GqlMockedProvider`.

- [ ] **Step 1: Write the failing tests** in each file, with `jest.mock('src/lib/clearSessionData')`:
  - `'clears session data before redirecting to login'`: with the 200 fetch mock, submit, then `await waitFor(() => expect(clearSessionData).toHaveBeenCalled())` and assert its call order is before `push('/login')`.
  - `'keeps session data when impersonation fails'`: fetch resolves `{ status: 400, json: () => ({ errors: [{ detail: 'nope' }] }) }`; after the error snackbar shows, `expect(clearSessionData).not.toHaveBeenCalled()`.
- [ ] **Step 2:** `yarn test ImpersonateUserAccordion` → the first test FAILS in both files.
- [ ] **Step 3:** In each 200 branch, `await clearSessionData(client)` before `push('/login')`. Add `client` to the `useCallback` deps.
- [ ] **Step 4:** `yarn test ImpersonateUserAccordion` → PASS.
- [ ] **Step 5: Commit**

```bash
git add src/components/Settings/Admin/ImpersonateUser src/components/Settings/Organization/ImpersonateUser
git commit -m "MPDX-10165 - Clear session data when impersonation starts"
```

---

### Task 3: Replace next-pwa with Serwist

**Files:**

- Modify: `package.json` (remove `next-pwa`; add `@serwist/next`, `serwist`, `@serwist/window` at `^9`; `lint:ts` → `tsc && tsc -p src/sw`), `yarn.lock`
- Modify: `next.config.ts:5,193-201`
- Modify: `tsconfig.json` (`"exclude": ["node_modules", "src/sw"]`)
- Create: `src/sw/tsconfig.json`
- Create: `src/sw/index.ts`
- Create: `src/lib/serviceWorker/register.ts`
- Test: `src/lib/serviceWorker/register.test.ts`
- Modify: `pages/_app.page.tsx` (one `useEffect` in `App`)

**Interfaces:**

- Consumes: `CACHE_PREFIX` from Task 1.
- Produces: `registerServiceWorker(): Serwist | undefined` (`Serwist` type from `@serwist/window`) in `register.ts`; a global `Window['serwist']?: Serwist` declaration (in `register.ts` or `app.d.ts`). MPDX-10164 builds on the returned instance.
- Produces: `src/sw/index.ts` constructs `new Serwist({ precacheEntries: self.__SW_MANIFEST, cacheId: CACHE_PREFIX, skipWaiting: false, clientsClaim: false, navigationPreload: false, runtimeCaching: [] })` and calls `addEventListeners()`. Task 4 replaces `[]`.

- [ ] **Step 1: Dependencies, worker and config.** `yarn remove next-pwa && yarn add @serwist/next@^9 serwist@^9 @serwist/window@^9`.
  - Write `src/sw/index.ts` per Interfaces with `declare const self: ServiceWorkerGlobalScope & SerwistGlobalConfig & { __SW_MANIFEST: (PrecacheEntry | string)[] | undefined }` (types from `serwist`).
  - `src/sw/tsconfig.json` extends `../../tsconfig.json`, sets `lib: ["esnext", "webworker"]`, `types: ["@serwist/next/typings", "jest"]`, `include: ["./**/*.ts", "../lib/serviceWorker/cacheNames.ts"]`, `exclude: []`. Add `src/sw` to the root `exclude`.
  - In `next.config.ts`, replace `withPWA` with `import withSerwistInit from '@serwist/next'` and put `withSerwistInit({ ...options })` in the `withPlugins` list where `[withPWA, {...}]` was. `withSerwistInit(options)` returns a `(nextConfig) => nextConfig` plugin. Options, exactly as the spec's "Precache manifest" section: `swSrc: 'src/sw/index.ts'`, `swDest: 'public/sw.js'`, `register: false`, `reloadOnOnline: false`, `disable: !prod`, `globPublicPatterns: ['icons/**', 'images/**', 'manifest.json']`, and `exclude` = the default list copied from `node_modules/@serwist/next` (find the schema default) plus `/\.map$/`.
- [ ] **Step 2: ESM check.** Run `JWT_SECRET=x yarn build`. If Next can't load the ESM-only package from the compiled config, convert to `export default async () => { const { default: withSerwistInit } = await import('@serwist/next'); ... }` and rebuild. Record which one worked in the commit message body.
- [ ] **Step 3: Write the failing test** `src/lib/serviceWorker/register.test.ts`:

```ts
it('registers through the injected window.serwist', () => {
  const register = jest.fn();
  window.serwist = { register } as unknown as Serwist;
  expect(registerServiceWorker()).toBe(window.serwist);
  expect(register).toHaveBeenCalledTimes(1);
});

it('does nothing when the worker is disabled', () => {
  delete window.serwist;
  expect(registerServiceWorker()).toBeUndefined();
});
```

- [ ] **Step 4:** `yarn test register.test.ts` → FAIL. Implement `register.ts` → PASS.
- [ ] **Step 5:** Call `registerServiceWorker()` in a mount-only `useEffect` in `App` in `pages/_app.page.tsx`.
- [ ] **Step 6: Verify.**
  - `yarn lint:ts` passes (both projects).
  - `JWT_SECRET=x yarn build` emits `public/sw.js`.
  - `grep -o '"url":"[^"]*"' public/sw.js | grep -E '\.map|/locales/|_next/data|\.html'` prints nothing.
  - `yarn test` passes.
- [ ] **Step 7: Commit**

```bash
git add package.json yarn.lock next.config.ts tsconfig.json src/sw src/lib/serviceWorker/register.ts src/lib/serviceWorker/register.test.ts pages/_app.page.tsx
git commit -m "MPDX-10161 - Replace next-pwa with Serwist"
```

---

### Task 4: Network-only rules in the service worker

**Files:**

- Create: `src/sw/networkOnly.ts`
- Create: `src/sw/runtimeCaching.ts`
- Test: `src/sw/networkOnly.test.ts`, `src/sw/runtimeCaching.test.ts` (both with `/** @jest-environment node */`)
- Modify: `src/sw/index.ts` (use `runtimeCaching`)

**Interfaces:**

- Produces: `isNetworkOnly({ url, request }: { url: URL; request: Pick<Request, 'mode'> }): boolean` in `networkOnly.ts`.
- Produces: `runtimeCaching: RuntimeCaching[]` (type from `serwist`) in `runtimeCaching.ts`, with `{ matcher: isNetworkOnly, handler: new NetworkOnly() }` at index 0.

- [ ] **Step 1: Write the failing tests.** `networkOnly.test.ts` uses `it.each` with a `cors`-mode request unless noted:

```ts
const match = (href: string, mode: RequestMode = 'cors') =>
  isNetworkOnly({ url: new URL(href, 'https://mpdx.org'), request: { mode } });

it.each([
  '/api/auth/session',
  '/api/auth/session?update',
  '/api/graphql',
  '/api/graphql-rest',
  'https://api.mpdx.org/graphql',
  'https://api.stage.mpdx.org/api/v2/user',
  '/_next/data/39rw2o9/accountLists/1/contacts.json?x=1',
])('%s is network-only', (href) => expect(match(href)).toBe(true));

it('treats every navigation as network-only', () =>
  expect(match('/accountLists/1/contacts', 'navigate')).toBe(true));

it.each([
  '/_next/static/chunks/main.js',
  '/icons/icon-192x192.png',
  '/locales/en/translation.json',
  'https://mpdx.org/apiary',
  'https://notapi.mpdx.org.evil.com/x',
])('%s is not network-only', (href) => expect(match(href)).toBe(false));
```

`runtimeCaching.test.ts`: `runtimeCaching[0].matcher` is `isNetworkOnly` and `runtimeCaching[0].handler` is a `NetworkOnly` instance.

- [ ] **Step 2:** `yarn test src/sw` → FAIL.
- [ ] **Step 3: Implement.** Paths match by `url.pathname` on same origin (`/api/auth/` prefix, exact `/api/graphql` and `/api/graphql-rest`, `/_next/data/` prefix). API hosts match when `url.hostname` starts with `api.` and is `mpdx.org` or ends with `.mpdx.org`. Wire `runtimeCaching` into `index.ts`.
- [ ] **Step 4:** `yarn test src/sw` → PASS. `yarn lint:ts` passes.
- [ ] **Step 5: Commit**

```bash
git add src/sw
git commit -m "MPDX-10165 - Keep auth, API, data and page requests network-only in the service worker"
```

---

### Task 5: Serve sw.js with no-cache

**Files:**

- Modify: `next.config.ts` (add `headers` to `config`)

- [ ] **Step 1:** Add `async headers()` returning `[{ source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] }]`.
- [ ] **Step 2: Verify.** `JWT_SECRET=x yarn build && yarn serve`, then `curl -sI http://localhost:3000/sw.js | grep -i cache-control` shows the value above.
- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "MPDX-10161 - Serve sw.js with no-cache"
```

The Amplify preview check (`curl -I <preview>/sw.js`) happens after the PR is pushed. If Amplify drops the header, add `customHttp.yml` in a follow-up commit.

---

### Task 6: Rollback docs

**Files:**

- Create: `docs/service-worker.md`

- [ ] **Step 1:** Write it with these sections: what the worker caches (precache only, keep list, network-only rules); how to check it in DevTools (Application > Service workers, Cache Storage); rollback. The rollback section includes this kill-switch worker as the replacement body of `src/sw/index.ts`:

```ts
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
      await self.registration.unregister();
      const windows = await self.clients.matchAll({ type: 'window' });
      windows.forEach((client) => client.navigate(client.url));
    })(),
  );
});
```

State that it must stay deployed until old workers are gone, and that removing the worker from the build alone leaves it installed in browsers.

- [ ] **Step 2:** `yarn prettier:check` passes.
- [ ] **Step 3: Commit**

```bash
git add docs/service-worker.md
git commit -m "MPDX-10161 - Document the service worker rollback plan"
```

---

### Task 7: Final verification

- [ ] `yarn test`, `yarn lint:ts`, `yarn lint:ci`, `yarn prettier:check` all pass.
- [ ] `yarn start`: in the browser, DevTools > Application > Service workers shows none for localhost.
- [ ] `JWT_SECRET=x yarn build && yarn serve`: worker activates; after visiting the dashboard and contacts, Cache Storage holds only `mpdx-precache-v2-...`; the cache name starts with `mpdx-precache` (confirms the keep list matches the real name); signing out leaves only that cache.
- [ ] Report anything not verified (for example the browser checks, if no browser was available) instead of claiming it.
