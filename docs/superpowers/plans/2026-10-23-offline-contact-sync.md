# Offline Contact Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When MPDX runs as the installed app, sync every active contact for the open account list into the persisted Apollo cache once a week, and give the Contacts page an offline mode that browses that synced list.

**Architecture:** A small offline sync framework (`src/lib/offlineSync/`) runs registered sync types from one `OfflineSync` component inside `CacheRestoreGate`. Each run is guarded by a Web Lock, pages through a query with the normal Apollo client, flushes the cache persistor, then writes a sync record (time + query hash) to a new `offline-sync` IndexedDB object store. The Contacts page reads `?offline=true` to switch its list to a cache-only read of the synced query.

**Tech Stack:** Next.js 15 pages router, React 18, Apollo Client 3 (`InMemoryCache`, `apollo3-cache-persist`), `idb`, MUI v7, Jest + React Testing Library, `fake-indexeddb`.

**Spec:** `docs/superpowers/specs/2026-10-22-offline-contact-sync-design.md`

## Global Constraints

- Named exports only; components as `export const Name: React.FC<Props> = ...`.
- All user-visible text through `useTranslation()`. User-visible copy says "cached contacts", never "offline contacts": button `Show Cached Contacts`, indicator `Showing cached contacts`.
- URL parameter is exactly `offline=true`.
- `CONTACTS_SYNC_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000`; `CONTACTS_SYNC_PAGE_SIZE = 100`. Each sync type owns its own interval constant.
- Sync version = hash of the printed sync query document (fragments included). No hand-set version constant.
- Sync errors: `addDatadogError(error, { mpdxErrorType: 'offline_sync', syncType })`. No UI for the sync.
- Never sync while impersonating, in a browser tab, offline, or with cache persistence disabled.
- Run `yarn gql` after every `.graphql` change. Import generated hooks/documents from `.generated.ts`.
- `//` comments only for a non-obvious "why". Match surrounding code style.
- Commit messages: `MPDX-10188 - <summary>` ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Run single test files with `yarn test <path>`.

## Review Focus

- **Account list switched mid-sync:** the first sync keeps running and records under its own account list key, never the new one. Test in Task 7.
- **A page request fails partway through a large sync:** no sync record is written, and pages already fetched stay cached. Test in Task 4.
- **A contact with no status (`null`):** counts as active and appears in the cached list. Test in Task 9.
- **A re-sync after a week:** the first page (no `after`) replaces the old merged list instead of appending duplicates. Test in Task 6.
- **A note typed right before the connection drops:** the debounced save must not fire offline and lose the text. It saves after reconnecting. Test in Task 12.

---

### Task 1: `useIsStandalone()` hook

**Files:**

- Create: `src/hooks/useIsStandalone.ts`
- Test: `src/hooks/useIsStandalone.test.ts`

**Interfaces:**

- Produces: `useIsStandalone(): boolean`

- [ ] **Step 1: Write the failing tests** following `src/hooks/useIsOnline.test.ts` (`renderHook` from `@testing-library/react-hooks`). Stub `window.matchMedia` per test with a fake `MediaQueryList` whose `matches` you control and whose `addEventListener('change', cb)` stores `cb`.
  - `returns true when display-mode is standalone` (`matches: true`) → `true`
  - `returns false in a browser tab` (`matches: false`, `navigator.standalone` undefined) → `false`
  - `returns true when iOS navigator.standalone is true` (`matches: false`, `Object.defineProperty(navigator, 'standalone', { value: true, configurable: true })`) → `true`
  - `updates when the display mode changes`: start `false`, set `matches = true`, call the stored `change` callback inside `act` → `true`
  - `returns false when rendered on the server` (`renderToString`, as in the `useIsOnline` test) → `false`

- [ ] **Step 2:** Run `yarn test src/hooks/useIsStandalone.test.ts`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement `useIsStandalone()`** with `useSyncExternalStore`. The query is `'(display-mode: standalone)'`. The snapshot is `matchMedia(query).matches || navigator.standalone === true`. Subscribe to the media query's `change` event. The server snapshot is `false`. Add `standalone?: boolean` to `Navigator` with a `declare global` in the same file.

- [ ] **Step 4:** Re-run the test. Expected: PASS.

- [ ] **Step 5: Commit** `MPDX-10188 - Add useIsStandalone hook`.

---

### Task 2: Restore size and time logging

**Files:**

- Modify: `src/lib/dataDog.ts` (Window `DD_RUM` type at lines 13-23; add a helper next to `addDatadogError`)
- Modify: `src/lib/apollo/persistence/cachePersistence.ts` (`restore` / `restoreWithTimeout`)
- Test: `src/lib/dataDog.test.ts`, `src/lib/apollo/persistence/cachePersistence.test.ts`

**Interfaces:**

- Produces: `addDatadogAction(name: string, context?: Record<string, unknown>): void`

- [ ] **Step 1: Write failing tests.**
  - `dataDog.test.ts` › `addDatadogAction forwards to DD_RUM.addAction`: with `DATADOG_CONFIGURED='true'` and `window.DD_RUM = { onReady: cb => cb(), addAction: jest.fn(), ... }`, calling `addDatadogAction('x', { a: 1 })` → `addAction` called with `('x', { a: 1 })`.
  - `cachePersistence.test.ts` (it already mocks `src/lib/dataDog`):
    - `logs restore duration and size`: store seeded with `storedCache`. After `start()` resolves, `addDatadogAction` is called with `('cache_restore', { durationMs: expect.any(Number), sizeBytes: storedCache.length, timedOut: false })`.
    - `logs a timed-out restore`: `getItem` never resolves. After `advance(RESTORE_TIMEOUT_MS)`, it's called with `('cache_restore', expect.objectContaining({ timedOut: true }))`.
    - `does not log when nothing is stored`: empty store → `addDatadogAction` not called.

- [ ] **Step 2:** Run both test files. Expected: FAIL.

- [ ] **Step 3: Implement.** Add `addAction: (name: string, context?: Record<string, unknown>) => void` to the `DD_RUM` type. `addDatadogAction` uses `whenDatadogReady`, like `addDatadogError`. In `cachePersistence.ts`, time from the start of `restoreWithTimeout` with `performance.now()`. `restore` records the stored string's length once `getItem` returns, and `restoreWithTimeout` logs once after the race. On a timeout, it logs `timedOut: true` with whatever size is known (possibly `undefined`). If the read finished with no data and didn't time out, it skips logging.

- [ ] **Step 4:** Re-run. Expected: PASS.

- [ ] **Step 5: Commit** `MPDX-10188 - Log Apollo cache restore duration and size`.

---

### Task 3: Sync records store, clear, and flush

**Files:**

- Modify: `src/lib/apollo/persistence/idbStorage.ts`
- Modify: `src/lib/apollo/persistence/cachePersistence.ts`
- Test: `src/lib/apollo/persistence/idbStorage.test.ts`, `src/lib/apollo/persistence/cachePersistence.test.ts`

**Interfaces:**

- Produces (idbStorage.ts):
  - `export interface SyncRecord { syncedAt: number; version: string }`
  - `PersistedCacheStore.getSyncRecord(key: string): Promise<SyncRecord | null>`
  - `PersistedCacheStore.setSyncRecord(key: string, record: SyncRecord): Promise<void>`
- Produces (cachePersistence.ts, app-level exports; all no-ops returning `null`/`false` when the store is `null`):
  - `flushCachePersistence(): Promise<boolean>`: `true` only if the persistor is running and `persist()` finished
  - `readSyncRecord(key: string): Promise<SyncRecord | null>`
  - `writeSyncRecord(key: string, record: SyncRecord): Promise<void>`
  - The return object of `createCachePersistence` gains `flush`, `readSyncRecord`, `writeSyncRecord`.

- [ ] **Step 1: Write failing tests** in `idbStorage.test.ts` (fake-indexeddb, as existing):
  - `round-trips a sync record when the owner matches`: `setOwner(owner)`, `bindOwner(owner)`, `setSyncRecord('contacts:a', { syncedAt: 1, version: 'v' })` → `getSyncRecord('contacts:a')` equals it.
  - `does not write a sync record without a bound owner`, and `... when the stored owner differs` → `getSyncRecord` returns `null`.
  - `does not write a sync record after disable()` → `null`.
  - `clear() removes sync records with the cache and owner` → all three are `null` afterward.
  - `upgrades a version 1 database without losing the cache`: create db `nextDb()` at version 1 with only `apollo-cache` holding `cache` = `'{"a":1}'` (via `openDB` directly), close it, then `createIdbStorage(name).getItem('cache')` → `'{"a":1}'`, and `getSyncRecord('x')` → `null`.
- [ ] **Step 2: Write failing tests** in `cachePersistence.test.ts` (extend `createStore` with `getSyncRecord`/`setSyncRecord` backed by its map):
  - `flush persists the cache and returns true once started`: after `start()`, write to the cache, `await flush()` → `true`, and `setItem` was called with `'cache'`.
  - `flush returns false after stop()` → `false`.
  - `every reset path clears sync records`: for owner mismatch on restore, `stop()`, and `purge()`, the store's `clear` is called. (`clear` itself is covered above.)
- [ ] **Step 3:** Run both files. Expected: FAIL.
- [ ] **Step 4: Implement.**
  - `openDB(dbName, 2, { upgrade(db, oldVersion) { ... } })` creates `apollo-cache` when `oldVersion < 1` and `offline-sync` when `oldVersion < 2`.
  - `setSyncRecord` runs a `readwrite` transaction over both stores: it reads `owner` from `apollo-cache`, writes only if `boundOwner` matches it, and goes through `trackWrite` so `disable()` waits for it and blocks it.
  - `clear()` uses one transaction over both stores: delete `cache` and `owner`, and `offline-sync` `.clear()`.
  - `flush` returns `false` when `cancelled()` or there's no persistor; otherwise it awaits `persistor.persist()` and returns `true`.
- [ ] **Step 5:** Re-run. Expected: PASS.
- [ ] **Step 6: Commit** `MPDX-10188 - Store offline sync records in their own IndexedDB store`.

---

### Task 4: Offline sync runner

**Files:**

- Create: `src/lib/offlineSync/offlineSync.ts`
- Test: `src/lib/offlineSync/offlineSync.test.ts`

**Interfaces:**

- Consumes: `readSyncRecord`, `writeSyncRecord`, `flushCachePersistence`, `SyncRecord` (Task 3).
- Produces:

  ```ts
  export interface OfflineSyncDefinition {
    type: string;
    document: DocumentNode; // hashed for the version
    intervalMs: number;
    run: (args: {
      client: ApolloClient<object>;
      accountListId: string;
      signal: AbortSignal;
    }) => Promise<void>;
  }
  export type OfflineSyncResult =
    | 'skipped'
    | 'completed'
    | 'aborted'
    | 'failed';
  export const hashDocument: (document: DocumentNode) => string;
  export const syncVersion: (definition: OfflineSyncDefinition) => string;
  export const syncRecordKey: (type: string, accountListId: string) => string; // `${type}:${accountListId}`
  export const isSyncDue: (
    record: SyncRecord | null,
    version: string,
    intervalMs: number,
    now: number,
  ) => boolean;
  export const runOfflineSync: (args: {
    definition: OfflineSyncDefinition;
    client: ApolloClient<object>;
    accountListId: string;
    signal: AbortSignal;
    now?: () => number;
  }) => Promise<OfflineSyncResult>;
  ```

- [ ] **Step 1: Write failing tests** (mock `src/lib/apollo/persistence/cachePersistence` and `src/lib/dataDog`):
  - `hashDocument` is stable for the same document, and changes when a field is added to a fragment the query spreads.
  - `isSyncDue`: `null` record → `true`; `syncedAt = now - intervalMs + 1` with matching version → `false`; `syncedAt = now - intervalMs` → `true`; version mismatch → `true`.
  - `runOfflineSync`:
    - `skips when not due` → `'skipped'`, `run` not called.
    - `runs, flushes, then records` → `'completed'`. `writeSyncRecord` is called with `('contacts:a', { syncedAt: now(), version: syncVersion(def) })` after `flushCachePersistence`.
    - `does not record when run rejects` → `'failed'`, `writeSyncRecord` not called, `addDatadogError` called with `expect.anything(), { mpdxErrorType: 'offline_sync', syncType: 'contacts' }`.
    - `does not record when aborted` (abort inside `run`) → `'aborted'`, no write, no Datadog error.
    - `does not record when flush returns false` → `'failed'`.
    - `skips when the lock is held`: stub `navigator.locks.request` to call back with `null` → `'skipped'`.
    - `re-checks the record after acquiring the lock`: `readSyncRecord` returns `null` first, then a fresh record → `'skipped'`.
    - `uses an in-page guard without navigator.locks`: two concurrent calls for the same key → one `'completed'`, one `'skipped'`.
- [ ] **Step 2:** Run `yarn test src/lib/offlineSync/offlineSync.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.** `hashDocument` = FNV-1a 32-bit over `print(document)` from `graphql`, as a hex string. `runOfflineSync` order: check due, then `navigator.locks.request('mpdx-offline-sync:' + key, { ifAvailable: true }, cb)` (or the module-level `Set` guard), then re-check due, `run`, return `'aborted'` if `signal.aborted`, `flushCachePersistence()`, `writeSyncRecord`.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5: Commit** `MPDX-10188 - Add offline sync runner`.

---

### Task 5: Partner Accounts label built in the frontend

**Files:**

- Modify: `src/components/Contacts/ContactDetails/ContactDetailsTab/PartnerAccounts/ContactPartnerAccounts.graphql` (drop `displayName`)
- Modify: `src/components/Contacts/ContactDetails/ContactDetailsTab/PartnerAccounts/ContactDetailsPartnerAccounts.tsx` (remove `fetchPolicy: 'no-cache'` and its comment at 59-64; add a `contactName` prop or read the name from the parent's data)
- Modify: the caller of `ContactDetailsPartnerAccounts` in `ContactDetailsTab.tsx` to pass the contact's `name`
- Create: `src/components/Contacts/ContactDetails/ContactDetailsTab/PartnerAccounts/partnerAccountLabel.ts`
- Test: `partnerAccountLabel.test.ts`, existing `ContactDetailsPartnerAccounts.test.tsx`

**Interfaces:**

- Produces: `partnerAccountLabel(contactName: string | null | undefined, accountNumber: string): string`

- [ ] **Step 1: Write failing tests.**
  - `partnerAccountLabel('', '123')` → `'123'`
  - `partnerAccountLabel('Smith (123)', '123')` → `'Smith (123)'`
  - `partnerAccountLabel('Smith', '123')` → `'Smith (123)'`
  - `partnerAccountLabel('Smith', '')` → `'Smith'`
  - In `ContactDetailsPartnerAccounts.test.tsx`, update the mocks so the row shows `partnerAccountLabel(contactName, accountNumber)`. Add a test, `loading partner accounts does not change displayName elsewhere`: write `DonorAccount:1` with `displayName: 'Donor Name'` to the cache, render, then `cache.readFragment` still returns `'Donor Name'`.
- [ ] **Step 2:** Run `yarn gql`, then the tests. Expected: FAIL.
- [ ] **Step 3: Implement** to the rules above (mirrors `mpdx_api/app/decorators/donor_account_decorator.rb`). The query uses the default fetch policy.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5: Commit** `MPDX-10188 - Build partner account labels in the frontend so they can be cached`.

---

### Task 6: Contacts sync query, fragments, and cache redirect

**Files:**

- Modify: `src/components/Contacts/ContactDetails/ContactDetailsTab/ContactDetailsTab.graphql`: move the inline `id name tagList user { firstName lastName }` plus the three spreads into `fragment ContactDetailsTabContact on Contact`, and the query spreads it
- Modify: `src/components/Contacts/ContactDetails/ContactNotesTab/ContactNotesTab.graphql`: `fragment ContactNotes on Contact { id notes notesSavedAt }`, and the query spreads it
- Create: `src/lib/offlineSync/contacts/OfflineContacts.graphql`
- Create: `src/lib/offlineSync/contacts/contactsSync.ts`
- Modify: `src/lib/apollo/cache.ts` (`Query.fields`: add `contact` read policy next to `userOption` at ~117)
- Test: `src/lib/offlineSync/contacts/contactsSync.test.ts`, `src/lib/apollo/cache.test.ts` (create if missing)

**Interfaces:**

- Consumes: `OfflineSyncDefinition` (Task 4).
- Produces (`contactsSync.ts`):
  ```ts
  export const CONTACTS_SYNC_TYPE = 'contacts';
  export const CONTACTS_SYNC_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
  export const CONTACTS_SYNC_PAGE_SIZE = 100;
  export const contactsSyncVariables: (
    accountListId: string,
  ) => OfflineContactsQueryVariables; // no `after`
  export const contactsSync: OfflineSyncDefinition;
  ```
- Produces: `OfflineContactsDocument`, `OfflineContactsQuery`, `useOfflineContactsQuery` from `OfflineContacts.generated.ts`.

`OfflineContacts.graphql`:

```graphql
query OfflineContacts(
  $accountListId: ID!
  $contactsFilters: ContactFilterSetInput
  $after: String
  $first: Int
) {
  contacts(
    accountListId: $accountListId
    contactsFilter: $contactsFilters
    after: $after
    first: $first
  ) {
    nodes {
      id
      avatar
      contactPhase
      ...ContactRow
      ...ContactDetailsHeader
      ...ContactDetailsTabContact
      ...ContactPartnerAccounts
      ...ContactNotes
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
```

`contactsSyncVariables` = `{ accountListId, contactsFilters: { status: [ContactFilterStatusEnum.Active] }, first: CONTACTS_SYNC_PAGE_SIZE }`.

- [ ] **Step 1: Write failing tests.**
  - `cache.test.ts` › `contact(id) reads a contact written by another query`: write a `Contact` through a `contacts` query, then `readQuery` of `contact(accountListId, id) { id name }` returns it.
  - `contactsSync.test.ts` (Apollo client with a mock link that returns 2 pages):
    - `fetches every page`: requests have `after: undefined`, then `after: 'cursor-1'`, all with `contactsFilters: { status: ['ACTIVE'] }` and `first: 100`. Afterward, `cache.readQuery({ query: OfflineContactsDocument, variables: contactsSyncVariables('a') })` has both pages' nodes.
    - `a new sync replaces the merged list`: run once with nodes `[1, 2]`, then again with nodes `[3]` → the read returns only `[3]`.
    - `stops between pages when aborted`: abort after page 1 → the second request is never sent.
    - `details read from synced data`: after a sync, `readQuery` of `GetContactDetailsHeaderDocument` (with `loadDuplicate: false`), `ContactDetailsTabDocument`, `ContactDonorAccountsDocument`, and `GetContactNotesDocument` for a synced id all return non-null data. Build the page responses with the repo's `gqlMock` helper in `__tests__/util/graphqlMocking` so every fragment field is filled.
- [ ] **Step 2:** Run `yarn gql`, then the tests. Expected: FAIL.
- [ ] **Step 3: Implement.** The `contact` read policy is `(_, { args, toReference }) => args?.id && toReference({ __typename: 'Contact', id: args.id })`. `contactsSync.run` loops `client.query({ query: OfflineContactsDocument, variables: { ...contactsSyncVariables(accountListId), after }, fetchPolicy: 'network-only', context: { fetchOptions: { signal } } })` until `!hasNextPage`, returning early when `signal.aborted`. If the "replaces" test fails because of `relayStylePaginationWithNodes`, fix it in `contactsSync.run` by evicting the field first (`cache.evict({ fieldName: 'contacts', args: contactsSyncVariables(accountListId) })`), not by changing the shared policy.
- [ ] **Step 4:** Re-run the tests plus `yarn test src/components/Contacts/ContactDetails`. Expected: PASS.
- [ ] **Step 5: Commit** `MPDX-10188 - Add contacts offline sync query`.

---

### Task 7: `OfflineSync` component

**Files:**

- Create: `src/components/OfflineSync/OfflineSync.tsx`
- Create: `src/lib/offlineSync/definitions.ts`
- Modify: `pages/_app.page.tsx` (`GraphQLProviders`, inside `<DefaultAccountListRedirect>` so `'_'` is already resolved)
- Test: `src/components/OfflineSync/OfflineSync.test.tsx`

**Interfaces:**

- Consumes: `runOfflineSync` (Task 4), `contactsSync` (Task 6), `useIsStandalone` (Task 1), `useIsOnline`, `useRequiredSession`, `useOptionalAccountListId`, `isCachePersistenceEnabled`.
- Produces: `offlineSyncDefinitions: OfflineSyncDefinition[]` (currently `[contactsSync]`); `OfflineSync: React.FC` (renders `null`).

- [ ] **Step 1: Write failing tests** (mock `runOfflineSync`, the hooks, and `isCachePersistenceEnabled`; fake timers; stub `window.requestIdleCallback`):
  - `runs each definition for the open account list when idle` → `runOfflineSync` is called with `{ definition: contactsSync, accountListId: 'a' }` only after the idle callback fires.
  - One test per off condition, each with `runOfflineSync` not called: browser tab, offline, impersonating, persistence disabled, no account list.
  - `falls back to setTimeout without requestIdleCallback`.
  - `aborts a running sync when the device goes offline`: the passed `signal.aborted` becomes `true`.
  - `keeps the previous account list's sync running after switching`: rerender with account list `'b'` → the first call's signal is not aborted, and a second call is made for `'b'`.
  - `aborts on unmount`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3: Implement.** Keep one `AbortController` per account list in a ref. Abort all when eligibility (standalone, online, not impersonating, persistence enabled) turns false, or on unmount. Don't abort on an account list change. Run the definitions one after another. Use `requestIdleCallback(cb, { timeout: 10000 })`, with `setTimeout(cb, 2000)` as the fallback.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5: Commit** `MPDX-10188 - Run offline syncs from the installed app`.

---

### Task 8: Offline mode and cached-contacts availability hooks

**Files:**

- Create: `src/hooks/useOfflineMode.ts`
- Create: `src/hooks/useCachedContactsAvailable.ts`
- Test: next to each

**Interfaces:**

- Produces:
  - `useOfflineMode(): boolean`: `router.query.offline === 'true'` and the URL is not Flows or Map (`query.contactId?.[0]` is not `TableViewModeEnum.Flows`/`Map`). Flows and Map ignore the parameter.
  - `useCachedContactsAvailable(accountListId: string): boolean | undefined`: `undefined` while reading. `true` when `readSyncRecord(syncRecordKey(CONTACTS_SYNC_TYPE, accountListId))` exists and its `version === syncVersion(contactsSync)`. Re-reads when `useIsOnline()` changes.

- [ ] **Step 1: Write failing tests:** `useOfflineMode` for `'true'`, missing, `'false'`, and `'true'` on a Flows URL and a Map URL (both `false`). `useCachedContactsAvailable` for no record → `false`, matching version → `true`, stale version → `false`, `undefined` before the read resolves, and a re-read after going online.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5: Commit** `MPDX-10188 - Add offline mode hooks`.

---

### Task 9: Cached contacts list in offline mode

**Files:**

- Modify: `pages/accountLists/[accountListId]/contacts/ContactsWrapper.tsx` (effective view mode)
- Modify: `src/components/Contacts/ContactsContext/ContactsContext.tsx`
- Modify: `src/components/Contacts/ContactsList/ContactsList.tsx`
- Modify: `src/components/Contacts/ContactRow/ContactRow.tsx` (add `hideCheckbox?: boolean`)
- Test: `ContactsContext.test.tsx`, `ContactsList` test (create if missing), `ContactRow.test.tsx`, `ContactsWrapper.test.tsx`

**Interfaces:**

- Consumes: `useOfflineMode` (Task 8), `useOfflineContactsQuery` and `contactsSyncVariables` (Task 6), `useContactPartnershipStatuses().getContactStatusesByPhase(PhaseEnum.Archive)` for the inactive statuses (same source as `ContactsMapPanel.tsx:106`; the constants are cached on every online launch by `<Announcements />`). If that returns an empty list (constants not cached), no contacts are filtered out.
- Produces:
  - `ContactsType` gains `offlineMode: boolean`, `cachedContacts: ContactRowFragment[]`, `cachedContactsLoading: boolean`.

- [ ] **Step 1: Write failing tests.**
  - ContactsContext: with `offline=true`, `useOfflineContactsQuery` runs with `contactsSyncVariables(accountListId)` and `fetchPolicy: 'cache-only'`. `useContactsQuery` and `useGetIdsForMassSelectionQuery` are skipped (`toHaveGraphqlOperation` not called). `cachedContacts` drops a contact with status `NOT_INTERESTED` and keeps contacts with `PARTNER_FINANCIAL` and `null` (constants mocked with `LoadConstantsMock`). With the constants query returning no phases, all three are kept.
  - ContactsList in offline mode renders the cached contacts' names, hides row checkboxes, and doesn't call `fetchMore` on `endReached`. With no cached data, it shows `NullState`.
  - ContactRow: `hideCheckbox` hides the checkbox.
  - ContactsWrapper: with `offline=true` and a saved `contacts_view` of Flows, the effective `viewMode` is List and the preference isn't written.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4:** Re-run, plus `yarn test pages/accountLists/\[accountListId\]/contacts`. Expected: PASS.
- [ ] **Step 5: Commit** `MPDX-10188 - Show cached contacts in offline mode`.

---

### Task 10: Disable controls offline, and leave offline mode on filter changes

**Files:**

- Modify: `src/components/Shared/Header/ListHeader.tsx` (props at 70-84: add `filtersDisabled?: boolean`, `hideSelection?: boolean`)
- Modify: `src/components/Shared/SearchBox/SearchBox.tsx` (add `disabled`)
- Modify: `src/components/Shared/Header/StarFilterButton/StarFilterButton.tsx` (add `disabled`)
- Modify: `src/components/Shared/MassActions/ContactsMassActionsDropdown.tsx` (add `disabled`, pass to `MassActionsDropdown` at 134)
- Modify: `src/components/Contacts/ContactsMainPanel/ContactsMainPanelHeader.tsx` (Flows/Map `ToggleButton`s at 83-95)
- Modify: `src/components/Shared/Filters/FilterPanel.tsx` (add `disabled?: boolean` and `clearAllDisabled?: boolean`; apply `inert` to the root `Box` at 574; Clear All at 610-620)
- Modify: `src/components/Contacts/ContactsLeftPanel/ContactsLeftPanel.tsx`
- Modify: `src/components/Shared/UrlFiltersProvider/UrlFiltersProvider.tsx` (add `offlineMode?: boolean`)
- Modify: `pages/accountLists/[accountListId]/contacts/ContactsWrapper.tsx` (pass `offlineMode`; wrap `setViewMode`)
- Test: `ListHeader.test.tsx`, `FilterPanel.test.tsx`, `UrlFiltersProvider.test.tsx`, `ContactsMainPanelHeader.test.tsx`, `ContactsWrapper.test.tsx`

**Interfaces:**

- Consumes: `useIsOnline`, `useOfflineMode`, `ContactsType.offlineMode`.

Behavior, where `offline` is the device being offline:

| Control                        | Disabled when             | Hidden when  |
| ------------------------------ | ------------------------- | ------------ |
| Filter toggle, search, starred | `offline`                 |              |
| Flows, Map buttons             | `offline`                 |              |
| Actions menu                   | `offline`                 | offline mode |
| Select-all + row checkboxes    |                           | offline mode |
| Filter panel (whole)           | `offline`                 |              |
| Filter panel Clear All         | `offline` or offline mode |              |

`UrlFiltersProvider` with `offlineMode`:

- Initial `activeFilters` is `{}` and `searchTerm` is `''`, ignoring the URL. Because of that, the existing URL-write effect drops `filters`/`searchTerm` from the URL as soon as offline mode starts. That's equivalent to "ignored, then dropped on leaving" (implementation choice).
- Any call to `setActiveFilters`, `setSearchTerm`, or `setStarred` applies the change and removes `offline` from the URL with the same shallow `router.replace`.

`ContactsWrapper`: in offline mode, picking Flows or Map removes `offline` from the query, then sets the view mode as usual (the preference updates).

- [ ] **Step 1: Write failing tests** for every row of the table (online vs. offline, online mode vs. offline mode). Plus, `UrlFiltersProvider`:
  - `ignores URL filters in offline mode`: query `{ offline: 'true', filters: '{"status":["PARTNER_FINANCIAL"]}' }` → `combinedFilters` is `{ wildcardSearch: '' }`.
  - `leaves offline mode on a filter change`: `setActiveFilters({ starred: true })` → `router.replace` called with a query that has no `offline` and `filters: '{"starred":true}'`.
  - `leaves offline mode when starred is toggled` → `replace` is called without `offline`.
  - The debounced search does the same (advance 500ms).
  - `ContactsWrapper`: picking Map in offline mode removes `offline`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4:** Re-run, plus `yarn test src/components/Shared src/components/Contacts src/components/Tasks` (FilterPanel and ListHeader are shared with Tasks and Appeals). Expected: PASS.
- [ ] **Step 5: Commit** `MPDX-10188 - Disable Contacts filters offline and exit offline mode on changes`.

---

### Task 11: Show Cached Contacts button, indicator, and automatic switch

**Files:**

- Modify: `src/components/Contacts/ContactsMainPanel/ContactsMainPanelHeader.tsx`
- Create: `pages/accountLists/[accountListId]/contacts/useAutoOfflineMode.ts` (called from `ContactsWrapper`)
- Test: `ContactsMainPanelHeader.test.tsx`, `useAutoOfflineMode.test.ts`

**Interfaces:**

- Consumes: `useCachedContactsAvailable`, `useOfflineMode` (Task 8), `useIsOnline`.
- Produces: `useAutoOfflineMode(accountListId: string): void`

Rules:

- **Button** `t('Show Cached Contacts')` shows when `!isOnline && !offlineMode && cachedAvailable === true`. Clicking it calls `router.push({ pathname, query: { ...query without filters/searchTerm, offline: 'true' } }, undefined, { shallow: true })`.
- **Indicator** `t('Showing cached contacts')` shows whenever `offlineMode`, online or not.
- **Automatic switch** (`useAutoOfflineMode`) is evaluated once per page mount, the first time `cachedAvailable` is no longer `undefined`. It switches only if the device was offline at mount, offline mode is off, the URL has no `filters` and no `searchTerm`, the URL isn't Flows or Map (`query.contactId?.[0]` is not `flows`/`map`), and `cachedAvailable === true`. It calls `router.replace` with `offline: 'true'` added (keeping `contactId`), shallow. Going offline after mount never switches.

- [ ] **Step 1: Write failing tests.**
  - Button: shown only in that one combination (cover all 8 combinations of offline / offline mode / available). The click pushes `{ accountListId: 'a', offline: 'true' }`, dropping `filters`.
  - Indicator: shown in offline mode while online and while offline, never in online mode.
  - `useAutoOfflineMode`:
    - Replaces when offline at mount with no filters and cached contacts available.
    - Doesn't switch with `filters`, with `searchTerm`, on a Flows URL, when not available, when online at mount, or when the device goes offline after mount.
    - Runs at most once.
    - Keeps `contactId`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5: Commit** `MPDX-10188 - Add Show Cached Contacts and the automatic offline switch`.

---

### Task 12: Read-only contact details offline

**Files:**

- Modify: `src/components/Contacts/ContactDetails/ContactDetailsHeader/ContactDetailsHeader.tsx` (`loadDuplicate` at ~92; edit partnership button at 182-190)
- Modify: `src/components/Contacts/StarContactIconButton/StarContactIconButton.tsx` (24-45)
- Modify: `.../ContactDetailsMoreActions/ContactDetailsMoreActions.tsx` (trigger at 202-209)
- Modify: `.../ContactDetailsTab/People/ContactDetailsTabPeople.tsx` (edit at 176-181, Add Person at 279, merge at 293-318)
- Modify: `.../ContactDetailsTab/Mailing/ContactDetailsTabMailing.tsx` (Add Address at 104, edit at 124-131 and 177-184)
- Modify: `.../ContactDetailsTab/ContactDetailsTab.tsx` (Other edit at 117-123)
- Modify: `.../ContactDetailsTab/Tags/ContactTags.tsx` (chip delete 154-160, autocomplete 176, save 199)
- Modify: `.../PartnerAccounts/ContactDetailsPartnerAccounts.tsx` (add 136, submit 169-175, delete 207-214)
- Modify: `.../ContactTasksTab/ContactTasksTab.tsx` (task buttons 177-205, mass actions 206)
- Modify: `.../ContactNotesTab/ContactNotesTab.tsx` (debounced save at 43-63, TextField at 69-77)
- Test: next to each modified component

**Interfaces:**

- Consumes: `useIsOnline`.

- [ ] **Step 1: Write failing tests.** For each component above, add one `disables <control> while offline` test that mocks `useIsOnline` to `false` and asserts the control is disabled (the tags autocomplete `input` is disabled). Then:
  - Header: `requests no duplicates while offline`, with the `GetContactDetailsHeader` operation called with `loadDuplicate: false`.
  - Notes, Review Focus: type `'abc'`, go offline before the 500ms debounce → `UpdateContactNotes` is not called. Go online → it's called once with `notes: 'abc'`. The field is disabled while offline and keeps `'abc'`.
- [ ] **Step 2:** Run `yarn test src/components/Contacts/ContactDetails src/components/Contacts/StarContactIconButton`. Expected: FAIL.
- [ ] **Step 3: Implement.** `loadDuplicate` also requires `isOnline`. Notes keeps the latest unsaved text in a ref. The debounced save returns early while offline, and an effect saves the pending text when `isOnline` turns `true`.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5: Commit** `MPDX-10188 - Make contact details read-only while offline`.

---

### Task 13: Full verification

- [ ] **Step 1:** Run `yarn gql`, then `yarn lint` and `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 2:** Run `yarn test`. Expected: all suites pass.
- [ ] **Step 3:** Run `yarn extract`. Check the diff size: only the new strings (`Show Cached Contacts`, `Showing cached contacts`, plus any added) should change. If unrelated keys churn, commit only the new keys.
- [ ] **Step 4:** Manual check in a production build (`yarn build && yarn serve` or the Amplify preview), installed as an app: sync runs once (Network tab shows `OfflineContacts` pages), DevTools > Application > IndexedDB `mpdx` has an `offline-sync` record, going offline and opening Contacts lands on `?offline=true` with the indicator, and an unseen contact opens to the header, Details, and Notes. Report what was and wasn't checked.
- [ ] **Step 5: Commit** any locale changes: `MPDX-10188 - Add translations for cached contacts`.
