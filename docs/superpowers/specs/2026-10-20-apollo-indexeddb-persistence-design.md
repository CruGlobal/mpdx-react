# Persist the Apollo cache to IndexedDB

Date: 2026-10-20
Ticket: MPDX-10169. Epic MPDX-10160.
Branch: `MPDX-10169-apollo-indexeddb`, based on `main` after PR #2156 (MPDX-10161/10165)
merged, which added the shared sign-out helpers in `src/lib/clearSessionData.ts`.

## Why

Showing contacts offline needs the Apollo cache to survive in the browser. Today
`src/lib/apollo/client.ts` persists it to localStorage with `apollo3-cache-persist`
(prod only) through a top-level `await persistCache(...)`. That has three problems:

- localStorage tops out around 5MB, too small for a contact list plus opened contacts.
- It starts at module load, before the session is known, so it restores and persists
  data while an admin is impersonating another user.
- `client.clearStore()` on sign-out doesn't touch the persisted copy, and other open tabs
  keep writing their in-memory cache back after a sign-out in one tab.

## Goals

- In prod builds the cache is stored in IndexedDB with no size cap and survives a reload.
- Every sign-out path (all of them already run `clearSessionData`) leaves no Apollo data
  in IndexedDB and no old cache key in localStorage.
- Signing out in one tab stops every other open tab from writing the cache back.
- While impersonating, nothing is restored or persisted, and a reload restores nothing.
- Dev (`yarn start`) and Jest keep working with no persistence.

## Non-goals

- Any offline UI or offline behavior (later tickets, e.g. MPDX-10172).
- Cache eviction, size budgets, or encrypting the stored cache.
- Changing what the service worker caches.

## Anti-goals

- Impersonated user data ending up on the admin's machine, even briefly.
- Data from one signed-in user being restored for a different user.
- A broken or slow IndexedDB leaving the app stuck non-interactive or on a spinner.
- Losing the server-rendered layout and page that users see today while the JS loads.

## Decisions

- **Never persist while impersonating.** Evaluated against "cache it, then clear it when
  impersonation ends": the cleanup only runs when the admin clicks Stop Impersonating or
  signs out. Closing the tab or letting the session expire would leave the other user's
  data on disk. Both approaches need the session before deciding anything, so skipping
  persistence costs nothing extra and has no gap.
- **Restore is gated in `GraphQLProviders`** (`pages/_app.page.tsx`), not at module load,
  because that's the first place `session.user.impersonating` is known.
- **The gate uses Suspense so the server-rendered page stays on screen.** Today the
  server renders the full layout and page (the top-level `await` is skipped there), the
  browser shows that HTML right away, and hydration waits for the restore. That must not
  change: users keep seeing the server-rendered shell, non-interactive, until the
  restore finishes. `GraphQLProviders` wraps its children in `<Suspense>`, and a child
  suspends on the restore promise while hydrating. React 18 keeps a suspended
  boundary's server HTML in place during hydration and hydrates it once the promise
  resolves. The fallback is the existing `<Loading loading />` spinner, shown only when
  React can't keep the server HTML (see the Gate section).
- Rejected alternatives:
  - Rendering a spinner instead of the children until ready: the server would have to
    render the spinner too (or hydration mismatches), so the server-rendered shell is
    lost on every full page load.
  - Hydrating right away and holding only Apollo requests: `restore()` replaces the whole
    in-memory cache and would clobber anything already written.
  - Reading the session from `window.__NEXT_DATA__` at module load and keeping a
    top-level `await`: works, but depends on a Next.js internal and runs outside React.
- Login, 404 and 500 pages are unaffected (they don't render `GraphQLProviders`).

## Design

### Persistor module: `src/lib/apollo/cachePersistor.ts`

Owns the single `CachePersistor` for the module-level cache in `client.ts` (move
`createCache()` into a place both can import, or have `client.ts` pass the cache in;
builder's choice). Built only when `typeof window !== 'undefined'` and
`process.env.NODE_ENV === 'production'`. Jest mocks the module.

- Created with default options plus **`maxSize: false`** (the `CachePersistor` default
  is 1MB). `apollo3-cache-persist` 0.14.1 has no "start paused" option, so call `pause()`
  right after constructing it; nothing writes until the session check passes.
- Storage: IndexedDB only, through a small `PersistentStorage` wrapper over `idb`
  (already in the lockfile at 8.0.3 through Serwist; add it as a direct dependency) with
  its own database and store (e.g. database `mpdx`, store `apollo-cache`). If IndexedDB
  isn't available, persistence is off; it must never fall back to localStorage. _(My
  call: `idb` over `localforage`/`idb-keyval` because it's already shipped and
  IndexedDB-only.)_
- **Owner and version tag.** Next to the cache, store `{ userId, version }`, where
  `userId` is `session.user.userID` and `version` is a hand-bumped constant in the module
  (start at 1). Bump it when a type policy or merge function changes in a way old data
  would break. _(My call: build SHA was rejected because the epic deploys to prod often
  and offline support needs the cache to survive deploys.)_
- `startCachePersistence({ userId, impersonating })`: idempotent per page load.
  1. Remove the legacy localStorage key `apollo-cache-persist`.
  2. If `impersonating`, purge storage and stay stopped.
  3. If the stored tag doesn't match `userId` and `version`, purge before going on.
     This covers sessions that ended without `clearSessionData` running (expiry while the
     browser was closed, an Okta sign-out elsewhere, `RouterGuard` sending the user to
     `/login`), so one user's data is never restored for another.
  4. `restore()`, write the tag, then `resume()`.
  5. If any step throws, report to Datadog, purge, and continue without persistence.
  6. **Timeout** _(my call)_: if steps 1-4 haven't finished within 3 seconds, open the
     gate anyway, report to Datadog, and turn persistence off for this page. A `restore()`
     that finishes late must not touch the live cache (check a flag before applying, or
     restore into a scratch cache and discard it).
     The returned promise always settles within the timeout so the gate always opens.
- `stopCachePersistence()`: `pause()`, wait for any `persist()` already in progress to
  finish (otherwise it can write after the purge), then `purge()`, and mark the
  persistor stopped for the rest of this page's life. Nothing may resume it afterwards,
  including a later `startCachePersistence` call. A page that has seen a sign-out or
  impersonation change never persists again until it is reloaded.
- `purge()` must delete the stored entry even in a tab where persistence never started
  (for example an impersonating tab), so storage is cleared regardless.
- `purge()` gives up after the same 3 seconds and rejects, so a stuck IndexedDB can't
  keep sign-out from reaching `signOut`. `stop()` still never rejects; it reports.
- Each tab closes its database connection when another tab needs to upgrade it
  (`blocking` handler), so an upgrade is never stuck behind an open tab.
- **Owner-checked writes.** Once the owner is tagged, each cache write reads the stored
  owner in the same transaction and only writes if it still matches. On a mismatch
  (another user signed in from another tab) the tab stops writing for good.

### Gate: Suspense boundary in `GraphQLProviders`

- `GraphQLProviders` keeps `ApolloProvider` and the client as today and renders:
  `<Suspense fallback={<Loading loading />}><CacheRestoreGate>{children}</CacheRestoreGate></Suspense>`
  (names are the builder's call). The boundary renders on the server too, so the
  server HTML carries its markers.
- `CacheRestoreGate` reads `userID` and `impersonating` from `useRequiredSession()`.
  - On the server and outside prod it never suspends and just renders `children`.
  - In prod in the browser it gets the single restore promise from
    `startCachePersistence(...)` (memoized in the persistor module, so every render sees
    the same promise) and suspends on it until it settles. On React 18 that means
    throwing the pending promise and tracking its settled state; switch to `use()` when
    the app moves to React 19. The promise never rejects (failures and the timeout
    resolve it), so the gate never throws into an error boundary.
- **Fallback cases.** React drops the server HTML and shows the fallback spinner if a
  context or prop above the boundary changes before the restore finishes (for example
  `SessionProvider` updating the session). That's acceptable; it's never worse than a
  spinner. It's also expected when `GraphQLProviders` first mounts after a client-side
  navigation rather than a full load, where the spinner may flash briefly. Keep
  `GraphQLProviders`' parents from updating during the first render where it's cheap to
  do so (stable props, no state set on mount).
  - React counts any new context value above the boundary, even one nothing inside
    reads. Rollbar's `Provider` hands down a new value every time it renders, so the
    providers above `GraphQLProviders` live in a memoized `AppProviders` component
    whose props (the session and memoized page content) don't change between renders.
    The emotion cache and Rollbar config are created once at module level.
  - The date picker `LocalizationProvider` sits under the gate (and around the page on
    the login and error pages) because its labels change when translations load. That
    also means `App` no longer uses `useTranslation`, so loading translations doesn't
    re-render it.
- If `impersonating` becomes true while mounted, call `stopCachePersistence()` from an
  effect (defense in depth; the impersonation start path already runs
  `clearSessionData`).
- If the session's `userID` changes from the one the gate first rendered with, it does
  the same, plus `client.clearStore()`.

### Sign-out helper: `src/lib/clearSessionData.ts`

Replace the `// MPDX-10169` placeholder so the order is:

1. `clearDatadogUser`
2. pause the persistor (via `stopCachePersistence`'s pause step, before `clearStore` so
   clearing doesn't trigger a write)
3. `localStorage.clear()`
4. `client.clearStore()`
5. purge the persisted cache
6. delete caches (unchanged)
7. broadcast "session ended" to other tabs

Each step stays wrapped in `attempt(...)` so one failure doesn't skip the rest. Exact
split of steps 2 and 5 is the builder's call as long as pause comes before `clearStore`
and purge comes after it.

### Cross-tab cleanup

- `clearSessionData` posts a message on a `BroadcastChannel` (e.g. `mpdx-session`).
  Skip silently where `BroadcastChannel` doesn't exist.
- Every tab that renders `GraphQLProviders` listens. On the message it runs
  `stopCachePersistence()` and `client.clearStore()` for its own client. It does not
  re-run `clearSessionData` (no rebroadcast loops) and does not navigate; the tab's next
  request will hit the normal auth error handling.
- The persistence module also listens, from the moment `startCachePersistence` begins.
  The gate's listener only starts once the restore finishes, so without this a sign-out
  during the restore would be missed. On the message it runs `stopCachePersistence()`,
  which aborts a restore in progress before it tags the owner or resumes.
- This covers impersonation start/stop too, because those paths call `clearSessionData`.
  Impersonation through the handoff cookie in `pages/login.page.tsx` doesn't call
  `clearSessionData`; it's covered by the start-time purge and the hook's check when
  `impersonating` flips.
- A stale tab whose request hits `AUTHENTICATION_ERROR` runs `signOutAndClear`, which
  wipes storage and signs out. That also ends any newer session in another tab, because
  the next-auth cookie is shared, so wiping that tab's cache is correct.

### Removing the old code

Drop `persistCache` and `LocalStorageWrapper` from `client.ts` and the top-level `await`.

## Testing

Unit tests (Jest, persistor module mocked where it isn't the subject):

- `cachePersistor`: legacy key removed on start; impersonating purges and never
  restores/resumes; normal start restores then resumes; restore failure purges, reports,
  and resolves; after `stopCachePersistence`, a later start does nothing.
- `clearSessionData`: pause happens before `clearStore`, purge after; broadcast is posted;
  each new step failing is reported and the rest still run.
- Cross-tab listener: a message pauses/purges and clears the store without broadcasting.
- `CacheRestoreGate`: in prod mode, children don't render (fallback shows) until the
  restore promise settles, then they render; outside prod children render on the first
  render with no fallback; persistence stops when `impersonating` flips to true.

Manual check on a prod build (preview deploy):

- Cache survives a reload (IndexedDB entry present).
- On a full page load the server-rendered layout and page stay on screen until the
  restore finishes (throttle the CPU or add a delay to see it), with no hydration
  warnings and no fallback spinner.
- Every sign-out path leaves no IndexedDB entry and no `apollo-cache-persist` key.
- Two tabs: sign out in one, keep using the other; IndexedDB stays empty.
- Impersonate: IndexedDB and localStorage hold no Apollo data, and a reload restores none.

## Left to the builder

- Where `createCache()` lives so both `client.ts` and the persistor share one cache.
- IndexedDB database/store names and the BroadcastChannel name.
- Whether the cross-tab listener lives in the hook or the persistor module.
- Test file layout.
