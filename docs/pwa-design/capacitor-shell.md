# Capacitor Shell Architecture — Phase 4 (DECIDED)

Status: DESIGN — 2026-06-10 (synthesis of three judged proposals; unanimous judge verdict)
Owner repos: `mpdx-react` (shell, auth, web changes), `mpdx_api` (deploy config, one log fix)
Coordinates with: `push-registration-frontend.md` (push wiring), `deep-links.md`
(link format + `.well-known`), `camera-contact-photo.md` (Apple 4.2 anchor),
`fcm-v1-backend.md` (Android push payloads).

---

## 0. Decision

**Winning architecture: the "pragmatic hybrid"** — a thin Capacitor 7 shell in
`server.url` mode pointed at the hosted Next.js app, with a deliberately tiny
local layer, system-browser PKCE auth landed via a NextAuth
**CredentialsProvider**, and a staged (v1.1) same-origin offline viewer for
cold-start offline.

All three judges (auth/security lens, offline/UX lens, maintenance/release-ops
lens) independently ranked hybrid first. No fatal flaw was found that the
judges missed; this synthesis follows their consensus and grafts in the best
ideas from the two runners-up:

- **From `server-url`:** the single-host rule (`allowNavigation: []` —
  sidesteps every documented Capacitor remote-URL bug), `appendUserAgent`
  as the version-handshake transport, the day-one acceptance-gate structure,
  the Apple-review "receipts" document, and the deploy-freeze-during-review
  process rule.
- **From `bundled-shell`:** Keychain-stored refresh token as the
  cookie-flakiness contingency (Plan B, §4.6), push device deregistration
  wired into the signout invariant, the camera feature demo-ready at first
  submission, and shared `.graphql` documents keeping any second render
  surface in codegen lockstep.

### Why hybrid wins (judge consensus, condensed)

1. **Auth on the paved road.** The webview itself makes a same-origin
   `signIn('native-okta', ...)` POST through NextAuth's own
   `/api/auth/callback/native-okta`, so NextAuth sets the session cookie with
   its standard CSRF protection, cookie attributes, and chunking. No manual
   `next-auth/jwt encode()`, no bespoke cookie-minting endpoint, no session
   credential ever crossing the system-browser/webview boundary — only a
   single-use, Okta-enforced PKCE authorization code crosses (RFC 8252).
   `authorize()` calls the same public `oktaSignIn` mutation the existing
   OktaProvider path calls; the Rails API validates the token server-side
   exactly as today. Smallest new attack surface of the three proposals
   (~80 lines in the existing handler + one secretless token-proxy route).
2. **The web app is the app.** Zero UI drift, Phase 1/2 SW + IndexedDB work
   transfers wholesale, every web deploy lands in every installed shell
   instantly with no store review and no OTA infrastructure. One release lane
   for web, one rarely-used Fastlane lane for the binary.
3. **The only cold-start-offline design whose data is fresh.** Web storage is
   origin-partitioned in WKWebView and Android WebView — a bundled
   `capacitor://localhost` page can **not** read `https://mpdx.org`'s
   IndexedDB. The hybrid's same-origin offline viewer (v1.1) reads the very
   cache the user's daily usage keeps warm, with no second purge path: the
   `clearApolloData()` invariant already covers it.
4. **Bounded downside.** Shell v1 is strictly a superset of the plain
   `server.url` proposal (a bundled `errorPath` page added). If v1.1 slips,
   nothing is stranded.

Rejected alternatives, for the record:

- **`server-url` (pure)** — rejected because its bespoke handoff-code auth
  (three new routes touching `JWT_SECRET`, a session-equivalent credential in
  a GET query string that lands in Amplify/CloudWatch logs, no single-use
  enforcement on stateless lambdas) was judged the weakest security design,
  and it permanently forecloses cold-start offline.
- **`bundled-shell`** — rejected because its bundled-origin offline reader
  cannot read the cache daily usage maintains (stale-or-empty cold-start
  data), it requires a second frontend build artifact plus OTA infrastructure
  (Appflow is discontinued for new customers; Capgo self-host is new ops
  surface — three permanent release lanes), and its camera-on-remote-pages
  tier depends on bridge injection into `allowNavigation` hosts — the exact
  documented-broken case on Android (Capacitor #4164). Its auth robustness
  (Keychain bearer) is grafted in as Plan B instead.

---

## 1. Core shape

### 1.1 Primary surface: `server.url` → hosted app

The Capacitor 7 webview loads the hosted Amplify SSR app:

- prod: `https://mpdx.org`
- stage: `https://next.stage.mpdx.org` (debug/stage builds, env-switched at
  build time)

Forced by reality: 64 of 69 pages export `getServerSideProps`
(`makeGetServerSideProps` — session extraction, not data fetching), there is
no static export, dynamic routes (`[accountListId]`, `[contactId]`) are not
enumerable, and Phases 1+2 hardened the *web* delivery. A bundled build of the
product would be a multi-week routing migration for negative benefit.

**The single-host rule (grafted from `server-url`):** `allowNavigation` stays
**empty**. Every webview navigation stays on the one app host; all external
URLs (Okta, Helpjuice, donor links) open in the system browser. This sidesteps
every documented Capacitor remote-URL failure mode: Android plugin loss on
`allowNavigation` pages (#4164, #5455, #7930), platform-detection breakage
after redirects (#7454), and the Android proxy's historical `set-cookie` drops
on cross-host OAuth chains.

### 1.2 Local layer (deliberately tiny)

1. **Bundled `server.errorPath` page** (`error.html` in the web-stub dir):
   shown when the remote app fails to load (first-ever launch offline, server
   down). Branding + Retry + a `navigator.onLine` listener that reloads when
   connectivity returns. **Keep it dumb** — on Android the errorPath page has
   no plugin access (Capacitor docs), so vanilla HTML/JS only, no framework,
   no data. This is the *only* bundled web content in v1.
2. **Same-origin offline viewer — shell v1.1, not v1** (§5).

### 1.3 Honest caveat on `server.url`

Capacitor's docs label `server.url` "not intended for use in production." It
is nonetheless widely shipped in production, the bridge IS injected into pages
served from the configured host (that is exactly how live-reload works), and
the documented failure modes are all secondary-host cases the single-host rule
avoids. Mitigations: the day-one prototype gate (§7) exists to falsify the
premise in hour one, and **every Capacitor major upgrade gets a mandatory
re-verification pass** — see the upgrade checklist (§10.3), which makes this a
budgeted recurring task rather than an unbudgeted surprise (judge 3 concern).

---

## 2. Repo layout and Capacitor config

In-repo in `mpdx-react` (confirms the prior decision) — same PRs update web
code, shell helpers, and native projects together.

```
mpdx-react/
├── capacitor.config.ts          # committed, env-switched server.url
├── ios/                         # committed native project (Pods/ gitignored)
├── android/                     # committed native project (build dirs gitignored)
├── capacitor-web/               # webDir stub: error.html only (v1)
├── docs/pwa-design/capacitor-shell.md            # this doc
├── docs/pwa-design/capacitor-upgrade-checklist.md # §10.3
└── src/lib/nativeShell/         # all shell-aware web code lives here
    ├── isShell.ts               # Capacitor.isNativePlatform() wrapper + UA fallback
    ├── useNativeAuth.ts         # platform-aware signIn/signOut helper (§4)
    ├── useNativePush.ts         # per push-registration-frontend.md
    ├── useDeepLinks.ts          # appUrlOpen → router.push (per deep-links.md)
    ├── shellVersion.ts          # UA parse + semver compare (§8)
    └── UpgradeRequiredScreen.tsx
```

`capacitor.config.ts`:

```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.cru.mpdx', // PLACEHOLDER — see open question on org.mpdx reuse
  appName: 'MPDX',
  webDir: 'capacitor-web', // error.html stub; server.url overrides everything else
  server: {
    url: process.env.SHELL_TARGET === 'stage'
      ? 'https://next.stage.mpdx.org'
      : 'https://mpdx.org',
    errorPath: 'error.html',
    // allowNavigation: deliberately ABSENT (empty) — single-host rule, §1.1
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true, // REQUIRED — see below
  },
  appendUserAgent: `MPDXShell/${shellVersion}`, // version handshake, §8
};
```

`ios/App/App/Info.plist` additions:

- `WKAppBoundDomains = [mpdx.org]` (+ `next.stage.mpdx.org` in debug builds).
  This single key is load-bearing: it is what unlocks **service workers and
  durable storage in WKWebView** (iOS 14+, max 10 domains), and per Capacitor
  iOS troubleshooting docs, `limitsNavigationsToAppBoundDomains: true` must
  accompany it or bridge injection fails ("plugin not implemented").
  Constraint accepted: the webview is hard-capped to listed domains —
  currently theoretical since all external links open in the system browser.

CSP check: the app currently sets no CSP headers (`next.config.ts` has none;
Amplify `customHttp.yml` only sets `sw.js` no-cache). If CSP is ever added,
Android's injected bridge script must be allowed (iOS `WKUserScript` injection
is CSP-exempt). Add a comment to that effect wherever CSP lands.

### 2.1 Plugins (v1 set)

| Plugin | Use |
| --- | --- |
| `@capacitor/app` | `appUrlOpen` (deep links + auth callback), `getInfo()` (version) |
| `@capacitor/browser` | system-browser auth (SFSafariViewController / Custom Tabs) |
| `@capacitor/push-notifications` | Phase 3 (see push-registration-frontend.md) |
| `@capacitor/camera` | contact photo capture (see camera-contact-photo.md) |
| `@capacitor/splash-screen` | §9 |
| `@capacitor/status-bar` | §9 |
| `@capacitor/haptics` | §9 (key actions) |
| `@capacitor/device` | prototype verification + diagnostics |
| `@capacitor/network` | optional; web `navigator.onLine` already drives `useIsOnline` |

Deferred until Plan B triggers (§4.6): a secure-storage plugin
(Keychain/Keystore) for the Okta refresh token.

All plugin calls live behind `src/lib/nativeShell/` gates on
`Capacitor.isNativePlatform()` — browsers never execute shell code paths.
`ServiceWorkerUpdatePrompt`'s manual SW registration stays as-is (the webview
is a same-origin browser; the Serwist update flow works identically).

---

## 3. What transfers from Phases 1+2 (unchanged)

The webview is a browser on the same origin, so:

- Serwist allowlist SW (`src/service-worker/index.ts`) — Android WebView runs
  SWs for https normally; iOS runs them **only** with App-Bound Domains (§2).
- IndexedDB Apollo persistence (`src/lib/apollo/cachePersistor.ts`),
  `offlineLink` mutation blocking, `errorPolicy: 'all'`, `useIsOnline` +
  `OfflineNotifier` — in-session offline reads for contacts/tasks work in the
  shell for free.
- **Security invariants intact:** authenticated HTML/`__NEXT_DATA__` is never
  cached (Phase 1), and every signout path calls `clearApolloData()`
  (Phase 2). The shell adds to the signout invariant (§4.5) but never bypasses
  it.

---

## 4. Auth — the definitive flow

### 4.1 Premises (verified in code by the judges)

- NextAuth v4, **JWT session strategy** (`pages/api/auth/[...nextauth].page.ts:156`,
  secret `JWT_SECRET`); the OktaProvider `signIn` callback swaps
  `account.access_token` for an MPDX `apiToken` via the public `oktaSignIn`
  GraphQL mutation, and **throws when `account.access_token` is absent**
  (line ~161).
- `oktaSignIn` / `apiOauthSignIn` are public rootFields on
  `api.mpdx.org/graphql` (`src/graphql/rootFields.generated.ts:71,120`); the
  Rails validator (`okta_validator_service.rb:37-46`) allowlists the access
  token's `cid` against comma-split `OKTA_AUTH_CLIENT_IDS` and validates
  server-side via Okta userinfo. The `apiToken` is a 30-day JWT
  (`authenticate.rb:11`).
- `RouterGuard.tsx:32` calls `signIn('okta')` directly; `src/lib/apollo/client.ts`
  has the `AUTHENTICATION_ERROR` → `signOut` path. Both must become
  platform-aware.
- Okta and Google block embedded webviews (`disallowed_useragent`), so the
  interactive login MUST run in a system browser — but the NextAuth session
  cookie must end up in the **webview's** jar, and the system browser's jar is
  separate. The trick: **never run NextAuth's OAuth redirect dance in the
  system browser at all.** The system browser only obtains an Okta access
  token; the webview itself makes the cookie-setting request.

### 4.2 Flow, step by step (Okta provider)

1. **Okta app registration (admin task, blocked on Daniel):** a NATIVE public
   client, PKCE, no secret. Redirect URIs: `org.mpdx://auth-callback` (iOS)
   and `https://mpdx.org/auth/native-callback` (Android verified App Link —
   see §4.4). Scopes: `openid email profile` (+ `offline_access` only if
   Plan B activates, §4.6).
2. **Backend deploy-config change (corrects the proposal's "no backend
   changes" claim — judge 1 concern #1):** append the new client's ID to
   `OKTA_AUTH_CLIENT_IDS` in mpdx_api deploy config (cru-deploy/ECS), or
   `oktaSignIn` rejects with "Invalid access_token cid." One line, but it is
   real backend coordination — schedule it with the Okta registration.
3. All "start login" call sites (`RouterGuard.tsx:32`, login page, the Apollo
   `AUTHENTICATION_ERROR` handler's re-auth path) route through one helper in
   `src/lib/nativeShell/useNativeAuth.ts` that branches on
   `Capacitor.isNativePlatform()`: browsers keep `signIn('okta')` unchanged;
   the shell runs steps 4–8.
4. Webview JS generates PKCE `code_verifier`/`challenge` + `state` (held in
   memory only — never persisted, never logged), opens the Okta `/authorize`
   URL via `@capacitor/browser`: SFSafariViewController on iOS (upgrade to an
   ASWebAuthenticationSession plugin if SFVC dismissal UX is poor — both are
   system-browser contexts that pass Okta's user-agent check), Chrome Custom
   Tabs on Android. The user authenticates; Okta's SSO cookie lives in the
   system browser — that separation is a **feature** (RFC 8252: SSO shared
   across apps, credentials never visible to our code).
5. Okta redirects to the callback (§4.4); Capacitor's `appUrlOpen` (or the
   ASWebAuthenticationSession completion handler) delivers the URL. JS
   validates `state`, calls `Browser.close()`.
6. Webview JS exchanges `code + verifier` for the Okta access token via a
   small Next.js API route **`/api/auth/native/token`** that proxies Okta's
   token endpoint (avoids Okta CORS/Trusted-Origin configuration; the client
   is public so no secret is involved; the route forwards only the code
   exchange and returns the token to same-origin callers).
7. **The cookie move:** webview JS calls `signIn('native-okta', { accessToken })`
   — `next-auth/react` first fetches `/api/auth/csrf`, then POSTs to
   `/api/auth/callback/native-okta`, all same-origin **from inside the
   webview**, so NextAuth's `Set-Cookie` (session JWT,
   `__Secure-next-auth.session-token`, HttpOnly/Secure/Lax) lands directly in
   the WKWebView / Android WebView cookie jar. No cookie ever transfers
   between jars.
8. NextAuth changes in `pages/api/auth/[...nextauth].page.ts` (~80 lines,
   Critical-pattern file — mandatory security review):
   - **CredentialsProvider `native-okta`** whose `authorize()` runs the same
     `oktaSignIn` mutation the OktaProvider path runs and returns the user
     with `apiToken`/`userID`. No new trust is granted: the Rails API
     validates the Okta token server-side; garbage tokens fail exactly as
     they would today. CredentialsProvider requires the JWT session strategy
     — already in use. The existing `jwt`/`session` callbacks run unchanged.
   - **`signIn` callback branch:** early `return true` for
     `account.provider === 'native-okta'` (authorize already did the work);
     the existing throw stays for every other provider.
9. Steady state: the webview holds a first-party NextAuth session cookie;
   SSR/`getServerSideProps` session checks, `useSession`, Apollo
   `makeAuthLink(apiToken)` — identical to the browser. NextAuth's 30-day
   rolling session applies. When the embedded `apiToken` expires (the session
   callback throws "Expired API token"), RouterGuard's existing
   connectivity-gated re-auth fires the step-3 helper → system browser
   reopens → surviving Okta SSO makes it near-silent (a brief browser sheet
   flash).

**API_OAUTH variant (Doorkeeper):** same shape. Backend change = register a
**public** (secretless) Doorkeeper application with the native redirect URIs
(Doorkeeper PKCE is already exercised — the existing provider sets
`checks: ['pkce','state']`); the CredentialsProvider calls `apiOauthSignIn`
instead. This is also the prototype's fallback path if Okta admin is slow —
Daniel controls Doorkeeper client registration on stage.

### 4.3 Security posture of the new endpoints (judge 1 concern #3)

`/api/auth/callback/native-okta` is publicly reachable from any browser:
anyone holding a valid, allowlisted Okta access token can mint a NextAuth web
session cookie. This is **trust-equivalent to the already-public `oktaSignIn`
mutation** (same credential, same server-side validation, same resulting
capability), so no privilege is added — but both new surfaces get hardening:

- Rate-limit `/api/auth/native/token` and rely on NextAuth's built-in CSRF
  for the credentials callback.
- The token-proxy route accepts only the fields needed for the code exchange,
  never logs request bodies, and returns Okta errors opaquely.
- Both files are Critical-pattern (`pages/api/auth/**`) — route the PR through
  the security agent with this section as context.
- **Token-handling rules in webview JS (judge 1 concern #5):** the Okta access
  token transits JS memory between steps 6 and 7 — exchange immediately, hold
  in a local variable only, never in storage/Redux/Apollo, never logged. XSS
  in the hosted app could harvest it during the seconds it exists; this is
  the same exposure class as the existing apiToken-in-session, and the window
  is seconds, not a session. Webview process death mid-login simply restarts
  the flow (state/verifier are per-attempt). A future hardening option is
  moving PKCE + exchange fully into the native layer; not needed for v1.

### 4.4 Callback transport (judge 1 concern #6)

- **Android: verified App Link** — `https://mpdx.org/auth/native-callback`
  with `autoVerify` intent filter backed by `assetlinks.json`. Custom schemes
  are claimable by malicious apps on Android; verified App Links are not.
  PKCE already makes an intercepted code useless, but prefer the verified
  channel. (The page itself is a no-op fallback that says "return to the app"
  for the edge case where verification fails and it opens in a browser.)
- **iOS: custom scheme `org.mpdx://auth-callback`** via
  SFSafariViewController + `appUrlOpen` (or ASWebAuthenticationSession, whose
  completion handler captures the callback in-process — not interceptable the
  way Android schemes are). Per `deep-links.md`, the custom scheme is reserved
  exclusively for the OAuth return.

### 4.5 Sign-out

Native-aware signout path, in order:

1. DELETE the push device registration (`/api/v2/user/devices/:id`) while the
   token is still valid — per push-registration-frontend.md.
2. Run the existing web signout, which calls **`clearApolloData()`** (pause →
   clearStore → purge — the Phase 2 invariant, extended: "clear Apollo data +
   deregister device + clear offline-viewer session marker (§5.3)").
3. Default: **skip** the Okta `/login/signout` redirect in-shell — it would
   log the user out of the system browser's SSO across all apps. Product
   decision; flagged as an open question.

### 4.6 Plan B — Keychain refresh token (grafted from `bundled-shell`)

WKWebView cookie persistence has a documented flakiness history (Capacitor
#6809, #1373). The design does NOT depend on solving it: cookie loss degrades
to a near-silent system-browser SSO re-auth (a browser-sheet flash), which is
annoying, not fatal. **If** the Day 2 persistence battery (§7) shows cookies
evaporating in practice, activate Plan B:

- Request `offline_access` on the native client; store the Okta refresh token
  in iOS Keychain / Android Keystore via a secure-storage plugin.
- On cookie loss or apiToken expiry: natively refresh the access token, then
  re-run step 7 (`signIn('native-okta', ...)`) silently from the webview — no
  browser flash, no user interaction.
- Preconditions to verify before relying on it: the Okta org grants refresh
  tokens to public native clients (org policy — open question), and the
  secure-storage plugin choice passes review. Plan B adds auth surface
  (long-lived credential on device), so it ships only if the battery proves
  it necessary.

---

## 5. Offline story

### 5.1 v1: in-session offline + errorPath

Phase 2 in-session offline transfers unchanged (§3). Cold-start offline in v1
is the branded `error.html` retry page — same as the web's posture today, and
explicitly roadmap-approved.

### 5.2 v1.1: same-origin offline viewer (the hybrid payoff)

The naive "bundled viewer reads the persisted cache" is dead on arrival:
IndexedDB/CacheStorage/localStorage are origin-scoped in both WKWebView
(`WKWebsiteDataStore`) and Android WebView (Chromium). Bundled
`capacitor://localhost` content cannot read `https://mpdx.org`'s IndexedDB.
A native-mirror pipeline (plugin bridge + snapshot format + second purge path
duplicating the `clearApolloData()` invariant) was considered and rejected as
too much machinery for read-only views.

Instead: an **unauthenticated, CSR-only, SW-precached route on the app
origin** (extending the existing precached `/offline` page) that boots Apollo
from the persisted cache (`cachePersistor.restore()`) and renders read-only
contacts/tasks lists + details. Because it is precached and embeds no
session/`__NEXT_DATA__` secrets, it satisfies the Phase 1 security rule;
because it is same-origin, it reads the real cache the user's daily browsing
keeps warm — **fresh** cold-start data, the thing `bundled-shell` could not
deliver. The SW's `fallbacks` entry already routes failed navigations to
`/offline`, so cold-start offline becomes: launch → remote load fails → SW
serves the precached viewer → data from IndexedDB.

Preconditions (judge 2 concern #4 — each is a prototype/QA item, §7):

1. SW running in the webview (Android: yes for https; iOS: only with
   App-Bound Domains — set from day one so durability is proven before v1.1).
2. SW installed on a prior online launch (first-ever-launch offline still
   gets `error.html` — acceptable).
3. **All viewer route JS chunks in the precache manifest** — verify against
   `@serwist/next`'s generated manifest / `additionalPrecacheEntries` in
   `next.config.ts`; runtime CacheFirst with `maxEntries: 64` is NOT a
   substitute. Add a CI assertion if feasible.
4. IndexedDB survives multi-week disuse on device (ITP eviction should not
   apply to default WKWebView configs and app-bound domains get full storage
   entitlements — but prove it with a soak test).

### 5.3 Viewer access gate (judge 2 concern #2)

The viewer is unauthenticated by construction (precached HTML cannot embed a
session). Honest framing: the contact/task data already sits unencrypted in
IndexedDB — the viewer adds convenience, not new exposure; the device lock is
the real boundary. Mitigations, in scope for v1.1:

- A non-sensitive `offlineViewerSession` marker (localStorage: boolean + last
  user display name, no tokens) set on login and **cleared by
  `clearApolloData()`**; the viewer renders data only when the marker exists.
  This is a UX/abuse gate, not a cryptographic boundary — say so in the code
  comment.
- The viewer goes through the same security review process that produced the
  Phase 1 invariant before it ships. If review demands stronger gating, the
  fallback is encrypting the persisted cache at rest (a `persistCache`
  `serialize` hook) keyed by a native-stored secret — scoped only if demanded.

### 5.4 Estimate and staging (judge 2 concern #3, judge 3 concern #4)

Re-estimated at **3 weeks**, not the proposal's 1–2: 11 files use
`useRequiredSession`, `ContactsContext` is `next/router`-coupled, and a
session-less cache-only render path for list AND detail views is a real
refactor. Staging decision (resolves the "pull it forward is unactionable"
concern): **build the viewer immediately after shell v1 core, in parallel
with store-account/CI work — do not block first submission on it, but do not
wait for a rejection to start it.** If it lands before review concludes, it
joins the receipts list; if Apple rejects on 4.2, it is weeks from shipping,
not a cold start. Prerequisite folded in: the deferred Phase 2
`persistenceMapper` hardening (persist only the read-relevant subset) — the
viewer defines exactly which data matters. Drift control: the viewer reuses
the existing list/detail components with a session-stub provider and shares
the same `.graphql` documents, so codegen keeps it in lockstep; add tests that
mount the viewer entry to catch session-coupling regressions (judge 3's
"future contributors can silently break the fork" concern).

---

## 6. Push, deep links, camera (integration points)

Designed in detail in sibling docs; the shell decisions they depend on are
locked here:

- **Push** (`push-registration-frontend.md`): wiring lives in the *remote*
  web app (`useNativePush`, gated on `isNativePlatform()`) — valid because
  the bridge injects into the `server.url` host. Registration from the
  notification-settings UI (never on first launch), `registration` listener →
  POST `/api/v2/user/devices` (platform `APNS`/`GCM`), re-register on
  rotation, **deregister on every signout path** (§4.5).
  `pushNotificationActionPerformed` → `router.push(notification.data.deepLink)`.
- **Deep links** (`deep-links.md`): `appUrlOpen` → strip to same-origin path
  → `router.push`. `assetlinks.json` gains the new signing-cert fingerprint
  (keep the legacy `org.mpdx` entry); `apple-app-site-association` recreated
  with placeholder `TEAMID.org.cru.mpdx` until Apple account details land.
- **Camera** (`camera-contact-photo.md`): `@capacitor/camera` from the
  contact-detail page behind `isShell`; browsers keep the file-upload path.
  Works on the remote page because of the single-host rule (we never navigate
  to a second host, so we never hit #4164). **Demo-ready at first store
  submission** (grafted from both runners-up).

---

## 7. Day-one prototype — the FIRST implementation task

Nothing else in Phase 4 is built until these gates pass. The prototype
validates the two assumptions that can invalidate the architecture: bridge
injection on the remote origin, and the auth round-trip landing a working
session cookie in the webview.

**Day 1 AM — shell premise**

- `npx cap init` in `mpdx-react` (stage appId), add iOS + Android platforms,
  `capacitor.config.ts` with `server.url` → stage, `WKAppBoundDomains` +
  `limitsNavigationsToAppBoundDomains: true`, `error.html` stub.
- Verify on iOS simulator + Android emulator via Safari/Chrome inspector:
  `Capacitor.isNativePlatform() === true` on the remote page,
  `Device.getInfo()` resolves, `navigator.serviceWorker` defined and `sw.js`
  registers (iOS app-bound check), IndexedDB readable.
- **Gate 1: if bridge injection fails on the remote origin, the `server.url`
  premise is invalid — stop and escalate.** (The auth design survives — it is
  webview-agnostic — but the architecture around it does not.)

**Day 1 PM — auth spike**

- Negative control: tap the existing `signIn('okta')` in the webview; record
  the exact Okta failure (evidence for the system-browser decision).
- Wire the spike on a stage branch: stage native PKCE client (**Doorkeeper
  `API_OAUTH` path if Okta admin hasn't responded** — Daniel controls stage
  Doorkeeper; Okta in parallel) + `@capacitor/browser` + hardcoded PKCE +
  `appUrlOpen` + a throwaway CredentialsProvider.
- Assert `/api/auth/session` returns the user from webview JS (the cookie is
  HttpOnly — do not check `document.cookie`), then that `/accountLists`
  renders authenticated on both platforms.
- **Gate 2: system-browser round-trip lands a working session in the webview
  on BOTH platforms.**

**Day 2 — persistence battery + negative tests**

- Kill app → relaunch: still authenticated. Set cookie → background
  immediately → force-kill (the known WKWebView cookie-sync flake). Device
  reboot. Start a 48h+ soak (extends past day 2; also seeds the multi-week
  IndexedDB durability soak for §5.2).
- apiToken-expiry → re-auth loop via system-browser SSO (shorten token TTL on
  stage if possible). Logout/login cycle, confirming `clearApolloData()` runs.
- Airplane mode mid-session → Phase 2 offline contacts render in the webview.
- Negative: tampered `state` rejected; replayed authorization code rejected
  (Okta enforces single-use); CredentialsProvider rejects a garbage token.
- **Gate 3: cookie survives restart.** If flaky → activate Plan B (§4.6)
  before building further; degraded persistence alone is not a stop-ship.

Every gate has a named, bounded remediation; only Gate 1 failure invalidates
the architecture.

---

## 8. Shell version handshake (judge 3 concern #3 — ownership specified)

- **Transport:** `appendUserAgent: 'MPDXShell/<semver>'` (readable by SSR and
  client alike) + `App.getInfo()` as the client-side confirmation.
- **Minimum version source:** a constant `MIN_SUPPORTED_SHELL_VERSION` in
  `src/lib/nativeShell/shellVersion.ts`, **owned by the frontend repo and
  changed via reviewed PR**. Because web deploys land in every shell
  instantly, a constant shipped with the deploy IS server-driven config — no
  new endpoint, no env plumbing. (The `bundled-shell` `/api/mobile/config`
  endpoint idea is unnecessary in a one-bundle world; revisit only if we ever
  need to vary the minimum per platform without a deploy.)
- **Enforcement:** `_app`-level check when `isShell` — below minimum renders
  `UpgradeRequiredScreen` (blocking, i18n'd via `t()`, store link via
  platform detection). The screen must not block the signout path.
- **Why it matters:** the web side WILL evolve past old binaries' plugin
  surface (e.g., a new camera API). Bump the constant in the same PR that
  starts requiring the new capability.
- **Testing:** unit tests for the semver compare + UA parse
  (`shellVersion.test.ts`); manual old-shell × new-web matrix item in the
  release checklist (§11). Apple-review angle: the handshake doubles as the
  "app purpose cannot silently change server-side" control story.

---

## 9. Native polish (roadmap items)

- **App icons:** generate both stores' sets from the existing 1024px source
  with `@capacitor/assets` (`icon-only` + adaptive-icon foreground/background
  for Android 13+ themed icons). The maskable 512px PWA icon already exists;
  reuse the same artwork.
- **Splash screen:** `@capacitor/splash-screen` + `@capacitor/assets` from a
  2732×2732 source; `launchAutoHide: false`, hide programmatically when the
  webview signals first meaningful paint (a `nativeShell` bridge call from
  `_app` after hydration) — avoids the white flash between native splash and
  remote load. Background color = MUI theme primary (use the token from
  `src/theme.ts`, not a hardcoded hex).
- **Status bar:** `@capacitor/status-bar` — style matched to the app bar
  color via theme token; `overlaysWebView: false` initially (simplest
  safe-area story); revisit overlay mode only if design wants edge-to-edge.
- **Safe areas:** `viewport-fit=cover` already present in `_app.page.tsx`.
  Audit fixed-position chrome (app bar, bottom navs, snackbars, modals) for
  `env(safe-area-inset-*)` padding when `isShell`; prefer a small styled
  wrapper over sprinkling raw `env()` (theme-token rule).
- **Haptics:** `@capacitor/haptics` on key actions only (task complete,
  pull-to-refresh trigger if added, destructive confirmations) behind
  `isShell` — restraint over novelty.
- **Pull-to-refresh / overscroll:** decide during prototype dogfooding;
  default to the webview's native behavior, disable rubber-band artifacts if
  they look broken (`overscroll-behavior` CSS first, native config second).
- **Keyboard:** verify form fields aren't obscured (Capacitor keyboard
  defaults usually suffice in `server.url` mode; add `@capacitor/keyboard`
  config only if QA shows problems).

---

## 10. Update / release story

### 10.1 Lanes

- **Web changes (≈99% of future work):** deploy to Amplify → live in every
  shell instantly. No store review, no OTA infra, no second build artifact.
- **Native changes** (plugins, config, icons/splash, SDK bumps): store
  releases via Fastlane CI (build + signing lanes for both platforms —
  blocked-on-Daniel: Apple/Google accounts + keys). Expected a handful per
  year.

### 10.2 Deploy freeze during review (judge 3 concern #2 — made concrete)

Reviewers see the live site. Process rule with teeth, not vibes:

- A `STORE_REVIEW_FREEZE.md` flag file checked by a lightweight CI step (or a
  GitHub environment protection rule on the Amplify-deploy workflow) — when a
  store review is in flight, merges to the deploy branch require an explicit
  override approval. Cheap to build, removes the "someone forgot" failure
  mode. Added to the store checklist (§11).

### 10.3 Capacitor upgrade checklist (judge 3 concern #1 — budgeted)

`docs/pwa-design/capacitor-upgrade-checklist.md`, run on every Capacitor
major (and any WKWebView-relevant iOS major):

1. Bridge injection on the remote origin (Gate 1 procedure from §7).
2. SW registration + IndexedDB on iOS (App-Bound Domains still honored).
3. Cookie persistence smoke (kill/relaunch).
4. Auth round-trip on both platforms.
5. Re-read Capacitor release notes for `server.url` posture changes.

---

## 11. Store-submission checklist (skeleton)

**Accounts & signing (blocked on Daniel)**

- [ ] Apple Developer account + Team ID → fill `apple-app-site-association`
      (the repo has a MISNAMED `apple-app-site-association.json` with legacy
      content — appID `DQ48D9BF2V.org.cru.mpdx`, paths `/accountLists/*/contacts/*`,
      `/contacts/*`, `/auth/mobile`; Apple fetches the extensionless path, so it
      is dead as served. T18 deletes it and creates the extensionless file per
      deep-links.md. Master plan §3.4 R8.)
- [ ] Google Play account; signing decision: reuse `org.mpdx` package (ONLY if
      we hold its signing key — else new appId + new `assetlinks.json` entry,
      keeping the legacy entry)
- [ ] iOS bundle ID registered (placeholder `org.cru.mpdx`); APNs `.p8` key
      for the SNS platform app (coordinates with fcm-v1-backend.md)
- [ ] Firebase project + `google-services.json` (Android push)
- [ ] Fastlane match / Play signing configured in CI

**Apple**

- [ ] App Store listing: name, subtitle, description, keywords, screenshots
      (6.7" + 13" iPad if supported), age rating
- [ ] Privacy labels (data collected: contacts data? analytics? — audit
      against actual SDK surface; we add no third-party SDKs)
- [ ] **4.2 receipts document** in review notes: native push, camera contact
      photos (demo-ready), offline contact/task viewing (in-session v1;
      viewer if landed), universal links, native splash/status-bar/haptics
- [ ] Demo account for reviewers (stage or scrubbed prod account)
- [ ] `WKAppBoundDomains` lists prod only in the release build
- [ ] Budget one rejection/appeal cycle in the launch timeline
- [ ] Deploy freeze active (§10.2) while review is in flight

**Google**

- [ ] Play listing + Data safety form
- [ ] App Links verification passes (`assetlinks.json` fingerprint matches
      release signing cert — check Play App Signing's cert, not the upload key)
- [ ] Internal testing track soak before production rollout

**Both**

- [ ] Shell version handshake verified: old binary + new web shows
      `UpgradeRequiredScreen`; current binary passes
- [ ] Push end-to-end on real devices (APNs + FCM v1, per fcm-v1-backend.md)
- [ ] Auth battery (§7 Day 2) re-run on release builds
- [ ] Airplane-mode QA: in-session offline + errorPath (+ viewer if shipped)
- [ ] Lighthouse PWA audit (carried from Phase 1 checklist)

---

## 12. Resolved judge concerns — index

| # | Concern (judge/lens) | Resolution |
| --- | --- | --- |
| 1 | "No backend changes" claim false — `OKTA_AUTH_CLIENT_IDS` append needed (auth) | Acknowledged + scheduled as deploy-config task (§4.2 step 2) |
| 2 | Blocked on Okta admin for native client (auth) | Doorkeeper/API_OAUTH path proves the architecture on stage (§4.2, §7); Okta registration is an open question for Daniel |
| 3 | `native-okta` callback publicly reachable (auth) | Trust-equivalence documented; rate limiting + CSRF + Critical-pattern security review (§4.3) |
| 4 | WKWebView cookie flakiness (auth, maint) | Day 2 persistence battery is a hard gate; Plan B (Keychain refresh token) grafted from bundled-shell (§4.6) |
| 5 | PKCE/state/access token in webview JS memory (auth) | Handling rules in §4.3; exposure window is seconds; native-layer PKCE noted as future hardening |
| 6 | Custom-scheme interception on Android (auth) | Verified App Links callback on Android; iOS scheme is session-captured (§4.4) |
| 7 | `okta_validator_service.rb:51` logs raw tokens (auth) | Backend task: remove before launch (tasks list) |
| 8 | `server.url` "not for production" + per-upgrade re-verification (all) | Day-one Gate 1 + budgeted upgrade checklist (§10.3) |
| 9 | v1 ships no cold-start offline; "pull forward" unactionable (UX) | Decision made now: viewer built immediately after v1 core, parallel to store prep, not blocking submission (§5.4) |
| 10 | Unauthenticated viewer reads cache without session gate (UX, maint) | Session-marker gate + honest framing + dedicated security review; encryption fallback scoped (§5.3) |
| 11 | Viewer estimate optimistic (UX) | Re-estimated 3 weeks; session-stub + persistenceMapper folded in (§5.4) |
| 12 | Cold-start precondition stack unverified (UX) | Each precondition is a named prototype/QA item incl. precache-manifest check + durability soak (§5.2, §7) |
| 13 | Deploy freeze during review not tooled (maint) | CI flag/environment protection (§10.2) |
| 14 | Version-handshake ownership/testing unspecified (maint) | Constant in repo, PR-owned, unit-tested, release-matrix item (§8) |
| 15 | CredentialsProvider adds surface in Critical file; NextAuth v4 maintenance mode (maint) | Accepted; ~80 paved-road lines beats bespoke JWE minting; Auth.js v5 migration named a risk |
| 16 | Apple 4.2 rejection budget (all) | Camera demo-ready, receipts doc, viewer in flight, one rejection cycle budgeted (§11) |

---

## 13. Open questions for Daniel

1. **Okta native client:** can Okta admin register a native public PKCE
   client (redirect URIs in §4.2/§4.4)? Does the org allow `offline_access`
   refresh tokens for public clients (needed only for Plan B)?
2. **Android package identity:** do we hold the `org.mpdx` signing key from
   the legacy app? Reuse vs. new appId decides `assetlinks.json` and Play
   listing continuity.
3. **Apple account:** Team ID + bundle ID to replace placeholders in
   `apple-app-site-association` and `capacitor.config.ts`; APNs `.p8` for SNS.
4. **AWS console check** (carried from Phase 3): SNS GCM platform credential
   type + APNs cert/bundle ID; Firebase project + `google-services.json`.
5. **Okta global signout in-shell:** sign out of MPDX only (default in this
   design) or also kill the system browser's Okta SSO session?
6. **Offline viewer gating:** is the session-marker + device-lock posture
   (§5.3) acceptable to the security review, or do we scope cache-at-rest
   encryption?
