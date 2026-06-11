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
