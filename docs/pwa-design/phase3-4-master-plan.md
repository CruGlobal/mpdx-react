# PWA Phases 3+4 — Master Design & Execution Plan

Status: MASTER PLAN — 2026-06-10
Synthesizes: `fcm-v1-backend.md`, `push-registration-frontend.md`, `camera-contact-photo.md`,
`deep-links.md`, `capacitor-shell.md` (+ `docs/pwa-roadmap.md` Phases 3/4).
Repos: `mpdx-react` (branch `pwa-phase3-4-push-shell`), `mpdx_api` (branch `pwa-push-fcm-v1`).

This document is authoritative where area docs disagree. Contradiction resolutions are in §3.4.

---

## 1. Decision summary (one paragraph per area)

**Capacitor shell (architecture).** A thin **Capacitor 7 shell in `server.url` mode** pointed at
the hosted Amplify SSR app (prod `https://mpdx.org`, stage builds at `https://next.stage.mpdx.org`),
living in-repo in `mpdx-react` (`capacitor.config.ts`, `ios/`, `android/`, `capacitor-web/error.html`
stub, `src/lib/nativeShell/`). The single-host rule — `allowNavigation` empty, all external URLs to
the system browser — sidesteps every documented Capacitor remote-URL bug. iOS sets
`WKAppBoundDomains` + `limitsNavigationsToAppBoundDomains: true` from day one (unlocks service
workers and durable storage in WKWebView). Auth: system-browser PKCE against a native public client
(Okta; Doorkeeper API_OAUTH as the stage fallback), landed via a ~80-line NextAuth
**CredentialsProvider `native-okta`** — the webview itself POSTs `signIn('native-okta', { accessToken })`
so NextAuth sets the session cookie in the webview's jar on its paved road; only a single-use PKCE
code crosses the browser boundary. Keychain refresh token is Plan B, activated only if the Day 2
cookie-persistence battery fails. Phases 1+2 (SW allowlist, IndexedDB persistence, offlineLink,
`clearApolloData()` invariant) transfer wholesale; the same-origin offline viewer is **v1.1**, built
immediately after v1 core in parallel with store prep, not blocking submission. The
**day-one auth+bridge prototype with three go/no-go gates is implementation task 1**; only Gate 1
failure (bridge injection on the remote origin) invalidates the architecture.

**FCM v1 backend.** Migration is payload-layer only: `User::Device::PublishService#gcm_payload`
moves from the dead legacy GCM format to SNS's FCM HTTP v1 envelope
(`{ fcmV1Message: { message: { notification: { body }, data, android: { priority: 'high' } } } }`),
with `message.data` carrying string-coerced custom keys including `deepLink`. The APNs payload keeps
`aps.alert` and flattens the same custom keys at the top level alongside `aps` (so Capacitor surfaces
`notification.data.deepLink` uniformly on both platforms — a load-bearing assumption verified by a
plugin-source check in T2 step 0 before any payload spec merges), retaining the legacy `link` key for
the still-fielded old iOS app. `ClientService`, `RegistrationService`, `PublishWorker`, `User::Device`,
and `/api/v2/user/devices` are unchanged. Key finding: the NotificationPreference `app`-channel
gating the roadmap asks for is **already fully wired and spec'd** — that task reduces to one stronger
regression spec asserting actual `PublishWorker` enqueue. Ops runbook (fcm-v1-backend.md §5) covers
SNS credential inspection, Firebase v1 service-account setup, the sender-ID-mismatch trap, APNs `.p8`
migration, and 7-step end-to-end validation.

**Push registration frontend.** Device registration goes through a new REST-proxy Schema folder
(`pages/api/Schema/UserDevices/`) exposing `registerUserDevice`/`destroyUserDevice` mutations —
Apollo's authLink already handles the Bearer token, the shell is same-origin in `server.url` mode,
and offlineLink/codegen/GqlMockedProvider come free. All Capacitor code lives in
`src/lib/nativeShell/` with `@capacitor/core` statically imported in exactly one detection module and
plugins behind lazy dynamic imports. Registration state (device id, last token, enabled flag, locale)
lives in localStorage — deliberately outside Apollo so `clearStore()` cannot race the logout DELETE.
A single `registration`-listener path handles first opt-in, every launch, and FCM token rotation
(token+locale comparison makes steady-state launches zero-network). `requestPermissions()` is called
**only** from the new `PushNotificationsCard` in settings; launch bootstrap uses non-prompting
`checkPermissions()`/`register()`. Logout consolidates the duplicated signout blocks into
`logoutCleanup()` (disablePush → CacheStorage clear → `clearDataDogUser` → `clearApolloData()` —
canonical chain, see §3.3). Per-type toggles need no
new UI — `NotificationsTable`'s existing "In App" column is the `app` flag the backend gates on;
only a relabel/tooltip changes.

**Deep links.** One value format everywhere: a **same-origin web path**
(e.g. `/accountLists/:alid/contacts/:cid?tab=Donations`) carried as `deepLink` in FCM v1
`message.data` and as an APNs top-level custom key. A new pure `User::Device::DeepLinkBuilder` maps
all 22 push-worthy notification types (all contact-based) to routes: gift types → `?tab=Donations`,
contact-info types → `?tab=ContactDetails`, `NewPartnerDuplicateNotMerged` → the merge tool,
multi-notification batches → the account-list dashboard. The repo's AASA file is misnamed
(`apple-app-site-association.json` — Apple fetches the extensionless path) and gets recreated with
modern `appIDs`/`components` format scoped to `/accountLists/*` (working-assumption appID
`DQ48D9BF2V.org.cru.mpdx`), with `Content-Type: application/json` forced via both `next.config.ts`
`headers()` and Amplify `customHttp.yml`. `assetlinks.json` needs zero changes if the shell ships as
an update to the existing `org.mpdx` Play listing. Frontend: pure `src/lib/nativeShell/deepLink.ts`
(sanitize/parse/route with open-redirect guards) + a thin `NativeDeepLinkProvider` in `_app` wiring
`appUrlOpen` (warm), `App.getLaunchUrl()` with a once-latch (cold), and
`pushNotificationActionPerformed` (both) into `next/router`. Auth needs no new machinery: navigate
immediately and let the existing RouterGuard → `/login?redirect=` chain return the user to the target.

**Camera contact photo.** Plugs into the existing avatar pipeline at exactly one seam:
`PersonName.tsx`'s `setAvatar(file: File)` prop — everything downstream (1MB validation, blob
preview, deferred raw-fetch upload, header refetch) is untouched, and the web path is byte-for-byte
behaviorally unchanged. On native, the avatar tap opens an MUI menu (Take Photo / Choose from
Library) driving a new `src/hooks/useNativeCamera.ts` hook: dynamic-import `@capacitor/camera`,
per-source `requestPermissions`, `getPhoto` with `resultType: Base64` (Uri webPath is unreliable
under `server.url` on iOS), 1024px / q85 / `correctOrientation` / `saveToGallery: false`. A pure
`base64ToFile` util plus an in-repo canvas `compressAvatar` quality/dimension ladder guarantees the
1MB lambda limit with no third-party dependency. Discriminated results
(success/canceled/permission-denied/error) drive localized snackbars; the native menu is gated on
`useIsOnline` (the upload is raw fetch, so offlineLink does not cover it). iOS needs the three photo
usage-description plist keys; Android must NOT declare `android.permission.CAMERA`.

---

## 2. Ordered task breakdown (TDD, both repos)

Conventions: every task is red→green TDD per its area doc's test plan. Tasks marked
**[BLOCKED: Daniel]** cannot finish without external accounts/credentials — implementation routes
around them (everything else lands dark behind `isNativeShell()` gates with placeholders).
Two parallel tracks after T1: **backend (T2–T7)** and **frontend (T8+)**.

### Track 0 — gate

- **T1 — Day-one auth + bridge prototype (Gates 1–3)** · repo: `both` (mostly mpdx-react) ·
  deps: none
  Files: `capacitor.config.ts`, `ios/`, `android/` (cap init), `capacitor-web/error.html`,
  `ios/App/App/Info.plist` (`WKAppBoundDomains`), throwaway CredentialsProvider in
  `pages/api/auth/[...nextauth].page.ts` on a spike branch; stage Doorkeeper public PKCE client
  (Daniel controls stage Doorkeeper — quick internal action, not externally blocked; Okta client
  request T9 runs in parallel).
  TDD/verification: this is a prototype, not TDD — gates are the tests. Gate 1: bridge injection on
  the remote origin (`Capacitor.isNativePlatform() === true`, `Device.getInfo()`, SW registers,
  IndexedDB readable on iOS+Android). Gate 2: system-browser PKCE round-trip lands a working
  NextAuth session cookie in the webview on both platforms (`/api/auth/session` returns the user).
  Gate 3: cookie survives kill/relaunch/reboot (Day 2 battery; start 48h+ soak). Gate 1 failure
  stops Phase 4; Gate 3 failure activates Plan B (Keychain refresh token) — see capacitor-shell §7.
  Nothing else in Phase 4 builds until Gates 1–2 pass. Backend track T2–T7 does NOT wait on T1.

### Track A — backend (mpdx_api, parallel with Track B)

- **T2 — PublishService FCM v1 + APNs flattened payload** · repo: `mpdx_api` · deps: none
  Files: `app/services/user/device/publish_service.rb`,
  `spec/services/user/device/publish_service_spec.rb`.
  **Step 0 — pre-merge wire-shape verification (cheap, blocking):** fcm-v1-backend.md §2 asserts —
  without citation — that `@capacitor/push-notifications` surfaces APNs **top-level custom keys** as
  `notification.data.deepLink` on iOS and FCM v1 `message.data.deepLink` on Android. A context7
  README check (2026-06-10) confirms the `data` field exists on `PushNotificationSchema` but does
  NOT document the userInfo→`data` mapping. Before this task merges, read the plugin source for the
  pinned major (iOS: the `pushNotificationActionPerformed` handler — expect `data` = full APNs
  `userInfo`; Android: `RemoteMessage.getData()` foreground + launch-intent extras on background
  tap) and record the citation in fcm-v1-backend.md §2. If the mapping differs (e.g. iOS keys
  nested under `aps` or another key), fix §3.1 and T17's reader spec FIRST — both encode this exact
  shape. Final on-device confirmation remains a T30 step.
  TDD: rewrite the GCM spec context first (exact `fcmV1Message` envelope, data stringification,
  `deep_link`→`deepLink` rename, nil compaction), extend APNs context (custom keys flattened beside
  `aps`, legacy `link` retained, reserved-key safety, APNS_SANDBOX unchanged). Then implement per
  fcm-v1-backend.md §2.

- **T3 — WebRouter path helpers** · repo: `mpdx_api` · deps: none
  Files: `app/services/web_router.rb`, `spec/services/web_router_spec.rb`.
  TDD: specs for new `contact_path`/`contacts_path`/`tasks_path`; `contact_url`/`tasks_url` outputs
  byte-identical to today (refactor safety).

- **T4 — DeepLinkBuilder** · repo: `mpdx_api` · deps: T3
  Files: `app/services/user/device/deep_link_builder.rb`,
  `spec/services/user/device/deep_link_builder_spec.rb`.
  TDD: table-driven spec looping **every** name in `NotificationType.types` (unmapped future types
  fall through to the documented default with an explicit expectation): gift → `?tab=Donations`,
  contact-info → `?tab=ContactDetails`, care types → bare contact path,
  `NewPartnerDuplicateNotMerged` → `/accountLists/:alid/tools/merge/contacts`, `many?` →
  `/accountLists/:alid` (dashboard — see §3.4 resolution R4). Per deep-links.md §1.3.

- **T5 — Wire `deep_link` into opts (both call sites)** · repo: `mpdx_api` · deps: T3, T4
  Files: `app/models/notification_type.rb` (`user_notification_options` uses DeepLinkBuilder —
  deep-links.md version wins, §3.4 R5), `app/workers/task/notification_worker.rb`
  (`deep_link: WebRouter.tasks_path(...)` placeholder), `spec/models/notification_type_spec.rb`,
  `spec/workers/task/notification_worker_spec.rb`.
  TDD: existing `eq` assertions gain `deep_link`; `contact_url`+`account_list_id` retained; worker
  spec's mobile-notification expectation gains `deep_link`; `to_json` round-trip through
  `PublishWorker` string-opts parsing.

- **T6 — NotificationsSender regression spec (app-channel gating)** · repo: `mpdx_api` · deps: T5
  Files: `spec/services/account_list/notifications_sender_spec.rb` (spec-only — gating already
  wired).
  TDD: with `app: true`, a `User::Device::PublishWorker` job is enqueued whose opts JSON includes
  `deep_link`; with `app: false`, zero jobs. Existing specs at lines 218–237 keep passing. Then run
  the verify-unchanged set (fcm-v1-backend.md §6.6).

- **T7 — Remove raw-token logging** · repo: `mpdx_api` · deps: none
  Files: `app/services/.../okta_validator_service.rb` (line ~51).
  TDD: spec asserting the logger is not called with the token (or log content excludes it). Judge
  concern #7; must land before shell launch.

- **T8 — SNS/Firebase/APNs credential migration (ops runbook)** · repo: `ops` ·
  deps: T2 · **[BLOCKED: Daniel — AWS console, Firebase project, Apple Developer]**
  Work: fcm-v1-backend.md §5 — inspect GCM platform-app credential type + APNs cert/bundle ID,
  create/recover Firebase project (same project as the shell's `google-services.json` —
  SENDER_ID_MISMATCH trap), upload FCM v1 service-account JSON to SNS, APNs `.p8` + new bundle ID,
  update `SNS_*_APPLICATION_ARN` deploy config (ECS redeploy), `aws sns publish` smoke test.
  **Runbook step 0 (staging):** determine whether staging has its own SNS platform applications
  (separate `SNS_*_APPLICATION_ARN` values in the stage deploy config) or shares prod ARNs. If
  separate, migrate the staging platform apps to FCM v1 / `.p8` credentials FIRST and smoke-test
  them — T30's end-to-end validation runs entirely on staging and fails silently against unmigrated
  staging ARNs.

- **T9 — Okta native client + `OKTA_AUTH_CLIENT_IDS`** · repo: `ops` ·
  deps: none · **[BLOCKED: Daniel — Okta admin]**
  Work: register native public PKCE client (redirect URIs `org.mpdx://auth-callback`,
  `https://mpdx.org/auth/native-callback`); append client ID to `OKTA_AUTH_CLIENT_IDS` in mpdx_api
  deploy config (one line, real coordination). Doorkeeper stage client (T1) de-risks the wait.

### Track B — frontend foundation (mpdx-react)

- **T10 — REST-proxy UserDevices schema** · repo: `mpdx-react` · deps: none
  Files: `pages/api/Schema/UserDevices/userDevices.graphql`, `resolvers.ts`, `datahandler.ts` (+
  `datahandler.test.ts`), `pages/api/graphql-rest.page.ts` (post/delete methods),
  `pages/api/Schema/index.ts` (register).
  TDD: datahandler test (JSON:API device resource → `UserDevice`; destroy → `{ success: true }`);
  `yarn gql` green. Contract per §3.2.

- **T11 — nativeShell foundation module + Capacitor deps** · repo: `mpdx-react` · deps: T1
  Files: `package.json` (`@capacitor/core`, `@capacitor/push-notifications`, `@capacitor/app`,
  `@capacitor/browser`, `@capacitor/camera`, `@capacitor/device` — all pinned to the major T1
  scaffolds, Capacitor 7 expected), `src/lib/nativeShell/nativeShell.ts` (THE one static
  `@capacitor/core` import: `isNativeShell()`, `getDevicePlatform()` — §3.4 R1),
  `src/lib/nativeShell/deviceLocale.ts`, `src/lib/nativeShell/pushStorage.ts`,
  `__tests__/util/capacitorMocks.ts`, colocated tests.
  TDD: `deviceLocale.test.ts` (exact match, regional passthrough, `fr`→`fr-FR`, unknown→`en`);
  `pushStorage` key round-trips; capacitorMocks helper with `emitRegistration`/`setNativePlatform`.

- **T12 — pushRegistration core** · repo: `mpdx-react` · deps: T10, T11
  Files: `src/lib/nativeShell/pushRegistration.ts`, `src/lib/nativeShell/UserDevice.graphql`
  (operations `RegisterUserDevice`/`DestroyUserDevice`), `pushRegistration.test.ts`.
  TDD: full matrix in push-registration-frontend.md §6.2 — web no-op, APNS/GCM platform mapping via
  `toHaveGraphqlOperation`, idempotent same-token skip, rotation re-register, denied → no
  `register()`, `disablePush` teardown order + failure tolerance.

- **T13 — logoutCleanup consolidation** · repo: `mpdx-react` · deps: T12
  Files: `src/lib/auth/logoutCleanup.ts` (+ test), `pages/logout.page.tsx`,
  `src/components/Layouts/Primary/TopBar/Items/ProfileMenu/ProfileMenu.tsx`,
  `src/components/Layouts/Primary/NavBar/NavTools/ProfileMenuPanel/ProfileMenuPanel.tsx`,
  `src/lib/apollo/client.ts` (AUTHENTICATION_ERROR handler), `src/lib/apollo/clearApolloData.ts`
  (invariant comment), existing signout tests.
  TDD: call-order assertion of the full canonical chain (§3.3): `DestroyUserDevice` BEFORE
  persistor purge/clearStore, `clearDataDogUser` before `clearApolloData`; mutation
  rejection still resolves and `clearApolloData` runs; web path unchanged except CacheStorage clear.
  Invariant update: new signout paths must call `logoutCleanup()` (which wraps `clearApolloData`).

- **T14 — PushNotificationsCard + table relabel** · repo: `mpdx-react` · deps: T12
  Files: `src/components/Settings/notifications/PushNotificationsCard/PushNotificationsCard.tsx`
  (+ test), `pages/accountLists/[accountListId]/settings/notifications.page.tsx`,
  `src/components/Settings/notifications/NotificationsTable.tsx` (relabel "In App" → "Mobile App" +
  tooltip; copy pending Daniel), `NotificationsTable.test.tsx`.
  TDD: web renders nothing; enable → `requestPermissions` then `register` then success state;
  denied → instructions alert; disable → `DestroyUserDevice`; buttons disabled in flight. This card
  is the ONLY `requestPermissions()` call site. `yarn extract` for new strings.

- **T15 — PushBootstrap (registration lifecycle only)** · repo: `mpdx-react` · deps: T12
  Files: `src/components/Shell/PushBootstrap/PushBootstrap.tsx` (+ test), `pages/_app.page.tsx`
  (mount inside ApolloProvider).
  TDD: web → null; flag unset → no `register()`; flag set + granted → silent re-register, rotated
  token re-POSTs; revoked → silent; **invariant test: `requestPermissions` NEVER called from
  bootstrap**. Note: the push-tap deep-link listener does NOT live here — it lives in T17 (§3.4 R3).

- **T16 — deepLink pure module** · repo: `mpdx-react` · deps: T11
  Files: `src/lib/nativeShell/deepLink.ts` (+ test): `sanitizeDeepLinkPath`, `deepLinkFromUrl`,
  `routeFromPushData`, `allowedDeepLinkHosts`.
  TDD: table tests per deep-links.md §6.1 — accept valid paths with query; reject `//evil.com`,
  schemes, backslashes, non-strings; exact host match (no suffix); fallback `/accountLists`.

- **T17 — NativeDeepLinkProvider (owns all tap/link routing)** · repo: `mpdx-react` · deps: T15, T16
  Files: `src/components/NativeShell/NativeDeepLinkProvider.tsx` (+ test), `pages/_app.page.tsx`.
  TDD: not native → no plugin imports; `appUrlOpen` allowed host → `router.push(path)`, foreign
  host → nothing; `pushNotificationActionPerformed` with `data.deepLink` → push, missing →
  fallback; `getLaunchUrl` → `router.replace` exactly once across remounts (latch); duplicate
  `asPath` skip; unmount removes listeners. Reads `notification.data.deepLink` (NOT `data.route` —
  §3.4 R2).

- **T18 — AASA + content-type headers** · repo: `mpdx-react` · deps: none ·
  **[finalization BLOCKED: Daniel — Apple Team ID/bundle; lands now with placeholder]**
  Files: create extensionless `public/.well-known/apple-app-site-association` (modern
  `appIDs`/`components`, `/accountLists/*`, `webcredentials`, placeholder
  `DQ48D9BF2V.org.cru.mpdx`), delete misnamed `apple-app-site-association.json`,
  `next.config.ts` `headers()`, Amplify `customHttp.yml`.
  Verification: release-checklist curl (direct 200, `application/json`, no redirect); Amplify
  preview-deploy header check.

- **T19 — assetlinks.json decision + dev fingerprint** · repo: `mpdx-react` · deps: none ·
  **[decision BLOCKED: Daniel — Play listing/signing-key control]**
  Files: `public/.well-known/assetlinks.json`.
  Work: zero changes if `org.mpdx` Play listing is updated (recommended); else append new
  package+fingerprint entry, keep legacy entry. Either way add debug-keystore fingerprint (or
  document `adb shell pm set-app-links` for dev).

### Track C — shell build-out (after T1 gates pass)

- **T20 — Production native auth** · repo: `mpdx-react` · deps: T1, T13
  Files: `pages/api/auth/[...nextauth].page.ts` (CredentialsProvider `native-okta` + `signIn`
  callback branch), `pages/api/auth/native/token.page.ts` (secretless code-exchange proxy:
  rate-limited, never logs bodies, opaque errors), `src/lib/nativeShell/useNativeAuth.ts`
  (platform-aware signIn helper), `src/components/RouterGuard/RouterGuard.tsx`,
  `pages/login.page.tsx`, `src/lib/apollo/client.ts` (re-auth path), tests for each.
  TDD: CredentialsProvider `authorize()` calls `oktaSignIn` and returns `apiToken`/`userID`,
  rejects garbage tokens; token-proxy route accepts only code-exchange fields; web callers still get
  `signIn('okta')` unchanged; signout uses `logoutCleanup()` and skips Okta global signout
  (default — open question). PKCE verifier/state in memory only. **Critical-pattern files — route
  the PR through the full security review with capacitor-shell §4.3 as context.** Must preserve the
  `?redirect=`/current-URL contract (deep-links §4.4).

- **T21 — Auth callback transport** · repo: `mpdx-react` · deps: T19, T20
  Files: Android `autoVerify` intent filter for `https://mpdx.org/auth/native-callback` +
  fallback page (`pages/auth/native-callback.page.tsx`, no-op "return to the app"); iOS custom
  scheme `org.mpdx://auth-callback` registration (scheme must match the final appId — placeholder);
  `appUrlOpen` handling in `useNativeAuth`.
  TDD: state validation, callback parse unit tests; device QA for App Link verification.

- **T22 — Shell version handshake** · repo: `mpdx-react` · deps: T11
  Files: `capacitor.config.ts` (`appendUserAgent: MPDXShell/<semver>`),
  `src/lib/nativeShell/shellVersion.ts` (+ test; UA parse, semver compare,
  `MIN_SUPPORTED_SHELL_VERSION` constant — PR-owned), `src/lib/nativeShell/UpgradeRequiredScreen.tsx`
  (+ test; blocking, i18n'd, store link, must not block signout), `_app` check.
  TDD: parse/compare unit tests; below-minimum renders the screen; signout reachable.

- **T23 — Image utils (camera, pure)** · repo: `mpdx-react` · deps: none
  Files: `src/lib/images/base64ToFile.ts` (+ test), `src/lib/images/compressAvatar.ts` (+ test;
  exported `MAX_AVATAR_BYTES`; refactor `validateAvatar` to import it).
  TDD: byte-exact base64 decode; pure `nextCompressionStep` ladder (0.85→0.55 quality, 0.75x
  dimension, give up after 3 reductions); canvas shell with mocked `createImageBitmap`/`toBlob`.

- **T24 — useNativeCamera hook** · repo: `mpdx-react` · deps: T11, T23
  Files: `src/hooks/useNativeCamera.ts` (+ test). Gates on `isNativeShell()` from
  `src/lib/nativeShell/nativeShell.ts` (NOT a separate `src/lib/capacitor.ts` — §3.4 R1).
  TDD: renderHook matrix per camera doc §7.3 — getPhoto args (Base64, 1024, q85,
  `saveToGallery: false`), `limited` treated as granted, denied → no `getPhoto`, cancel-regex →
  `canceled`, oversize → `compressAvatar` invoked.

- **T25 — PersonName native menu + offline gating** · repo: `mpdx-react` · deps: T24
  Files: `.../PersonModal/PersonName/PersonName.tsx` (+ test additions),
  `PersonModalSave.test.tsx` (one integration case).
  TDD: **anchor regression test — web path byte-for-byte unchanged** (no menu, hidden input still
  fires `setAvatar`); native menu items; success → `setAvatar(file)`; denial snackbars per source;
  canceled → silence; native+offline → warning snackbar, no menu; camera-shaped File survives
  `validateAvatar` → `uploadAvatar`. `aria-label` on the icon button. `yarn extract` (4 strings).

- **T26 — Native platform config** · repo: `mpdx-react` · deps: T1, T18, T19 (+ T8 for the
  production `google-services.json` only — a placeholder/debug Firebase app unblocks the build
  wiring immediately)
  Files: `ios/App/App/Info.plist` (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`,
  `NSPhotoLibraryAddUsageDescription`; verify `PrivacyInfo.xcprivacy` via Pods), iOS Associated
  Domains entitlement (`applinks:mpdx.org`, `webcredentials:mpdx.org`, `?mode=developer` for dev),
  `android/app/src/main/AndroidManifest.xml` (maxSdkVersion-bounded storage permissions, **no**
  `android.permission.CAMERA` — audit merged manifest, add to release checklist; `autoVerify`
  intent filter scoped to `/accountLists`).
  **Push build wiring (owning task — without these `PushNotifications.register()` fails on both
  platforms and T30 dead-ends):**
  - Android: commit `android/app/google-services.json` and wire the `com.google.gms:google-services`
    Gradle plugin (classpath in `android/build.gradle`, `apply plugin` in `android/app/build.gradle`).
    Land now with a debug-Firebase-app file matching applicationId `org.mpdx`; swap in the real file
    from T8 (must be the SAME Firebase project as the SNS credentials — SENDER_ID_MISMATCH trap).
  - iOS: add the **Push Notifications capability** to the Xcode project — `aps-environment`
    entitlement in `ios/App/App/App.entitlements` (development for dev builds; release signing sets
    production) alongside the Associated Domains entitlement above.

- **T27 — Native polish** · repo: `mpdx-react` · deps: T1
  Files: `@capacitor/assets` icon/splash generation, `@capacitor/splash-screen`
  (`launchAutoHide: false` + programmatic hide after hydration), `@capacitor/status-bar` (theme
  token, `overlaysWebView: false`), safe-area audit wrapper, `@capacitor/haptics` on key actions.
  **Pull-to-refresh / overscroll (roadmap Phase 4 bullet — concrete deliverable):** default
  decision, binding unless overridden: **v1 ships with NO custom pull-to-refresh**; iOS rubber-band
  overscroll and Android overscroll glow stay at WKWebView/WebView defaults (SSR pages refresh via
  navigation; a webview reload control adds complexity for little gain). Owner: Daniel, during
  dogfooding. Acceptance criterion: decision + rationale recorded in this task before T32
  submission; if overridden, the chosen mechanism (e.g. `CSS overscroll-behavior` tweak or a
  reload gesture) gets its own follow-up task with device QA.
  TDD where possible (the hide-splash bridge call from `_app`); rest is device QA.

- **T28 — Release ops: deploy freeze + upgrade checklist** · repo: `ops` · deps: none
  Files: `STORE_REVIEW_FREEZE.md` flag + CI check (or GitHub environment protection on the
  Amplify-deploy workflow), `docs/pwa-design/capacitor-upgrade-checklist.md` (Gate-1 procedure, SW/
  IndexedDB on iOS, cookie smoke, auth round-trip, release-notes re-read per Capacitor major).

- **T29 — Fastlane CI build + signing lanes** · repo: `ops` · deps: T26 ·
  **[BLOCKED: Daniel — Apple/Google accounts, signing keys]**
  Work: Fastlane match / Play App Signing, iOS+Android build lanes, stage/prod `SHELL_TARGET`
  variants.

- **T30 — End-to-end push QA on devices** · repo: `both` · deps: T2–T6, T8, T12–T15, T17, T26 ·
  **[BLOCKED: Daniel upstream via T8]**
  Work: fcm-v1-backend.md §5.4 7-step validation (admin user on staging — non-admin pushes drop
  silently), both platforms, tap → deep link cold/warm/logged-out, token rotation via reinstall,
  logout stops delivery. Plus push-registration §6.3 and deep-links §6.4 manual checklists
  (AASA CDN check, `adb pm get-app-links` verified).

- **T31 — Offline viewer (shell v1.1)** · repo: `mpdx-react` · deps: T20, T27 (build in parallel
  with T29/T32 — does NOT block store submission)
  Files: extend `/offline` precached route into an unauthenticated CSR viewer reading the persisted
  cache (`cachePersistor.restore()`), session-stub provider reusing existing list/detail components
  + shared `.graphql` documents, `offlineViewerSession` marker (set on login, cleared by
  `clearApolloData()`), Phase 2 `persistenceMapper` hardening, precache-manifest assertion for
  viewer chunks.
  TDD: viewer-entry mount tests (catch session-coupling regressions); marker gating; ~3-week
  estimate. Dedicated security review before ship (cache-at-rest encryption is the fallback if
  review demands it).

- **T32 — Store submission** · repo: `ops` · deps: T20–T22, T25–T30 ·
  **[BLOCKED: Daniel — store accounts, listings, privacy declarations]**
  Work: capacitor-shell §11 checklist — listings, privacy labels / Data Safety (photos declared per
  camera doc §6), **Apple 4.2 receipts document** (push, camera demo-ready, in-session offline,
  universal links, native polish), demo account, deploy freeze active, one rejection cycle budgeted.

### Suggested sequencing summary

1. **T1** (gate) — and simultaneously start **T2, T3, T7, T10, T18, T23** (none depend on T1).
2. Backend chain T3→T4→T5→T6 while frontend does T11→T12→{T13, T14, T15}→T16→T17.
3. After T1 gates: T20→T21, T22, T24→T25, T26, T27 in parallel lanes.
4. T8/T9 (Daniel) whenever unblocked — they gate only T30/T32, not code.
5. T28–T30, then T32 submission with T31 building in parallel.

---

## 3. Cross-area contracts

### 3.1 deepLink payload contract (backend ⇄ frontend)

| Aspect | Value |
| --- | --- |
| Value format | Same-origin web path: path + optional query, no scheme/host, exactly one leading `/`. Example: `/accountLists/<alid>/contacts/<cid>?tab=Donations` |
| Ruby opts key | `:deep_link` (snake_case) — injected by `NotificationType#user_notification_options` (via `DeepLinkBuilder`) and `Task::NotificationWorker` |
| FCM v1 wire | `message.data.deepLink` — **string** (FCM v1 rejects non-string data values); all other data values string-coerced |
| APNs wire | Top-level custom key `deepLink` alongside `aps` (NOT inside `link`); legacy `link: { data: ... }` retained until the old iOS app is retired |
| Frontend read | `notification.data.deepLink` in `pushNotificationActionPerformed`, via `routeFromPushData()` (sanitized; fallback `/accountLists`) — owned by `NativeDeepLinkProvider` |
| Tab values | Exact `ContactDetailTabEnum` strings: `Tasks`, `Donations`, `Referrals`, `ContactDetails`, `Notes` (frontend parses `query.tab`) |
| Route map | Single notification → contact detail (+tab per type); multi-notification batch → `/accountLists/:alid` (dashboard); `NewPartnerDuplicateNotMerged` → `/accountLists/:alid/tools/merge/contacts`; task reminder → `/accountLists/:alid/tasks` (placeholder, pending Daniel); unmapped future types → contact detail if contact present, else dashboard |
| Security | Frontend must same-origin-validate (single `/`, no `//`, no scheme, no `\`); host check in `deepLinkFromUrl` is exact-match |

### 3.2 Device-registration API contract (backend ⇄ frontend proxy)

| Aspect | Value |
| --- | --- |
| Endpoint | `POST /api/v2/user/devices` (JSON:API, Bearer auth) — called only by the Next REST proxy (`registerUserDevice` mutation), never directly from client JS |
| Create body | `{ data: { type: 'user_devices', attributes: { platform, token, version, locale } } }` — all four presence-validated |
| `platform` | `'APNS'` (iOS raw APNs token) or `'GCM'` (Android FCM token) — uppercase; GCM is the SNS platform name, do not rename |
| `locale` | Must be in Rails `I18n.available_locales`; frontend maps via `toDeviceLocale()` (`fr` → `fr-FR`, unknown → `en`) |
| `version` | Shell version from `App.getInfo().version`, fallback `'0.0.0'` |
| Response | Serializer returns `id, platform, version, locale` (+timestamps) — **never `token`**; client stores its own last-registered token in localStorage |
| Idempotency | Server-side `delete_conflicting_device` on (platform, token); client-side token+locale comparison skips redundant POSTs |
| Delete | `DELETE /api/v2/user/devices/:id` using the stored id, fired by `logoutCleanup()` BEFORE cache purge (token must still be valid); 401 on the AUTHENTICATION_ERROR path is swallowed |
| GraphQL surface | `pages/api/Schema/UserDevices/`: `registerUserDevice(input)` → `UserDevice`, `destroyUserDevice(input)` → `{ success }` |

### 3.3 Other shared agreements

- **Single detection module:** `src/lib/nativeShell/nativeShell.ts` exports `isNativeShell()` and
  `getDevicePlatform()` and is the only static `@capacitor/core` import. All plugins load via
  dynamic `import()` behind it. All shell-aware web code lives under `src/lib/nativeShell/`
  (camera's hook stays in `src/hooks/` per repo hook-placement convention but gates through this
  module).
- **Signout invariant (extended):** every session-ending path calls `logoutCleanup()` =
  `disablePush` (DELETE + plugin unregister) → CacheStorage clear → `clearDataDogUser` →
  `clearApolloData()`. The v1.1 offline-viewer session marker is also cleared by
  `clearApolloData()`. New signout paths must use `logoutCleanup()`.
- **Auth redirect contract:** deep links navigate immediately; RouterGuard owns the login
  round-trip via `/login?redirect=<href>`. The native auth flow (T20) must return the user to the
  current URL / `?redirect=` target after the system-browser round-trip — explicit device QA item.
- **Identity placeholders (consistent everywhere until Daniel confirms):** Android applicationId
  `org.mpdx` (reuse, recommended) — appears in `capacitor.config.ts`, Firebase app registration,
  assetlinks; iOS bundle `org.cru.mpdx` + team `DQ48D9BF2V` — appears in AASA, Xcode, APNs platform
  app; iOS auth scheme `org.mpdx://auth-callback` must be revisited to match the final appId.
  Provenance note: the iOS "placeholder" `DQ48D9BF2V.org.cru.mpdx` is not invented — it is
  inherited from the legacy misnamed `public/.well-known/apple-app-site-association.json`
  committed in-repo (202 bytes; appID `DQ48D9BF2V.org.cru.mpdx`, legacy paths
  `/accountLists/*/contacts/*`, `/contacts/*`, `/auth/mobile`), so it was real for the old native
  app — Daniel confirms it is still current (open question 5).
- **Capacitor major:** whatever T1 scaffolds (Capacitor 7 expected; verify current at install) pins
  every `@capacitor/*` package; upgrades run the §10.3 checklist.
- **AASA / assetlinks serving:** `Content-Type: application/json`, direct 200, no redirect —
  enforced in both `next.config.ts` and `customHttp.yml`, verified by release-checklist curl.

### 3.4 Contradiction resolutions (binding)

| # | Conflict | Resolution — winner / loser |
| --- | --- | --- |
| R1 | Detection module: camera doc says `src/lib/capacitor.ts` `isNativePlatform()`; push doc says `src/lib/nativeShell/nativeShell.ts` `isNativeShell()`; shell doc sketches `isShell.ts` | **`src/lib/nativeShell/nativeShell.ts` with `isNativeShell()`/`getDevicePlatform()` wins** (push-registration doc). Camera doc loses (`src/lib/capacitor.ts` is not created); shell doc's `isShell.ts` name loses. Camera tests mock `src/lib/nativeShell/nativeShell` instead. |
| R2 | Push-tap data field: push-registration §3.3 reads `notification.data?.route`; fcm-v1 + deep-links say `deepLink` | **`deepLink` wins** (fcm-v1 + deep-links). Push-registration doc loses; its bootstrap snippet's `route` key is wrong. |
| R3 | Tap-listener ownership: push-registration puts `pushNotificationActionPerformed` in `PushBootstrap`; deep-links puts it in `NativeDeepLinkProvider` | **`NativeDeepLinkProvider` wins** (deep-links) — it owns sanitization, the cold-start latch, and `appUrlOpen`; one listener, one routing core. `PushBootstrap` is registration-lifecycle only. Push-registration doc loses this listener (its tests for tap routing move to T17). |
| R4 | Multi-notification route: fcm-v1 placeholder `WebRouter.contacts_path` (contacts list); deep-links says dashboard `/accountLists/:alid` | **Dashboard wins** (deep-links — the route-mapping owner; fcm-v1 explicitly marked its value PLACEHOLDER). `contacts_path` helper still ships (harmless, used nowhere critical) or may be dropped in T3. |
| R5 | `user_notification_options` implementation: fcm-v1 inlines WebRouter paths; deep-links routes through `DeepLinkBuilder` | **DeepLinkBuilder version wins** (deep-links) — single mapping authority, per-type tabs, future-type fallback. fcm-v1's sketch loses; its WebRouter refactor (T3) is retained as the path-string source DeepLinkBuilder and `contact_url` share. |
| R6 | Shell-doc file sketch (`useNativePush.ts`, `useDeepLinks.ts`, `useNativeAuth.ts`) vs area docs' concrete names | **Area docs win on file names** (`pushRegistration.ts`, `deepLink.ts` + `NativeDeepLinkProvider`); `useNativeAuth.ts` stands (shell doc is the auth owner). The shell doc's layout was indicative. |
| R7 | Call-site count: fcm-v1 §3 says `deep_link` enters opts at "three call sites" (counting the WebRouter refactor); deep-links §1.1 and T5 say "both call sites" | **Two call sites is canonical** — the actual opts-injection sites are `notification_type.rb#user_notification_options` and `task/notification_worker.rb`. The WebRouter work is a path-helper refactor (T3), not an injection site. Cosmetic only; work items already reconcile. fcm-v1 §3 heading corrected. |
| R8 | AASA file state: capacitor-shell §11 said `apple-app-site-association` is "currently EMPTY — recreate"; deep-links + this plan describe a misnamed `apple-app-site-association.json` with real legacy content | **deep-links/master plan version is factually correct** (verified 2026-06-10: extensionless file does not exist; `apple-app-site-association.json` has 202 bytes incl. appID `DQ48D9BF2V.org.cru.mpdx`). Shell doc §11 corrected. No work changes — T18 supersedes either reading. The legacy file is also the provenance of the iOS identity "placeholders" (§3.3). |
| R9 | Signout chain: §1 push summary omitted `clearDataDogUser`; §3.3 included it; T13's test list mentioned neither | **§3.3 chain is canonical:** `disablePush` → CacheStorage clear → `clearDataDogUser` → `clearApolloData()`. §1 and T13 corrected to match. |

---

## 4. Consolidated open questions for Daniel

**Accounts / credentials (blocking T8, T9, T29, T32):**

1. **AWS SNS console:** GCM platform-app credential type today (legacy API key vs FCM v1 Token)?
   Is the original legacy Firebase project recoverable (keeps sender ID / any surviving tokens
   valid)? APNs platform app: cert (.p12, expiry?) or .p8 token, and what bundle ID is it
   configured for?
2. **Firebase:** project + `google-services.json` for the shell's Android app — must be the SAME
   project as the SNS credentials (SENDER_ID_MISMATCH trap).
3. **Okta admin:** can a native public PKCE client be registered (redirect URIs
   `org.mpdx://auth-callback`, `https://mpdx.org/auth/native-callback`)? Does org policy allow
   `offline_access` refresh tokens for public clients (needed only if cookie Plan B activates)?
4. **Android identity:** do we control the Play listing for `org.mpdx` and hold/retain its Play App
   Signing key? Reuse (recommended — assetlinks unchanged, installs migrate) vs new package?
5. **Apple identity:** is team `DQ48D9BF2V` still Cru's? Reuse bundle `org.cru.mpdx` (update the
   old App Store listing) or new bundle ID? Team ID + bundle fill AASA, Xcode, APNs `.p8`.
   Context: both values come from the legacy `apple-app-site-association.json` committed in-repo
   (§3.3 provenance note), so they were real for the old native app — the question is whether they
   are still current.

**Product decisions:**

6. Push sound: keep silent banners (current design) or add `aps.sound` /
   `android.notification.sound: 'default'`?
7. Is the legacy native iOS app formally retired (lets us drop the APNs `link` key)?
8. Deep-link tab mapping sign-off (deep-links §1.2), especially `NewPartnerDuplicateNotMerged` →
   merge tool, multi-notification → dashboard, and task reminders → tasks list (or
   `/tasks?taskId=<id>`?).
9. After logout + re-login on the same device: should push re-enable automatically (preserve
   `mpdx_push_enabled` across `logoutCleanup`) or require re-opting-in from settings (current
   design)?
10. "In App" column relabel copy ("Mobile App"?) — and does the `app` flag have any consumer today
    besides push (e.g. an in-app notification list)? Final i18n copy for the settings card.
11. Shell sign-out scope: MPDX only (design default) or also kill the system browser's Okta SSO
    session across apps?
12. Offline viewer (v1.1): is the session-marker + device-lock posture acceptable, or scope
    cache-at-rest encryption? And: comfortable submitting v1 before the viewer lands (push + camera
    + in-session offline as the 4.2 defense), accepting a possible rejection cycle?
13. Camera follow-ups: settings deep-link on permission denial worth the `capacitor-native-settings`
    community dependency, or copy-only for v1? Schedule or backlog the web-path offline-copy ticket?

**Verification asks (cheap):**

14. One curl after a preview deploy: does Amplify serve Next `headers()` for `public/` assets
    (AASA content type)? Does prod mpdx.org do any apex/www or http→https redirect on
    `/.well-known/*`?
15. Apple privacy labels / Play Data Safety: Daniel files the photos-data declarations (answers
    specified in camera doc §6).

---

## 5. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| **Bridge injection fails on the remote origin** (invalidates `server.url` architecture) | T1 Gate 1 on day one, before anything else is built. Only this gate failure stops Phase 4. |
| **WKWebView cookie persistence flaky** → users re-auth constantly | Day 2 persistence battery (Gate 3); degraded = near-silent SSO re-auth; proven-flaky = Plan B Keychain refresh token (pre-designed, `offline_access` question already asked). |
| **SENDER_ID_MISMATCH** — SNS FCM credentials and shell `google-services.json` from different Firebase projects → every Android send fails silently | Runbook hard rule: same project for both; `aws sns publish` smoke test before app-level QA; CloudWatch delivery-status logging. |
| **APNs bundle-ID mismatch** with the legacy platform app | Console check first (T8); if new bundle, create a new platform app + `SNS_APNS_APPLICATION_ARN` change + ECS redeploy (env read at boot). |
| **Apple 4.2 rejection** | Camera demo-ready at first submission, receipts document, offline viewer building in parallel, one rejection/appeal cycle budgeted in the timeline. |
| **`server.url` "not intended for production"** posture changes in a future Capacitor major | Single-host rule avoids all documented failure modes today; mandatory per-major upgrade checklist (T28) re-runs Gate 1. |
| **New auth surface** (`native-okta` callback, token proxy) abused | Trust-equivalent to the already-public `oktaSignIn` mutation; rate limiting, NextAuth CSRF, no body logging, Critical-pattern security review; raw-token log line removed (T7). PKCE state/verifier in memory only. |
| **Deep-link open redirect** | Path-only contract + `sanitizeDeepLinkPath` (single `/`, no scheme/`//`/`\`), exact host match, fallback route; table-driven tests are the spec. |
| **Locale list drift** between `deviceLocale.ts` and Rails `fast_gettext.rb` → 422 on registration | Frozen const with pointer comment; consider retry-with-`'en'` on 422 as cheap hardening during T12. |
| **Relabeling "In App" breaks another consumer of the `app` flag** | Open question #10 before T14 merges; relabel is copy-only and trivially reversible. |
| **Client sends pushes nobody sees on staging** (non-admin drop guard) | QA note baked into T30: staging test users must be admins. |
| **Web regressions from shell code** | Everything gates on `isNativeShell()`; plugins are dynamic imports; anchor regression tests (PersonName web path unchanged, signout paths unchanged, bootstrap never prompts) are mandatory red-first tests. |
| **Flat-opts invariant** — `transform_values(&:to_s)` corrupts nested hashes | publish_service spec encodes the invariant; callers currently comply; convention documented. |
| **Deploy during store review changes what reviewers see** | `STORE_REVIEW_FREEZE.md` CI flag / environment protection (T28). |
| **NextAuth v4 maintenance mode** | Accepted: ~80 paved-road lines beat bespoke JWE minting; Auth.js v5 migration named as a future project; CredentialsProvider pattern survives the migration. |
| **End-to-end push untestable until shell + credentials exist** | Unit coverage is strong and lands dark; T30 is the explicit integration gate; `aws sns publish` smoke decouples SNS validation from app readiness. |
