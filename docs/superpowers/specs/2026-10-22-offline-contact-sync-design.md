# Sync active contacts for offline use in the installed app

Date: 2026-10-22
Ticket: MPDX-10188. Epic MPDX-10160.
Branch: `MPDX-10188-offline-contact-sync`, based on `main` after MPDX-10169 (Apollo
IndexedDB persistence, PR #2162) and MPDX-10172 (Contacts opens offline, PR #2163) merged.

## Why

Offline mode only shows data the user already happened to load. If they never opened a
contact, or never scrolled past the first page of the list, it isn't in the Apollo cache,
so it isn't persisted (MPDX-10169) and isn't there offline.

Users who install MPDX and open it from the app icon are the ones who expect it to work
offline. A browser tab, which may be on a shared computer, must not download extra data
in the background.

## Goals

- When MPDX runs as the installed app and is online, it syncs every active contact in the
  open account list (list row data, contact header, Details tab, Notes tab) into the Apollo
  cache, at most once a week per account list.
- The Contacts page has an explicit offline mode that shows the synced list, so a user who
  goes offline can browse and open any active contact without having viewed it first.
- The sync machinery supports more sync types later (tasks, etc.) with their own timers.

## Non-goals

- Syncing any data other than contacts.
- Tasks, Donations, and Referrals tabs offline. Only the header, Details tab, and Notes tab
  are synced.
- Offline support for the Flows and Map views. Map is a planned follow-up.
- Editing anything offline, or any mass action offline. The details panel and mass actions
  are disabled while offline instead (see below).
- Any UI for the sync itself (progress, "last synced", errors).
- A size guard or any change to how the cache is persisted. `apollo3-cache-persist` stores
  the whole cache as one JSON string that must load within `RESTORE_TIMEOUT_MS` (3s); past
  that, persistence is off for the session and cached contacts come up empty. A big account
  could hit that. Accepted for now: MPDX-10192 will store the cache as one IndexedDB record
  per normalized entity, in its own namespace. Until then, the restore logging below tracks
  the risk.

## Anti-goals

- Syncing while impersonating, or in a browser tab, even if the app is also installed on
  that device.
- Slowing startup: the sync must not compete with the first page render.
- A fresh sync time recorded for data that isn't actually in the persisted cache, which
  would block the next sync for a week while offline mode shows nothing.
- Two syncs for the same account list running at once, in one window or across windows.

## Decisions

### `useIsStandalone()`

New hook in `src/hooks/`, following `useIsOnline` (`useSyncExternalStore`). True when
`window.matchMedia('(display-mode: standalone)')` matches (our manifest uses
`"display": "standalone"`) or `navigator.standalone` is true (iOS Safari). Subscribes to the
media query's `change` event, since the display mode can change while the page is open.
Server snapshot is `false`.

### When a sync runs

A single component, mounted inside `CacheRestoreGate` in `GraphQLProviders`
(`pages/_app.page.tsx`) so it only renders after the cache restore finishes, owns all sync
types. A sync type starts only when **all** of these hold:

- `useIsStandalone()` is true.
- `useIsOnline()` is true.
- Not impersonating (`session.user.impersonating`).
- Cache persistence is enabled (`isCachePersistenceEnabled()`); off in dev and without
  IndexedDB, since there'd be nowhere to keep the data.
- An account list is open (`useAccountListId()`), and it's not the `_` placeholder.
- The sync is due for that sync type + account list (see "Sync records").
- The browser is idle (`requestIdleCallback`, falling back to a short `setTimeout` where it's
  missing, e.g. Safari).

It only syncs the open account list. When the user switches account lists, the newly opened
list is checked and synced if due. A sync already running for the previous account list
keeps going to completion and records its own time.

If any condition stops holding mid-sync (goes offline, starts impersonating), the sync
stops and does not record a time. Errors are reported to Datadog with
`mpdxErrorType: 'offline_sync'` and not shown to the user.

### Sync records

- One record per **sync type + account list id**, e.g. type `contacts`, account list `abc`.
- Each record holds the time the last sync **finished** and the sync type's **version**.
- A sync is due when there's no record, the record is older than that sync type's interval,
  or the stored version doesn't match the current one.
- **Each sync type has its own interval constant**, defined with that sync type rather than
  shared. Contacts uses `CONTACTS_SYNC_INTERVAL_MS`, set to one week. Future sync types
  (tasks, etc.) bring their own.
- **Version is computed, not hand-set:** a hash of the sync type's printed query document,
  fragments included. Any field added to or removed from the sync query (including through
  a shared fragment) changes the hash, so the next launch re-syncs. There's no manual
  version constant. Type policy changes are covered by the existing `CACHE_VERSION`.
- Records live in their **own object store** in the `mpdx` IndexedDB database (e.g.
  `offline-sync`), not in the `apollo-cache` store. This means bumping the database version
  in `idbStorage.ts` from 1 to 2 and creating the store in `upgrade`, keeping
  `apollo-cache` as is. MPDX-10192 will later give the Apollo entries their own namespace
  too, so other data can share the database.
- Records must be wiped in every case the cache is: sign-out, a different user, a
  `CACHE_VERSION` bump, and the purge paths in `cachePersistence.ts`. Today
  `idbStorage.clear()` deletes only the `cache` and `owner` keys from `apollo-cache`, so it
  must also clear the sync records store, in the same transaction where possible. Writes
  should follow the same owner check as cache writes, so a record can't land for a
  different user.
- **A record is written only after a sync finishes all pages and the cache holding that
  data has been persisted** (e.g. `await persistor.persist()` rather than relying on the
  persistor's debounced write). If the app closes between the last page and the cache
  write, there must be no record.
- A failed or interrupted sync writes nothing, so the next launch retries the whole sync.
  Pages it already fetched stay in the cache.

### No duplicate syncs

Each sync runs inside a Web Lock (`navigator.locks.request`) named for its sync type +
account list, with `ifAvailable: true` so a second request skips instead of queuing. This
covers switching back to an account list whose sync is still running, and a second
installed-app window. The lock is released automatically if the window closes. After
acquiring the lock, re-check the sync record before fetching, since another window may
have just finished. Where `navigator.locks` is missing, fall back to an in-page guard.

### What the contacts sync fetches

- One query definition, `OfflineContacts` (name is the builder's call), run page by page
  following `endCursor` until `hasNextPage` is false. Pages run one after another.
- `contacts(accountListId, contactsFilter: { status: [ACTIVE] }, first: CONTACTS_SYNC_PAGE_SIZE)`.
  `ACTIVE` is expanded on the server (`Contact::ACTIVE_STATUSES` plus no status), so the
  frontend doesn't keep its own list. Page size is a constant; start at 100 and tune.
- No cap on the number of contacts.
- `nodes` spread the fragments the offline screens read, so the sync can't drift from them:
  the Contacts list row (`ContactRow` plus the extra fields `Contacts.graphql` selects),
  `ContactDetailsHeader`, the Details tab's fields, and `notes` / `notesSavedAt`. Detail
  queries that select fields inline today (e.g. `ContactDetailsTab`, `GetContactNotes`) get
  their selections moved into fragments that both the page and the sync spread.
- A `Query.fields.contact` read policy in `src/lib/apollo/cache.ts` redirects
  `contact(accountListId, id)` to `Contact:<id>` with `toReference`, as `userOption` already
  does, so the details panel reads synced contacts. Online this also means the details
  panel shows cached data first under `cache-and-network`, which is fine.
- **Partner Accounts becomes cacheable.** Today it loads with `fetchPolicy: 'no-cache'`
  (`ContactDetailsPartnerAccounts.tsx:60`) because the API's `DonorAccount.displayName`
  depends on context (`mpdx_api/app/decorators/donor_account_decorator.rb`): with an
  account list context it uses the linked contact's name, otherwise the donor record's own
  name. Apollo keeps one `displayName` per `DonorAccount:<id>`, so caching it overwrote the
  name other screens show (commit `25cc87620`). Instead, `ContactPartnerAccounts` drops
  `displayName`, the component builds the label from the viewed contact's `name` and the
  donor account's `accountNumber` using the decorator's rules (blank name: just the
  number; name already contains the number: just the name; otherwise
  `"<name> (<accountNumber>)"`), and the query uses the default fetch policy. The fragment
  is then part of the sync. Known difference: the API uses whichever contact the donor
  account is linked to in that account list, which can differ from the viewed contact when
  a donor account is linked to more than one; accepted. Its
  `GetAccountListSalaryOrganization` lookup is not synced: it's only used when adding a
  partner account, which is an online-only edit and disabled offline.
- **Account-level lookups are skipped while the device is offline**, not synced:
  - The header query passes `loadDuplicate: false` when offline, so `contactDuplicates`
    isn't requested and the header renders from synced contact data with no duplicate
    banner.
  - The tag picker's account tag list (`GetContactTagList`) isn't synced. It may fail
    quietly offline; editing tags doesn't work offline anyway.
- Any field a detail query reads that the sync doesn't fetch makes Apollo treat the whole
  read as a miss, which fails offline. The builder must check every query the details panel
  runs on the Details and Notes tabs (including the header) against the sync query.

### Restore size and time logging

Each cache restore in `cachePersistence.ts` reports to Datadog how long it took (read plus
`cache.restore`) and the size of the stored JSON string, whether it finished or timed out.
This is a metric, not an error: `src/lib/dataDog.ts` only has error helpers today, so add a
small helper (e.g. a RUM action or timing with those values). Skipped when there's nothing
stored.

### Contacts page: online and offline modes

The mode is in the URL: `?offline=true` means offline mode, anything else is online mode.
A reload keeps the mode. "Offline mode" is only the internal name: all user-visible text
says "cached contacts" (button, indicator), never "offline contacts".

**Online mode** works like today. While the device is offline (`useIsOnline()` false):

- Disabled: filter panel, search box, starred toggle, Clear Filters, Flows and Map view
  buttons, and the mass Actions menu. Row checkboxes still work.
- The loaded list stays and can be scrolled and opened. Scrolling past the loaded pages
  just stops, with no error.
- A URL with filters shows whatever is cached for those exact filters, which may be nothing.

**Offline mode** (`?offline=true`):

- The list header shows a "Showing cached contacts" indicator for as long as the page is in
  offline mode, including after the connection comes back. It's separate from the existing
  `OfflineIndicator`, which only reports the device's connection.
- Shows the synced active list for the open account list, read from the cache with the same
  variables the sync used (`cache-only`; no network request). List view only.
- Hides contacts whose cached `status` is now inactive (a status changed after the sync,
  through normal use). Inactive means the five `Contact::INACTIVE_STATUSES` on the API:
  Not Interested, Unresponsive, Never Ask, Research Abandoned, Expired Connection. No status
  counts as active. Contacts created after the sync don't show until the next sync.
- Sorted by name, matching the API's default order.
- Disabled: filter panel, search, starred toggle, Flows and Map buttons, and Clear Filters.
- No row checkboxes and no Actions menu at all, even after reconnecting. Select-all loads ids
  with `GetIdsForMassSelection` using the URL filters, which don't match the offline list.
- Any filters or search term in the URL are ignored and dropped from the URL as soon as
  offline mode starts.
- Opening a contact keeps `?offline=true` in the URL, so closing the panel returns to the
  offline list.
- `?offline=true` with no finished sync shows the offline list anyway, which may be empty,
  with the normal empty state. Only reachable by editing the URL or an old link.
- When the connection comes back: filter panel, search, starred, Flows, and Map turn back
  on. Clear Filters stays disabled. The offline list stays on screen.
- **Leaving offline mode:** changing a filter, typing a search, toggling starred, or picking
  Flows or Map removes `?offline=true`. Old filters from the URL are dropped; online mode
  starts from just the change the user made. Picking Flows or Map updates the saved view
  preference as usual.

**Contact details panel is read-only while the device is offline**, in either mode and on
every tab: the Notes field, the star, the edit/add/delete buttons on the header and Details
tab sections (people, mailing, other, tags, partner accounts), the more-actions menu, and
the add/log task buttons are disabled. Everything turns back on when the connection
returns. If the connection drops while the user is typing a note, the text they typed stays
in the field and saves through the normal notes save once they're back online (my call).

**Flows and Map** ignore `?offline=true` and show their normal online views.

**Entering offline mode:**

- A **"Show Cached Contacts"** button shows only when the device is offline, the page is in
  online mode, and the open account list has a sync record that is finished with the
  current version. Tapping it pushes a new history entry with `?offline=true`, so Back
  returns to the online list.
- **Automatic switch:** opening `/contacts` (List view) while offline, with no filters and
  no search term in the URL, and a finished sync with the current version, switches to
  `?offline=true` with `router.replace`, so Back doesn't loop.
- A sync record whose version doesn't match counts as not synced for both of these.

## Left to the builder

- Names of the component, query, hooks, and constants, and where the sync code lives.
- How sync types are registered so adding `tasks` later is one entry.
- Hash function for the version (anything stable over the printed document).
- The sync records store's name and key scheme.
- How the offline list reads all merged pages from the cache, and how inactive contacts are
  filtered (`useContactPartnershipStatuses` phases may already give the inactive set;
  check it matches the API's five).
- Placement and styling of the "Show Cached Contacts" button and the "Showing cached
  contacts" indicator in the list header.
- Page size tuning.

## Testing

- `useIsStandalone()`: standalone match, browser tab, iOS `navigator.standalone`, and a
  display-mode `change` while mounted.
- Sync conditions: each condition above turns the sync off (browser tab, offline,
  impersonating, persistence disabled, not due, version mismatch makes it due).
- Sync records: written only after all pages and a persist; not written on failure,
  interruption, or going offline mid-sync; wiped by `clear()` in the same transaction as
  the cache keys, and therefore by every reset path (sign-out purge, stop, owner/version
  mismatch on restore).
- Web Lock: a second request for the same key skips.
- Restore logging: reports duration and stored size on a finished restore and on a timeout;
  nothing when the store is empty.
- Paging: follows `endCursor` until `hasNextPage` is false.
- Cache redirect: `contact(id)` reads a contact written by the sync query.
- Header: `loadDuplicate` is false while offline and the header renders from cached data.
- Details panel: Notes, star, section edit controls, more-actions, and task buttons are
  disabled while offline and re-enabled on reconnect; a note typed before the drop is kept.
- Partner Accounts label: blank name, name containing the account number, and the
  combined form; loading it no longer changes `displayName` shown elsewhere.
- Contacts page: each enabled/disabled control in online-while-offline and offline mode;
  the button's three conditions; automatic switch uses replace and only with no filters or
  search; leaving offline mode drops URL filters; opening a contact keeps `?offline=true`;
  inactive cached status is hidden; no checkboxes or Actions in offline mode; the
  "Showing cached contacts" indicator shows in offline mode (online or not) and never in
  online mode.

## Acceptance criteria

- From the installed app while online, MPDX syncs all active contacts for the open account
  list. Going offline afterward, the Contacts page shows them and each one opens to its
  header, Details tab, and Notes tab without having been viewed first.
- In a browser tab, or while impersonating, no sync happens.
- The full contacts sync runs at most once per `CONTACTS_SYNC_INTERVAL_MS` (one week) per
  account list unless the sync query changes.
- Two windows of the installed app never run the same account list's sync at once.
