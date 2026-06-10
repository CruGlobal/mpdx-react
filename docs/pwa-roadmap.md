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

## Phase 2 — Offline read layer (contacts + tasks)

Scope: contacts list/detail and tasks list/detail render from cache when
offline — **read-only**. Editing actions are disabled (or hidden) while
offline. All other routes show the offline fallback. Most of the machinery
(`apollo3-cache-persist`) already exists; this phase is mostly configuration
and UX, not new infrastructure.

- [ ] Move Apollo cache persistence from localStorage to IndexedDB (`localforage` wrapper) — removes the ~5MB cap; set `maxSize`/trigger options deliberately
- [ ] Audit `src/lib/apollo/cache.ts` type policies for the contact/task queries used by the four target screens
- [ ] Global online/offline state: connectivity detection, "offline" banner, switch Apollo `fetchPolicy` to `cache-first`/`cache-only` when offline
- [ ] Disable mutation-triggering UI while offline (save buttons, task completion, etc.) with a "reconnect to edit" affordance — cheap insurance against half-written offline edits
- [ ] Handle Apollo network errors gracefully when offline (render cached data, not error states)
- [ ] App-shell strategy for the contacts/tasks routes: convert their `getServerSideProps` data fetching to client-side (or cached shell + hydration) so revisits work offline
- [ ] Auth/offline interplay: don't hard-logout when the token expires offline; silent refresh on reconnect
- [ ] QA: airplane-mode testing of the four target screens in the shells and installed PWA

Deliberately *not* in scope (keep it simple): cache pre-warming/prefetch
strategies, offline detail data beyond what the user has already visited,
background cache refresh. Revisit only if real usage shows the cache is too
empty to be useful.

## Phase 3 — Push notifications (native only)

### Backend (mpdx_api)

- [ ] Verify the legacy SNS pipeline end-to-end (it may have bit-rotted): SNS platform apps, env credentials, `PublishWorker`
- [ ] Migrate SNS Android platform app from legacy GCM to FCM HTTP v1 credentials; update `PublishService` payload format if needed
- [ ] Confirm APNs platform app uses a current `.p8` token-based key and the bundle ID of the new shell app
- [ ] Wire the existing `NotificationPreference` `app` channel to gate push sends per notification type
- [ ] Add deep-link data to notification payloads (route to open on tap)

### Frontend / shell

- [ ] `@capacitor/push-notifications` plugin → obtain native FCM/APNs tokens → register via existing `/api/v2/user/devices`; unregister on logout
- [ ] Permission UX: in-context prompt (from notification settings), never on first launch
- [ ] Notification tap → deep link to the right screen
- [ ] Surface push toggles in the existing notification-preferences settings UI (`src/components/Settings/notifications/`)
- [ ] Handle FCM token rotation (re-register on token refresh events)

## Phase 4 — Capacitor shell

- [ ] Set up Capacitor project; evaluate `server.url` mode (webview points at hosted app — likely, given SSR) vs. bundled static build; decide repo location
- [ ] **Prototype auth first** — NextAuth OAuth redirects inside a webview are fragile and Okta/Google may block embedded webviews; likely system-browser flow (Custom Tabs / `ASWebAuthenticationSession`) + universal link / custom scheme back into the app
- [ ] Deep links: wire universal links / app links using the existing `.well-known` files
- [ ] **Contact photo capture/upload** (Apple 4.2 anchor feature):
  - [ ] `@capacitor/camera` plugin — take photo or pick from library
  - [ ] Bridge from the contact detail page: detect shell context (Capacitor), offer camera/library options; browsers keep the existing file-upload path
  - [ ] Wire captured image into the existing contact avatar upload endpoint (resize/compress client-side first)
  - [ ] Handle camera/photo permissions and denial states (online-only feature this release — no offline upload queue)
- [ ] Native polish: splash screen, status bar styling, safe-area insets, haptics on key actions, pull-to-refresh behavior in webview
- [ ] App icons/splash assets for both stores
- [ ] CI: Fastlane (or similar) build + signing pipelines for iOS/Android
- [ ] Store accounts, listings, privacy declarations (Apple privacy labels, Google data safety), review submission
- [ ] Shell version handshake: since the web app updates server-side, define a minimum-supported-shell-version check + upgrade prompt

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
