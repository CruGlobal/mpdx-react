# Apollo Cache IndexedDB Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In prod builds, persist the Apollo cache to IndexedDB (no size cap), restore it behind a Suspense gate that keeps the server-rendered page on screen, never persist while impersonating, and wipe it on every sign-out in every tab.

**Architecture:** A small `idb` wrapper (`idbStorage.ts`) stores the serialized cache and an owner tag `{ userId, version }`. `cachePersistence.ts` owns one paused `CachePersistor` and exposes start/pause/purge/stop; restore reads storage itself so a restore that loses the 3s timeout race never touches the live cache. `CacheRestoreGate` suspends on the start promise inside a `<Suspense>` in `GraphQLProviders`, and listens on a `BroadcastChannel` that `clearSessionData` posts to.

**Tech Stack:** Next 15 (Pages Router), React 18.2, Apollo Client 3, `apollo3-cache-persist` 0.14.1, `idb@^8`, next-auth 4, Jest + Testing Library, `fake-indexeddb` (dev only).

**Spec:** `docs/superpowers/specs/2026-10-20-apollo-indexeddb-persistence-design.md`

## Global Constraints

- Branch `MPDX-10169-apollo-indexeddb`. Commit subjects start with `MPDX-10169 - `.
- Persistence only when `typeof window !== 'undefined'`, `process.env.NODE_ENV === 'production'` and `typeof indexedDB !== 'undefined'`. Never fall back to localStorage.
- `CachePersistor` options: `maxSize: false`, `key: 'cache'`, default trigger and debounce. Call `pause()` right after constructing it.
- IndexedDB database `mpdx`, object store `apollo-cache`, keys `cache` and `owner`.
- Owner tag is `{ userId: session.user.userID, version: CACHE_VERSION }`, `CACHE_VERSION = 1`.
- Restore timeout is `3000` ms. The start promise never rejects.
- Legacy localStorage key `apollo-cache-persist` is removed on every start.
- Datadog reports use `addDatadogError(error, { mpdxErrorType: 'cache_persistence', step })`. Inside `clearSessionData`, `attempt()` keeps reporting as `clear_session_data`.
- BroadcastChannel name `mpdx-session`, message `'session-ended'`.
- Named exports only. `//` comments only for non-obvious "why".
- Run `yarn gql` before `yarn lint:ts` if generated files are missing.

## Review Focus

1. IndexedDB can't open (Firefox private window before 115, storage blocked by policy): start resolves, the gate opens, the error is reported, nothing is written to localStorage. Tests in Task 1 (operations reject) and Task 2 (start resolves and reports).
2. A write fails (`QuotaExceededError` on a big cache): no unhandled promise rejection reaches Rollbar; the failure is reported once per write. Test in Task 1.
3. The stored cache is corrupt (bad JSON from an interrupted write): start reports, clears storage and resolves with an empty cache instead of crashing the page. Test in Task 2.
4. Sign-out lands while the restore is still running: the restore must not resume persistence or write the owner tag afterwards. Test in Task 2.
5. Another tab's sign-out arrives while this tab has queries in flight (`clearStore()` rejects): no unhandled rejection, persistence still stops. Test in Task 4.

---

### Task 1: IndexedDB storage wrapper

**Files:**

- Modify: `package.json` (add `"idb": "^8"` to `dependencies`, `"fake-indexeddb": "^6"` to `devDependencies`), `yarn.lock`
- Create: `src/lib/apollo/persistence/idbStorage.ts`
- Test: `src/lib/apollo/persistence/idbStorage.test.ts`

**Interfaces:**

- Produces:
  - `interface CacheOwner { userId: string; version: number }`
  - `interface PersistedCacheStore extends PersistentStorage<string>` (from `apollo3-cache-persist`) adding:
    - `getOwner(): Promise<CacheOwner | null>`
    - `setOwner(owner: CacheOwner): Promise<void>`
    - `clear(): Promise<void>` (deletes both keys)
    - `disable(): Promise<void>` (later `setItem`/`setOwner` calls do nothing; resolves once writes already in progress finish)
  - `createIdbStorage(dbName = 'mpdx'): PersistedCacheStore`

- [ ] **Step 1: Add dependencies.** `yarn add idb@^8 && yarn add -D fake-indexeddb@^6`. Expected: lockfile keeps a single `idb@npm:8.x` resolution.

- [ ] **Step 2: Write the failing tests.** The file starts with `/** @jest-environment node */` (Node 22 has `structuredClone`, which `fake-indexeddb` needs), then `import 'fake-indexeddb/auto'`, `import { FDBObjectStore } from 'fake-indexeddb'` and `jest.mock('src/lib/dataDog')`. Each test uses a unique `dbName` (`` `test-${n++}` ``).

```ts
it('round-trips the cache and owner, and clear() removes both', async () => {
  const store = createIdbStorage(nextDb());
  await store.setItem('cache', '{"a":1}');
  await store.setOwner({ userId: 'user-1', version: 1 });
  expect(await store.getItem('cache')).toBe('{"a":1}');
  expect(await store.getOwner()).toEqual({ userId: 'user-1', version: 1 });
  await store.clear();
  expect(await store.getItem('cache')).toBeNull();
  expect(await store.getOwner()).toBeNull();
});

it('ignores writes after disable() and waits for in-progress writes', async () => {
  const store = createIdbStorage(nextDb());
  const inFlight = store.setItem('cache', 'before');
  await store.disable();
  await inFlight;
  await store.setItem('cache', 'after');
  await store.setOwner({ userId: 'user-1', version: 1 });
  expect(await store.getItem('cache')).toBe('before');
  expect(await store.getOwner()).toBeNull();
});

it('reports a failed write instead of rejecting', async () => {
  const error = new DOMException('full', 'QuotaExceededError');
  jest.spyOn(FDBObjectStore.prototype, 'put').mockImplementationOnce(() => {
    throw error;
  });
  const store = createIdbStorage(nextDb());
  await expect(store.setItem('cache', 'x')).resolves.toBeUndefined();
  expect(addDatadogError).toHaveBeenCalledWith(error, {
    mpdxErrorType: 'cache_persistence',
    step: 'write',
  });
});

it('rejects reads when the database cannot open', async () => {
  jest.spyOn(indexedDB, 'open').mockImplementationOnce(() => {
    throw new DOMException('blocked', 'SecurityError');
  });
  await expect(createIdbStorage(nextDb()).getItem('cache')).rejects.toThrow(
    'blocked',
  );
});
```

- [ ] **Step 3: Run to verify they fail.** `yarn test src/lib/apollo/persistence/idbStorage.test.ts`. Expected: FAIL, cannot find module `./idbStorage`.

- [ ] **Step 4: Implement `createIdbStorage`.** Open the DB lazily with `openDB(dbName, 1, { upgrade: db => db.createObjectStore('apollo-cache') })` and memoize the promise. Writes (`setItem`, `setOwner`) are added to a `Set<Promise>` synchronously when called (before the DB has opened) so `disable()` can `Promise.allSettled` them. Only `setItem` swallows and reports errors (the persistor's trigger calls it fire-and-forget); every other method lets errors reject.

- [ ] **Step 5: Run to verify they pass.** Same command. Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add package.json yarn.lock src/lib/apollo/persistence/idbStorage.ts src/lib/apollo/persistence/idbStorage.test.ts
git commit -m "MPDX-10169 - Add an IndexedDB store for the Apollo cache"
```

---

### Task 2: Persistence lifecycle

**Files:**

- Create: `src/lib/apollo/persistence/cachePersistence.ts`
- Test: `src/lib/apollo/persistence/cachePersistence.test.ts`

**Interfaces:**

- Consumes: `PersistedCacheStore`, `CacheOwner`, `createIdbStorage()` from Task 1.
- Produces:
  - `const CACHE_VERSION = 1`, `const RESTORE_TIMEOUT_MS = 3000`
  - `interface StartCachePersistenceOptions { cache: ApolloCache<NormalizedCacheObject>; userId: string; impersonating: boolean }`
  - `createCachePersistence(store: PersistedCacheStore | null, timeoutMs = RESTORE_TIMEOUT_MS)` returning `{ start(options): Promise<void>; pause(): void; purge(): Promise<void>; stop(): Promise<void> }`
  - The app singleton, built with `createIdbStorage()` when the Global Constraints check passes and `null` otherwise:
    - `isCachePersistenceEnabled(): boolean` (store is non-null)
    - `startCachePersistence(options): Promise<void>` (memoized: every call returns the first call's promise; never rejects)
    - `pauseCachePersistence(): void` (synchronous; marks stopped for the rest of the page and pauses the persistor)
    - `purgeCachePersistence(): Promise<void>` (awaits `store.disable()`, then `store.clear()`; rejects on failure so `attempt()` reports it)
    - `stopCachePersistence(): Promise<void>` (pause + purge; never rejects, reports with `step: 'stop'`)
  - All of these are no-ops that resolve when the store is `null`.

- [ ] **Step 1: Write the failing tests.** Use an in-memory `PersistedCacheStore` built from `jest.fn()`s over a `Map`, a real `InMemoryCache`, and `jest.mock('src/lib/dataDog')`. Call `createCachePersistence(store, 3000)` per test. Required cases:

```ts
it('removes the legacy localStorage key on start', ...);
  // localStorage 'apollo-cache-persist' set -> start({ impersonating: false }) -> key gone

it('restores, tags the owner, then persists new writes', ...);
  // store has cache JSON for { userId: 'user-1', version: 1 } -> start -> cache.extract() contains it,
  // setOwner called with { userId: 'user-1', version: 1 }; after cache.writeQuery + jest.advanceTimersByTime(1000), setItem('cache', ...) called

it('purges and never restores or persists while impersonating', ...);
  // start({ impersonating: true }) -> clear called, cache stays empty, a later write never calls setItem

it.each([
  ['another user', { userId: 'user-2', version: 1 }],
  ['an old version', { userId: 'user-1', version: 0 }],
  ['no owner', null],
])('purges a cache stored for %s before restoring', ...);
  // clear called before any cache.restore; cache stays empty

it('reports, purges and resolves when the stored cache is not JSON', ...);
  // getItem resolves 'not json' -> start resolves; addDatadogError(..., { mpdxErrorType: 'cache_persistence', step: 'start' }); clear called

it('resolves and reports when the store cannot be read', ...);
  // getOwner rejects -> start resolves; reported with step 'start'; nothing written to localStorage

it('opens after 3 seconds and leaves the live cache alone when restore finishes late', ...);
  // getItem returns a promise resolved manually; fake timers; advance 3000 -> start resolves, reported with step 'timeout';
  // then resolve getItem -> cache.extract() still empty, setOwner not called, later writes never persist

it('never resumes or tags after pause() lands mid-restore', ...);
  // getItem pending -> pause() -> resolve getItem -> start resolves; setOwner not called; writes never persist

it('ignores start() after stop()', ...);
  // await stop() -> start() -> getItem never called

it('purge() clears the store even when start() never ran', ...);
  // as in an impersonating tab or one whose gate hasn't mounted: purge() -> disable and clear called

it('returns the same promise for every start() call', ...);
```

- [ ] **Step 2: Run to verify they fail.** `yarn test src/lib/apollo/persistence/cachePersistence.test.ts`. Expected: FAIL, cannot find module.

- [ ] **Step 3: Implement `cachePersistence.ts`.** `start` order, all inside one try block with a `stopped`/`timedOut` check before each side effect (restore, setOwner, resume):
  1. `localStorage.removeItem('apollo-cache-persist')`
  2. if `impersonating`: `await stop()`, return
  3. build the persistor (`new CachePersistor({ cache, storage: store, maxSize: false, key: 'cache' })`) and `pause()` it
  4. `getOwner()`; if it doesn't equal `{ userId, version: CACHE_VERSION }`, `clear()`
  5. read `getItem('cache')` and call `cache.restore(JSON.parse(data))` yourself (not `persistor.restore()`) so the timed-out check can run between read and apply
  6. `setOwner(...)`, then `persistor.resume()`

  On any error: report with `step: 'start'`, then `stop()`. Race the work against a `setTimeout(timeoutMs)` that sets `timedOut`, reports `new Error('Apollo cache restore timed out')` with `step: 'timeout'`, and resolves. Clear the timer when the work wins.

- [ ] **Step 4: Run to verify they pass.** Same command. Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/lib/apollo/persistence/cachePersistence.ts src/lib/apollo/persistence/cachePersistence.test.ts
git commit -m "MPDX-10169 - Restore and persist the Apollo cache through IndexedDB"
```

---

### Task 3: Sign-out wipes the persisted cache and tells other tabs

**Files:**

- Create: `src/lib/apollo/persistence/sessionChannel.ts`
- Test: `src/lib/apollo/persistence/sessionChannel.test.ts`
- Modify: `src/lib/clearSessionData.ts:33-41`
- Test: `src/lib/clearSessionData.test.ts`

**Interfaces:**

- Consumes: `pauseCachePersistence`, `purgeCachePersistence` from Task 2.
- Produces:
  - `broadcastSessionEnded(): void` (posts `'session-ended'` on `mpdx-session`, then closes the channel; no-op without `BroadcastChannel`)
  - `onSessionEnded(listener: () => void): () => void` (returns an unsubscribe that closes the channel; no-op function without `BroadcastChannel`)

- [ ] **Step 1: Write the failing tests.**
  - `sessionChannel.test.ts`: stub `window.BroadcastChannel` with a fake class that records `postMessage` and lets the test fire `onmessage`. Cases: posts `'session-ended'` on `mpdx-session`; the listener runs for `'session-ended'` and not for other messages; unsubscribe closes the channel; both functions are no-ops when `BroadcastChannel` is undefined.
  - `clearSessionData.test.ts`: add `jest.mock('src/lib/apollo/persistence/cachePersistence')` and `jest.mock('src/lib/apollo/persistence/sessionChannel')`, then:

```ts
it('pauses persistence before clearing the store and purges after', async () => {
  await clearSessionData(client);
  const order = (fn: unknown) => (fn as jest.Mock).mock.invocationCallOrder[0];
  expect(order(pauseCachePersistence)).toBeLessThan(order(clearStore));
  expect(order(purgeCachePersistence)).toBeGreaterThan(order(clearStore));
  expect(broadcastSessionEnded).toHaveBeenCalled();
});

it.each([
  [
    'pauseCachePersistence',
    () =>
      (pauseCachePersistence as jest.Mock).mockImplementationOnce(() => {
        throw new Error('x');
      }),
  ],
  [
    'purgeCachePersistence',
    () =>
      (purgeCachePersistence as jest.Mock).mockRejectedValueOnce(
        new Error('x'),
      ),
  ],
  [
    'broadcast',
    () =>
      (broadcastSessionEnded as jest.Mock).mockImplementationOnce(() => {
        throw new Error('x');
      }),
  ],
])('reports a failing %s step and still runs the rest', async (step, fail) => {
  fail();
  await clearSessionData(client);
  expect(addDatadogError).toHaveBeenCalledWith(expect.any(Error), {
    mpdxErrorType: 'clear_session_data',
    step,
  });
  expect(clearStore).toHaveBeenCalled();
  expect(deleteCache).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run to verify they fail.** `yarn test src/lib/apollo/persistence/sessionChannel.test.ts src/lib/clearSessionData.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement.** Write `sessionChannel.ts`. In `clearSessionData`, replace the `// MPDX-10169` placeholder so the steps are, each in `attempt(stepName, ...)`: `clearDatadogUser`, `pauseCachePersistence`, `localStorage`, `clearStore`, `purgeCachePersistence`, `caches`, `broadcast`.

- [ ] **Step 4: Run to verify they pass.** Same command, plus `yarn test src/lib/apollo src/components/Settings pages/logout.test.tsx` to confirm the existing sign-out tests still pass. Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/lib/apollo/persistence/sessionChannel.ts src/lib/apollo/persistence/sessionChannel.test.ts src/lib/clearSessionData.ts src/lib/clearSessionData.test.ts
git commit -m "MPDX-10169 - Purge the persisted cache on sign-out in every tab"
```

---

### Task 4: Restore gate in GraphQLProviders and drop the old persistence

**Files:**

- Create: `src/components/CacheRestoreGate/CacheRestoreGate.tsx`
- Test: `src/components/CacheRestoreGate/CacheRestoreGate.test.tsx`
- Modify: `pages/_app.page.tsx:59-74` (`GraphQLProviders`)
- Modify: `src/lib/apollo/client.ts:4,24-30` (remove `persistCache`, `LocalStorageWrapper` and the top-level `await`; keep the module-level `const cache = createCache()`)

**Interfaces:**

- Consumes: `isCachePersistenceEnabled`, `startCachePersistence`, `stopCachePersistence` (Task 2); `onSessionEnded` (Task 3).
- Produces: `CacheRestoreGate: React.FC<{ children: React.ReactNode }>`.

- [ ] **Step 1: Write the failing tests.** Mock both persistence modules. Render inside `GqlMockedProvider` (or `ApolloProvider` with a test client) and `<Suspense fallback={<div>fallback</div>}>`; the session comes from the global `next-auth/react` mock in `__tests__/util/setup.ts` (override `useSession` for the impersonating case). Cases:
  - disabled (`isCachePersistenceEnabled` returns `false`): children render on the first render, no fallback, `startCachePersistence` not called.
  - enabled: shows the fallback until the promise from `startCachePersistence` resolves, then the children; called with `{ cache: client.cache, userId: 'user-1', impersonating: false }`.
  - enabled and `impersonating: true`: `stopCachePersistence` called.
  - a `session-ended` message (fire the listener captured from `onSessionEnded`): `stopCachePersistence` and the client's `clearStore` called.
  - a `session-ended` message while `clearStore` rejects: no unhandled rejection (spy on `addDatadogError`, expect it called with `step: 'clearStore'`).
  - unmount calls the unsubscribe from `onSessionEnded`.

- [ ] **Step 2: Run to verify they fail.** `yarn test src/components/CacheRestoreGate`. Expected: FAIL.

- [ ] **Step 3: Implement `CacheRestoreGate`.** Read `userID` and `impersonating` from `useRequiredSession()` and the client from `useApolloClient()`. When enabled, suspend on the start promise with a module-level `WeakSet` of settled promises: if the promise isn't in the set, attach `.then(() => settled.add(promise))` and `throw promise` (React 18; switch to `use()` on React 19). Effects: stop persistence when `impersonating` is true; subscribe with `onSessionEnded(() => { void stopCachePersistence(); client.clearStore().catch(error => addDatadogError(error, { mpdxErrorType: 'cache_persistence', step: 'clearStore' })); })`. The gate never suspends on the server or when disabled.

- [ ] **Step 4: Wire it in.** In `GraphQLProviders`, render `<Suspense fallback={<Loading loading />}><CacheRestoreGate>...</CacheRestoreGate></Suspense>` inside `ApolloProvider` and around `SetupProvider` (so no query runs before restore). Remove the old persistence from `client.ts`.

- [ ] **Step 5: Run to verify they pass.** `yarn test src/components/CacheRestoreGate src/lib pages`. Expected: PASS.

- [ ] **Step 6: Full checks.** `yarn lint:ts`, `yarn lint`, `yarn test`. Expected: all clean. `grep -rn "persistCache\|LocalStorageWrapper" src pages` returns nothing.

- [ ] **Step 7: Commit.**

```bash
git add src/components/CacheRestoreGate pages/_app.page.tsx src/lib/apollo/client.ts
git commit -m "MPDX-10169 - Gate the app on the IndexedDB cache restore"
```

---

### Task 5: Manual check on a prod build

No code. Run on the PR's preview deploy (or `yarn build && yarn serve` locally with prod env). Record the results in the PR description.

- [ ] Cache survives a reload: DevTools > Application > IndexedDB > `mpdx` > `apollo-cache` has `cache` and `owner`.
- [ ] Full page load with CPU throttled 6x: the server-rendered layout and page stay on screen until the restore finishes; no hydration warnings in the console; no fallback spinner.
- [ ] Each sign-out path (profile menu, nav panel, `/logout`, ConnectOrganization link, an expired token) leaves the store empty and no `apollo-cache-persist` key in localStorage.
- [ ] Two tabs: sign out in one, click around in the other; the store stays empty.
- [ ] Impersonate: the store and localStorage hold no Apollo data, and a reload restores none.
