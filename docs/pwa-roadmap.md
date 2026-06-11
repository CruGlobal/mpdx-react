# MPDX PWA + Native Shell Roadmap

Goal: make MPDX an installable PWA delivered inside Capacitor iOS/Android
shells, with read-only offline viewing of contacts and tasks, and push
notifications via the existing native push pipeline.

## Decisions (made 2026-06-09)

| Decision | Choice |
| --- | --- |
| Distribution | **PWA inside Capacitor shells** (iOS + Android app stores). The web app at mpdx.org continues as-is for browsers. |
| Offline scope | **Read-only cached views, kept lightweight.** No offline editing this release — the sync queue moved to "Future release" below. If read caching turns out to be expensive for a screen, descope that screen rather than over-engineer. |
| Offline screens | **Contacts (list + detail) and Tasks (list + detail) only.** Everything else requires internet. |
| Push transport | **Native push only** (APNs/FCM via the existing AWS SNS pipeline). No browser/web push — desktop users rely on email + in-app notifications. |
| Apple 4.2 mitigation | Native-feeling features in the shell: push, offline, and **contact photos — upload from library and capture with the camera** (like adding a contact on your phone). |

## Where we are today

### Frontend (mpdx-react)

| Area | Status |
| --- | --- |
| Web app manifest | ✅ Exists (`public/manifest.json`) but has bugs — `"Scope"` is capitalized (invalid key, should be `scope`), `splash_pages` is not a real manifest key, missing `description`, `id`, `orientation`, screenshots |
| Service worker | ⚠️ `next-pwa` v5.6.0 wired in `next.config.ts` (prod only). next-pwa 5.x is unmaintained and predates Next 15 — needs replacement (Serwist is the maintained successor) |
| Icons | ✅ Full set 72–512px + apple-touch icons in `public/icons/`, 512px is maskable |
| Deep-link files | ✅ `public/.well-known/` already has `apple-app-site-association` and `assetlinks.json` |
| Viewport meta | ✅ Present in `pages/_app.page.tsx` (incl. `viewport-fit=cover`) |
| Apollo cache persistence | ✅ `apollo3-cache-persist` → localStorage, prod only (`src/lib/apollo/client.ts`). localStorage ~5MB limit is a risk for this data volume |
| Auth | NextAuth v4, JWT session strategy, `apiToken` passed to Apollo link. Session lives in a cookie — complicates long offline sessions and Capacitor webviews |
| SSR | ⚠️ Heavy — key pages use `getServerSideProps` (`makeGetServerSideProps` wrapper), so first paint of those routes requires the server. Contacts/tasks routes need an app-shell/CSR strategy to work offline |
| Web push | ❌ None — and per decision, not needed |
| Hosting | AWS Amplify (SSR build, not static export) |

### Backend (mpdx_api)

| Area | Status |
| --- | --- |
| Push pipeline | ✅ **Already exists** (legacy native app): `User::Device` model (APNS/GCM), AWS SNS registration/publish services (`app/services/user/device/`), Sidekiq `PublishWorker`, REST endpoints at `/api/v2/user/devices` |
| Notification model | ✅ `Notification`, `NotificationPreference` (already has an `app` channel flag), `User::Notification.create_by_type` already enqueues push sends |
| ⚠️ GCM deprecation | The pipeline targets legacy GCM. Google shut down the legacy FCM API in mid-2024 — SNS platform app must be migrated to **FCM HTTP v1** credentials before Android push will work |
| Contact avatars | ✅ Avatar/image upload for contacts already exists server-side — shell work is about the *capture/pick* UX, not new storage |
| Auth | Doorkeeper OAuth2 with refresh tokens (~2h access tokens). Refresh-token flow is the key to keeping shell-app users logged in long-term |
| Real-time | ❌ No ActionCable/websockets — push is batch/one-way (fine for this plan) |
| Delta sync | ⚠️ Minimal — `updated_at` filtering exists on the GraphQL people query only. Offline mutations require delta endpoints + tombstones for contacts and tasks |

## Phase 1 — PWA foundation hardening (frontend) — ✅ DONE (2026-06-09)

- [x] Fix `public/manifest.json`: `scope` casing, remove `splash_pages`, add `description`, `id`, `orientation`, `categories` (screenshots deferred)
- [x] Replace `next-pwa` v5 with Serwist (`@serwist/next` ^9.5.11). Side effect: Yarn switched from PnP to `nodeLinker: node-modules` (matches what Amplify prod already did; @serwist/next is pure-ESM and PnP's ESM loader couldn't load it)
- [x] Runtime caching: **security-hardened allowlist** — only `/_next/static`, Google fonts, and same-origin static media are cached; everything else (HTML, `/_next/data`, `/api/*`, GraphQL) is NetworkOnly. **Never reintroduce Serwist's `defaultCache`**: review found it caches authenticated HTML/`__NEXT_DATA__` (contains NextAuth apiToken) in CacheStorage, which ignores `no-store`. CacheStorage is also cleared on logout
- [x] Offline fallback page at `/offline` (responsive, precached, in `nonAuthenticatedPages`)
- [x] SW update flow: `skipWaiting: false` + manual registration via `ServiceWorkerUpdatePrompt` — snackbar with Update/Later, reload warning copy
- [x] SW testable locally via `ENABLE_SW=true yarn build && yarn serve`
- [x] Amplify `customHttp.yml`: `sw.js` no-cache headers
- [x] iOS meta tags added; apple-touch-icon `sizes` mismatches fixed
- [ ] Lighthouse PWA audit — manual release-checklist item, run before deploy

Review follow-ups deferred (suggestion-tier): gate `spawnSync` git revision to prod / prefer `AWS_COMMIT_ID`; ticket to remove the workbox-precache cleanup listener eventually; dedicated worker tsconfig instead of global `webworker` lib; consider pinning serwist versions; manifest white-labeling via API route if APP_NAME branding ever needed.

## Phase 2 — Offline read layer (contacts + tasks) — ✅ DONE (2026-06-10)

Scope: contacts list/detail and tasks list/detail render from cache when
offline — **read-only**. Editing actions are disabled (or hidden) while
offline. All other routes show the offline fallback. Most of the machinery
(`apollo3-cache-persist`) already exists; this phase is mostly configuration
and UX, not new infrastructure.

**Scope refinement (2026-06-10):** *In-session offline only* — offline reads
work when the connection drops while the app is open. Cold-start offline
(launching with no connection) is out of scope: it would require caching
authenticated HTML, which conflicts with the Phase 1 security rule keeping
API tokens out of caches. Revisit in the Capacitor phase via a bundled local
shell. Research also found the contacts/tasks pages do **no SSR data
fetching** (`ensureSessionAndAccountList` provides session only), so no
page conversion is needed — the work is Apollo/auth/UX behavior.

- [x] Apollo cache persistence → IndexedDB (`localforage` + `CachePersistor`, `maxSize: false`). The persistor singleton lives in `src/lib/apollo/cachePersistor.ts` (separate module because `client.ts`'s top-level `await restore()` can't be imported under Jest)
- [x] Type-policy audit — relay pagination policies in `cache.ts` are offline-safe as-is; unchanged
- [x] `useIsOnline` hook + `OfflineNotifier` (persistent warning snackbar while offline, "back online" toast on reconnect)
- [x] Mutations blocked at the Apollo layer (`offlineLink`) with a distinct "Cannot save changes while offline." toast — chosen over per-button UI disabling (huge surface) as the lightweight global insurance
- [x] Graceful offline errors: `errorPolicy: 'all'` on watchQuery defaults (cached data keeps rendering when the network leg fails) + offline network-error snackbars suppressed
- [x] App-shell conversion: **not needed** — contacts/tasks pages never fetched data in SSR (session only)
- [x] Auth/offline grace: RouterGuard's expiry `signIn('okta')` gated on connectivity; re-fires on reconnect
- [ ] QA: airplane-mode testing of the four target screens (manual — see checklist below)

**Security invariant established in review (don't regress):** `client.clearStore()`
does NOT remove the persisted IndexedDB cache. Every path that ends a session
must call `clearApolloData()` (`src/lib/apollo/clearApolloData.ts`:
pause → clearStore → purge). All four signout paths (logout page,
AUTHENTICATION_ERROR handler, both profile menus) are wired; new signout
paths must use it too.

Hardening follow-up (deferred): `persistenceMapper` to persist only a
read-relevant subset of the cache instead of all browsed PII.

Deliberately *not* in scope (keep it simple): cache pre-warming/prefetch
strategies, offline detail data beyond what the user has already visited,
background cache refresh. Revisit only if real usage shows the cache is too
empty to be useful.

## Phase 3 — Push notifications (native only) — ✅ CODE-COMPLETE (2026-06-11)

Designed, implemented (TDD), and multi-agent-reviewed on branches
`pwa-phase3-4-push-shell` (this repo) and `pwa-push-fcm-v1` (mpdx_api).
Design docs + ordered task list live in `docs/pwa-design/` (master plan +
five area docs); deferred review suggestions in
`docs/pwa-design/review-follow-ups.md`. Remaining items below are gated on
accounts/credentials only Daniel can provide, or on physical-device QA.

### Backend (mpdx_api)

- [x] **Code-level verification done (2026-06-10):** pipeline is well-built and maintained (specs pass-shaped, idempotent registration, stale-device cleanup on `EndpointDisabled`). **Confirmed: `publish_service.rb` `gcm_payload` uses the legacy GCM format** (`{ data: ... }`) — incompatible with FCM v1. APNs payload format is valid. ARNs come from `SNS_APNS_APPLICATION_ARN` / `SNS_GCM_APPLICATION_ARN` env vars.
- [ ] **AWS-console verification still needed (Daniel):** GCM platform app credential type (legacy server key = dead; FCM v1 service-account JSON = needs payload change either way), APNs cert/key validity + bundle ID, ARNs active. Env values live in the deploy config (cru-deploy / ECS task defs), not this repo. Runbook: `docs/pwa-design/fcm-v1-backend.md` §5.
- [x] Migrate `gcm_payload` in `publish_service.rb` to FCM v1 message format — code done (SNS `fcmV1Message` envelope, string-coerced `message.data`, wire format verified against the Capacitor plugin source). SNS platform-app credential swap is the ops runbook above.
- [ ] Confirm APNs platform app uses a current `.p8` token-based key and the bundle ID of the new shell app (Daniel)
- [x] Wire the existing `NotificationPreference` `app` channel to gate push sends — was already wired; regression specs added
- [x] Add deep-link data to notification payloads — `DeepLinkBuilder` maps all 22 notification types to web paths, carried as `deepLink` in FCM `message.data` and APNs custom keys

### Frontend / shell

- [x] `@capacitor/push-notifications` → native tokens → registered via new REST-proxy `UserDevices` schema; unregister on logout via the consolidated `logoutCleanup()` chain
- [x] Permission UX: in-context prompt from the notification-settings card (the app's only `requestPermissions` call site, invariant-tested); recovers from denied via visibilitychange re-check
- [x] Notification tap → deep link (`NativeDeepLinkProvider`, sanitized same-origin paths, cold/warm start)
- [x] Push toggles in settings (`PushNotificationsCard` + "Mobile App" column relabel; final copy pending Daniel)
- [x] FCM token rotation (registration-listener path re-registers; session-scoped idempotent skip)

## Phase 4 — Capacitor shell — ✅ CODE-COMPLETE except auth gates + store ops (2026-06-11)

- [x] Capacitor 7 project set up in-repo; **`server.url` mode chosen** (3-proposal judge panel, unanimous) with empty `allowNavigation` + iOS `WKAppBoundDomains`; architecture in `docs/pwa-design/capacitor-shell.md`
- [ ] **Prototype auth — gates pending (Daniel, on device):** system-browser PKCE → NextAuth `CredentialsProvider` design is locked; the three go/no-go gates (bridge injection, cookie round-trip, cookie persistence) are scripted in `docs/pwa-design/t1-gate-runbook.md`. Production auth tasks (T20/T21) deliberately wait on these gates. ⚠️ Verify the stage host first — `next.stage.mpdx.org` in `capacitor.config.ts` is an unconfirmed placeholder.
- [x] Deep links: AASA recreated extensionless with forced `application/json` (placeholder `DQ48D9BF2V.org.cru.mpdx` pending identity decisions); assetlinks dev-override documented; Android `autoVerify` intent filter scoped to `/accountLists`
- [x] **Contact photo capture/upload** (Apple 4.2 anchor): `useNativeCamera` hook (Base64, permissions, cancel/denial states) → existing `setAvatar(file)` pipeline; web path regression-tested byte-for-byte unchanged; compress ladder caps at 1MB; online-only with offline gating
- [x] Native polish: splash (generated assets + programmatic hide), status bar, safe-area wrappers on both top bars, haptics on task-complete/delete-confirm; pull-to-refresh decision deferred to dogfooding (runbook §7)
- [x] App icons/splash assets generated for both stores (`assets/logo.png` source; regenerate command documented)
- [ ] CI: Fastlane build + signing pipelines (T29 — blocked on Apple/Google accounts, Daniel)
- [ ] Store accounts, listings, privacy declarations, review submission (T32 — Daniel; Apple 4.2 receipts checklist in capacitor-shell.md §11)
- [x] Shell version handshake: `MPDXShell/x.y.z` UA token + `MIN_SUPPORTED_SHELL_VERSION` gate + blocking upgrade screen (signout never blocked)

**Review outcomes (2026-06-11):** 7-dimension adversarial review confirmed 23
findings; all fixed. Headline: `removeAllListeners()` was wiping the deep-link
tap listener (a contradiction *between* two design docs — caught only by
cross-module review); signout paths now all run the canonical `logoutCleanup()`
to completion before navigation; push registration is user-/session-scoped and
race-hardened; Android backups disabled (webview cookie store carries the
session). Deferred suggestions + refuted findings: `docs/pwa-design/review-follow-ups.md`.

**Blocked-on-Daniel checklist (the only path to shipping):** stage-host
confirmation → run the 3 auth gates (t1-gate-runbook.md) → SNS/Firebase/APNs
credentials (fcm-v1-backend.md §5) → Okta native PKCE client →
Android/Apple identity decisions (org.mpdx / team DQ48D9BF2V reuse) → then
T20/T21 (production native auth), T29 (CI signing), T30 (device push QA),
T32 (store submission).

## Future release (explicitly out of scope now)

**Offline mutations + sync queue** — deferred from this release to keep scope
manageable. When/if revisited, the work is:

- Frontend: IndexedDB mutation queue, replay on reconnect (Background Sync API), optimistic UI with pending/failed indicators, conflict-handling UX, cache reconciliation after replay
- Backend: `updated_at >` delta filtering for contacts and tasks (only people has it today), tombstones for deletions, per-entity conflict policy (needs product sign-off), idempotency keys for replay-safe creates, refresh-token lifetimes that survive multi-day offline stretches

The Phase 2 decision to *disable* editing UI while offline keeps this door
open — no data-integrity debt is created by shipping read-only first.

**Browser/web push (VAPID)** — also deferred (decision: no browser push at
all). If desktop notifications are ever wanted, Web Push/VAPID via the
`web-push` gem is the recommended route, not the Firebase JS SDK.

## Key risks

1. **GCM is dead** — Android push will not work until SNS is migrated to FCM v1. Verify the whole legacy pipeline early.
2. **Auth in a webview** — the hardest shell problem; prototype before committing to `server.url` mode.
3. **SSR vs. offline** — contacts/tasks routes must move off `getServerSideProps` (or get a cached-shell strategy) before offline reads work at all. This is the main real engineering cost of Phase 2.
4. **next-pwa v5 is abandoned** — replace with Serwist before building on it.
5. **Apple 4.2** — the camera contact-photo feature plus push plus offline viewing should clear "minimum functionality," but keep receipts (feature list) for the review.

## Suggested order of attack

1. **Phase 1** (foundation — small, low-risk) and **Phase 3 backend verification** (de-risk legacy push infra) in parallel
2. **Phase 4 auth prototype** early — it can invalidate shell assumptions
3. **Phase 2** (offline reads for contacts/tasks)
4. **Phase 3 frontend + Phase 4 shell build-out**, including the camera feature
5. Store submission
