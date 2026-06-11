# T1 Gate Runbook — Capacitor Shell Prototype (Gates 1–3)

Status: RUNBOOK — manual steps for Daniel. Companion to
`capacitor-shell.md` §7 (day-one prototype) and `phase3-4-master-plan.md` T1.

**Why this exists:** nothing else in Phase 4 Track B/C builds until Gates 1–2
pass. The scaffold (Capacitor 7 deps, `capacitor.config.ts`,
`capacitor-web/error.html`, `ios/`, `android/`, `WKAppBoundDomains`) is
committed; the gates themselves are manual, on-simulator/device verification.
This is a prototype, not TDD — **the gates are the tests.**

---

## 0. Prerequisites

- Xcode 26.x with an iOS 17+ simulator installed; CocoaPods (pods are already
  installed — `ios/App/Pods/` exists locally, gitignored).
- Android Studio with an API 34+ emulator. First open will prompt a Gradle
  sync (`npx cap open android` → let it sync; `local.properties` is generated
  and gitignored).
- Repo on the shell branch, `yarn` installed, and a **stage-targeted sync**:

  ```bash
  SHELL_TARGET=stage npx cap sync
  ```

  `capacitor.config.ts` is evaluated at sync time and baked into the native
  projects as `capacitor.config.json` (gitignored). `SHELL_TARGET=stage`
  points `server.url` at `https://next.stage.mpdx.org`; omitting it bakes
  prod (`https://mpdx.org`). **Re-run sync after every config change.**

- ⚠️ **Stage host check (do this first):** `https://next.stage.mpdx.org` comes
  from the shell design doc — it appears in no repo env/config file (repo only
  references `api.stage.mpdx.org` / `auth.stage.mpdx.org`). Before Gate 1,
  open it in a normal browser and confirm it serves the Next.js stage app and
  you can log in. If the real stage host differs, fix `capacitor.config.ts`
  AND `ios/App/App/Info.plist` (`WKAppBoundDomains`) in the same commit.

- iOS note: `WKAppBoundDomains` (Info.plist) lists `mpdx.org` +
  `next.stage.mpdx.org`; `limitsNavigationsToAppBoundDomains: true` lives in
  `capacitor.config.ts` (it is a WKWebView configuration flag Capacitor sets
  at runtime, not a plist key). Both must be present or iOS bridge injection
  fails with "plugin not implemented".

Launch commands:

```bash
npx cap open ios       # build & run the App scheme on a simulator from Xcode
npx cap open android   # run 'app' on an emulator from Android Studio
```

Inspectors:

- iOS simulator: Safari → Develop → Simulator → the MPDX webview.
- Android emulator: Chrome → `chrome://inspect` → the MPDX WebView.

---

## 1. Gate 1 — bridge injection on the remote origin (Day 1 AM)

Premise being falsified: Capacitor injects its bridge into pages served from
the configured `server.url` host, with SW + IndexedDB working (iOS only with
App-Bound Domains).

On **both** iOS simulator and Android emulator, with the app showing the
remote stage app, run in the inspector console:

| #   | Check                                                                                    | Expected                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | `window.Capacitor.isNativePlatform()`                                                    | `true`                                                                                                                        |
| 2   | `Capacitor.Plugins.Device.getInfo().then(console.log)`                                   | resolves with `platform: 'ios'` / `'android'` (bridge round-trip works)                                                       |
| 3   | `navigator.serviceWorker`                                                                | defined (iOS: proves App-Bound Domains is honored)                                                                            |
| 4   | `navigator.serviceWorker.getRegistration().then(r => console.log(r?.active?.scriptURL))` | `https://<host>/sw.js` after the app's normal SW registration flow (`ServiceWorkerUpdatePrompt`)                              |
| 5   | `indexedDB.databases().then(console.log)`                                                | readable; after logging in and browsing contacts, the Apollo persistence DB (`apollo-cache-persist` / localforage DB) appears |
| 6   | `navigator.userAgent`                                                                    | ends with `MPDXShell/0.1.0` (version-handshake transport)                                                                     |

Also verify the local layer: enable airplane mode on the simulator/emulator
(or kill stage connectivity), force-quit, relaunch → the bundled
`error.html` ("You're offline", Retry button) renders. Restore connectivity →
page auto-reloads into the app.

**PASS:** all six checks on both platforms.

**FAILURE MEANING (shell doc §7):** if bridge injection fails on the remote
origin (check 1 or 2), the `server.url` premise is invalid — **stop and
escalate; this invalidates the Phase 4 shell architecture** (the auth design
survives — it is webview-agnostic — but the architecture around it does not).
If only check 3/4 fails on iOS, suspect `WKAppBoundDomains` (typo, missing
`limitsNavigationsToAppBoundDomains`, or the stage host is not listed) before
declaring failure. Backend track T2–T7 continues regardless.

---

## 2. Gate 2 — system-browser PKCE round-trip → working session cookie (Day 1 PM)

Goal: prove the auth shape — interactive login in the **system browser**
(SFSafariViewController / Custom Tabs), token exchange, then the **webview
itself** calls `signIn('native-...')` so NextAuth's `Set-Cookie` lands in the
webview jar. No cookie ever crosses the browser/webview boundary.

### 2.1 Negative control (do this first — it is the evidence)

In the webview, tap the existing login (`signIn('okta')` path) and record the
exact failure (screenshot). Expected: Google/Okta `disallowed_useragent` /
blocked-webview error. This is the documented justification for the
system-browser flow.

### 2.2 Create the stage Doorkeeper public client (Daniel — internal action)

The spike uses the **API_OAUTH / Doorkeeper path** because you control stage
Doorkeeper (Okta native-client registration, T9, runs in parallel). On the
stage Rails console (mpdx_api):

```ruby
app = Doorkeeper::Application.create!(
  name: 'MPDX Native Shell (stage spike)',
  redirect_uri: "org.mpdx://auth-callback",
  confidential: false,   # PUBLIC client — no secret; PKCE required
  scopes: ''             # match the existing API_OAUTH provider's scopes
)
app.uid   # => the client_id the spike hardcodes
```

Notes:

- `confidential: false` is what makes PKCE mandatory and the client secretless
  (Doorkeeper PKCE is already exercised — the existing NextAuth provider sets
  `checks: ['pkce','state']`).
- For the spike, the custom scheme `org.mpdx://auth-callback` is acceptable on
  BOTH platforms (verified App Links are the production hardening, T19/T21).
  If you want the Android production shape early, add a second redirect URI
  `https://next.stage.mpdx.org/auth/native-callback`.
- Verify stage Doorkeeper's authorize/token endpoints (defaults:
  `https://api.stage.mpdx.org/oauth/authorize`, `/oauth/token` — these match
  `next.config.ts` API_OAUTH defaults).

### 2.3 Spike wiring (throwaway branch — not merged)

Per shell doc §7 "Day 1 PM", on a spike branch:

1. Hardcoded PKCE (`code_verifier`/`challenge` + `state`, in-memory only) +
   `@capacitor/browser` `Browser.open()` on the Doorkeeper `/oauth/authorize`
   URL.
2. `@capacitor/app` `appUrlOpen` listener → validate `state` →
   `Browser.close()` → exchange `code + verifier` at the token endpoint
   (direct if CORS allows; otherwise a minimal `/api/auth/native/token` proxy
   route — secretless, forwards only the code exchange).
3. Throwaway NextAuth **CredentialsProvider** (`native-apioauth`) in
   `pages/api/auth/[...nextauth].page.ts` whose `authorize()` calls the same
   public `apiOauthSignIn` mutation the existing provider path uses, plus an
   early `return true` branch in the `signIn` callback for this provider.
4. Webview JS: `signIn('native-apioauth', { accessToken, redirect: false })`.

### 2.4 Assertions (both platforms)

The session cookie is HttpOnly — **do not** look for it in `document.cookie`.
Instead, from the webview inspector console:

```js
fetch('/api/auth/session')
  .then((r) => r.json())
  .then(console.log);
```

- [ ] Returns the logged-in user (non-empty session object) on iOS.
- [ ] Same on Android.
- [ ] Navigate to `/accountLists` → renders authenticated (SSR session check
      passes, so `getServerSideProps` saw the cookie too).
- [ ] Negative: tamper `state` → flow rejects. Replay the same authorization
      code → token endpoint rejects (single-use). Feed the
      CredentialsProvider a garbage token → `authorize()` fails, no session.

**PASS:** working NextAuth session in the webview on BOTH platforms via the
system-browser round-trip.

**FAILURE MEANING:** Gate 2 failure does NOT invalidate the architecture — it
is a debugging matter with named suspects, in order: (a) cookie attributes —
`__Secure-` prefix requires https + `Secure`; confirm the webview origin is
the https stage host; (b) NextAuth CSRF — `signIn()` from `next-auth/react`
fetches `/api/auth/csrf` first; calling the callback URL manually without the
CSRF token fails silently; (c) Doorkeeper client misconfig (confidential
instead of public, redirect URI mismatch); (d) `appUrlOpen` not firing — iOS
custom-scheme registration in Info.plist (`CFBundleURLTypes`) missing on the
spike branch. Escalate only if the same-origin `signIn()` POST genuinely
cannot set a cookie inside the webview on a platform — that would force
Plan B (§4.6) to become Plan A.

---

## 3. Gate 3 — cookie persistence battery + 48h soak (Day 2)

Goal: prove the WKWebView / Android WebView cookie jar holds the NextAuth
session across process death. Known flake history: Capacitor #6809, #1373.

On **both** platforms, logged in via Gate 2:

| #   | Test                                                                                                                                                                                    | Expected                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Force-kill the app → relaunch                                                                                                                                                           | still authenticated (`/api/auth/session` returns user; no login screen)                                            |
| 2   | Fresh login → background the app **immediately** → force-kill within ~5s → relaunch                                                                                                     | still authenticated (this is the known WKWebView cookie-sync flake window)                                         |
| 3   | Device/simulator reboot → launch                                                                                                                                                        | still authenticated                                                                                                |
| 4   | Start a **48h+ soak**: leave the app installed and untouched for 48h (longer is better — this also seeds the multi-week IndexedDB durability soak for the v1.1 offline viewer) → launch | still authenticated; IndexedDB Apollo cache still present                                                          |
| 5   | apiToken expiry → re-auth loop (shorten token TTL on stage if possible, or wait it out)                                                                                                 | RouterGuard's re-auth fires the native flow → system browser flashes → SSO makes it near-silent → session restored |
| 6   | Logout → login cycle                                                                                                                                                                    | logout runs `clearApolloData()` (verify IndexedDB cache emptied in inspector), login round-trip works again        |
| 7   | Airplane mode mid-session → navigate to already-visited contacts/tasks                                                                                                                  | Phase 2 offline reads render in the webview                                                                        |

**PASS:** 1–4 hold on both platforms (5–7 are battery items that feed later
tasks; record results either way).

**FAILURE MEANING:** Gate 3 failure is **not stop-ship**. Cookie loss degrades
to a near-silent system-browser SSO re-auth (a browser-sheet flash). If the
battery shows cookies evaporating in practice (tests 1–3 flaky, or the soak
loses the session), **activate Plan B before building further** (shell doc
§4.6): request `offline_access` on the native client, store the refresh token
in Keychain/Keystore via a secure-storage plugin, and silently re-run
`signIn('native-...')` on cookie loss. Plan B preconditions to verify first:
the OAuth org grants refresh tokens to public clients, and the secure-storage
plugin passes security review.

---

## 4. Recording results

For each gate, capture: platform + OS version, simulator/emulator vs device,
inspector console output (screenshot), and pass/fail per checklist row. Drop
them in `docs/pwa-design/` next to this runbook (e.g.
`t1-gate-results.md`) — Gate 1's evidence doubles as the Apple-review
"receipts" groundwork (shell doc §11), and the negative control from §2.1 is
the permanent justification for the system-browser auth decision.

After Gates 1–2 pass: unblock Track C (T20+) and continue Track B. After a
Gate 1 failure: stop Phase 4 shell work and escalate per shell doc §1.3/§7.

---

## 5. Appendix — Android App Links on dev builds (fingerprint note)

`public/.well-known/assetlinks.json` lists only the Play App Signing
certificate fingerprint, so debug builds (signed with the local debug
keystore) will **fail** `autoVerify` — universal-link taps open the browser
instead of the app. Two options during dev (deep-links.md §3, T19):

1. **Override verification on the device/emulator** (no file changes):

   ```bash
   # Force-approve the domain for the app (2 = STATE_APPROVED)
   adb shell pm set-app-links --package org.mpdx 2 mpdx.org

   # Inspect the result — should show "verified"/approved for mpdx.org
   adb shell pm get-app-links org.mpdx
   ```

   Re-run after each reinstall; the override is per-install. Use the actual
   applicationId if it differs from the `org.mpdx` placeholder (master plan
   open question Q4).

2. **Add the debug keystore fingerprint** as an additional entry in
   `assetlinks.json` (get it via
   `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android`).
   Decision deferred to T19 — until then, prefer the `adb` override so the
   published assetlinks file stays production-only.

---

## 6. Appendix — T26 native platform config: placeholder inventory

Everything T26 committed that is deliberately not production-final. Each item
names the owning follow-up task; nothing here blocks local builds or gates.

| #   | Placeholder                                                                                                       | Where                                                                                  | Replaced by / when                                                                                                                                                                                                                                                                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **`android/app/google-services.json`** — fake Firebase config, `project_id: mpdx-placeholder-replace-via-t8`      | `android/app/google-services.json`                                                     | **Ops T8.** Real file must come from the **same Firebase project** as the SNS GCM/FCM platform-application credentials (SENDER_ID_MISMATCH trap, fcm-v1-backend.md), with `package_name` matching the final applicationId. Until swapped: Gradle config parses and `:app:processDebugGoogleServices` succeeds (verified), but Android FCM token registration fails at runtime. |
| 2   | **`applicationId "org.mpdx"`**                                                                                      | `android/app/build.gradle`                                                              | Master-plan open question Q4 (reuse legacy Play listing vs new id). If it changes, update `google-services.json` `package_name` AND add a new `assetlinks.json` entry (deep-links.md §3) in the same commit.                                                                                                                                                                     |
| 3   | **iOS bundle id `org.cru.mpdx`**                                                                                    | `ios/App/App.xcodeproj` (`PRODUCT_BUNDLE_IDENTIFIER`)                                   | Apple account info (capacitor-shell.md §13 Q3). The AASA `appID` prefix (Team ID `DQ48D9BF2V` cited in shell doc §11) must match whatever final Team ID + bundle id is registered.                                                                                                                                                                                               |
| 4   | **`aps-environment` = `development`**                                                                               | `ios/App/App/App.entitlements`                                                          | Not hand-edited — App Store / TestFlight export re-signs to `production` automatically (T29 Fastlane lanes). Requires the Push Notifications capability enabled on the App ID in the Apple Developer portal (automatic signing handles this once the account exists) plus the APNs `.p8` key on the SNS side (T8).                                                              |
| 5   | **Associated Domains dev variant** — `applinks:next.stage.mpdx.org?mode=developer` documented but NOT committed     | `ios/App/App/App.entitlements` (comment)                                                | Add for dev builds after the §0 stage-host check confirms the real stage host (deep-links.md §2.2 cites `stage.mpdx.org`; the shell config uses `next.stage.mpdx.org` — reconcile first). `?mode=developer` bypasses Apple's AASA CDN and is only honored on developer-signed builds.                                                                                            |
| 6   | **No `android.permission.CAMERA`** (deliberate omission, not a placeholder)                                         | `android/app/src/main/AndroidManifest.xml`                                              | Permanent (camera-contact-photo.md §6) — but release checklist must audit the **merged** manifest (`./gradlew :app:processDebugManifest`) in case a future plugin injects it.                                                                                                                                                                                                    |
| 7   | **App Links `autoVerify` scope `/accountLists`** on host `mpdx.org` only                                            | `android/app/src/main/AndroidManifest.xml`                                              | Permanent scope per deep-links.md §3. Debug builds still fail verification (Play-signing fingerprint only) — use the §5 `adb` override.                                                                                                                                                                                                                                          |

Verification performed for T26: `plutil -lint` on `Info.plist` +
`App.entitlements` (OK), manifest `xmllint` (OK), and
`cd android && ./gradlew tasks --quiet` plus
`./gradlew :app:processDebugGoogleServices` (BUILD SUCCESSFUL — the gated
`com.google.gms.google-services` apply in `app/build.gradle` fires now that
the JSON exists). Note: `gradlew` needs a JDK 17+; with no system JDK, point
at Android Studio's bundled one:
`JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`.

---

## 7. Dogfooding — native polish decisions (T27)

### 7.1 Pull-to-refresh / overscroll

**Decision (default, binding unless overridden during dogfooding):** v1 ships
with **NO custom pull-to-refresh**. iOS rubber-band overscroll and the Android
overscroll glow stay at WKWebView/WebView defaults — SSR pages refresh via
navigation, and a webview reload control adds complexity for little gain
(master plan T27; capacitor-shell.md §9).

- **Owner:** Daniel, during device dogfooding.
- **Acceptance criterion:** the decision + rationale are recorded here (this
  section) before T32 store submission. If the default is overridden, the
  chosen mechanism (e.g. a `CSS overscroll-behavior` tweak or an explicit
  reload gesture) gets its own follow-up task with device QA on both
  platforms — it does not ride along inside T27/T32.
- **What to watch for while dogfooding:** rubber-band artifacts that expose
  the webview background behind fixed chrome, accidental page-refresh
  gestures, and overscroll glow fighting with horizontally scrollable tables.
  First remedy is CSS `overscroll-behavior`; native config second.

### 7.2 Device QA checklist for the rest of the T27 polish

Unit-testable parts are covered in-repo (`nativeChrome.test.ts`,
`useHaptics.test.tsx`, `safeArea.test.ts`); the items below are device-only:

- [ ] Cold launch on both platforms: native splash (blue `#05699B`, centered
      logo) holds until the app paints — no white flash. `launchAutoHide:
      false` + `hideSplashScreen()` after hydration.
- [ ] Splash never sticks: kill app → relaunch with airplane mode ON — the
      shell's `error.html` path must still hide the splash (or the OS
      watchdog kills us). Verify the error screen is reachable.
- [ ] Status bar: light text over the dark app-bar color on both platforms;
      Android status bar background matches the app bar
      (`theme.palette.mpdxGrayDark.main`), webview not under the status bar.
- [ ] iOS safe areas: app bar content clears the notch/Dynamic Island in
      portrait, no dead band in landscape (left/right insets), home-indicator
      area looks right on list pages, modals, and snackbars.
- [ ] Haptics (shell only, restraint check): completing a task fires a
      success tap; confirming a destructive delete fires a warning tap;
      nothing else in the app vibrates.
- [ ] App icons: Android 13+ themed icon renders sanely
      (adaptive foreground/background), iOS icon has no alpha halo.
