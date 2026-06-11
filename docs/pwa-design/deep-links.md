# Deep Linking Design — Push Taps + Universal Links / App Links (Phases 3+4)

Status: DESIGN — 2026-06-10
Owner repos: `mpdx-react` (frontend + shell + `.well-known` files), `mpdx_api` (payload link building)
Coordinates with: the FCM-v1 payload migration design (which defines *where* the
`deepLink` field sits in APNs custom keys and FCM v1 `message.data`) and the
Capacitor shell / auth design (system-browser auth flow, `server.url` mode).

---

## 0. Core decision: one link format for everything

**The `deepLink` value is a same-origin absolute web path** — path + query, no
scheme, no host:

```
/accountLists/<accountListId>/contacts/<contactId>?tab=Donations
```

One format serves all three consumers:

1. **Push tap inside the shell** — `pushNotificationActionPerformed` hands us
   `notification.data.deepLink`; we `router.push(path)` directly.
2. **Universal links / app links** — the same paths under `https://mpdx.org`
   open the installed app; `appUrlOpen` hands us the full URL and we strip it
   back to the path.
3. **Web fallback** — a user without the app (or email links) lands on the
   exact same page in the browser. `WebRouter.contact_url` already generates
   these URLs for emails today, so paths are guaranteed to stay aligned with
   real frontend routes.

Why a path and not a full URL: it is environment-agnostic (prod/stage/local
all work without baking `FRONT_END_URL_BASE` into the push payload), it is
trivially validated client-side (must start with a single `/`), and it cannot
become an open redirect.

Why not a custom scheme (`mpdx://`): custom schemes need a second routing
table, don't degrade to web, and are not needed — Capacitor's
`appUrlOpen` + `pushNotificationActionPerformed` both deliver arbitrary
strings. (The auth design may still use a custom scheme for the OAuth
callback; that's orthogonal — see §7.)

---

## 1. Backend: notification types → routes

### 1.1 What exists today (verified in code)

- All push sends flow through exactly two call sites, both of which already
  call `NotificationType#user_notification_options(user_notifications)`:
  - `User::Notification.create_by_type` (`app/models/user/notification.rb:30`)
  - `Api::V2::User::Notifications::BulkController` (`bulk_controller.rb:24`)
- `user_notification_options` (base `NotificationType`, no subclass overrides)
  already returns:
  - single notification → `{ contact_url: WebRouter.contact_url(contact), account_list_id: contact.account_list_id }`
  - multiple notifications → `{ account_list_id: contact.account_list_id }`
- **`account_list_id` availability: confirmed.** Every `Notification`
  `belongs_to :contact`, and `contact.account_list_id` is a direct column —
  the payload-building context already uses it. No new data plumbing needed.
- `WebRouter.contact_url(contact, tab)` already supports a `?tab=` param, and
  the frontend `ContactDetailProvider` reads `query.tab` into
  `ContactDetailTabEnum` (`Tasks | Donations | Referrals | ContactDetails | Notes`,
  default `Tasks`). The tab values below are those exact enum strings.

### 1.2 Route map per push-worthy notification type

Push-worthy types = `NotificationType.types` (the 22 subclasses in
`types_to_check` + `types_not_to_check`). Every one of them hangs off a
contact, so the single-notification case is always a contact-detail path; the
`?tab=` lands the user on the most actionable tab.

| NotificationType | Tab | deepLink (single notification) |
| --- | --- | --- |
| LargerGift, SmallerGift, SpecialGift, StartedGiving, StoppedGiving, RecontinuingGift, LongTimeFrameGift | `Donations` | `/accountLists/:alid/contacts/:cid?tab=Donations` |
| NewDesignationAccountSubscription, NewPageSubscription | `Donations` | `/accountLists/:alid/contacts/:cid?tab=Donations` |
| CallPartnerOncePerYear, ThankPartnerOncePerYear, RemindPartnerInAdvance | `Tasks` (default) | `/accountLists/:alid/contacts/:cid` |
| MissingAddressInNewsletter, MissingEmailInNewsletter, MailchimpBounce, MailchimpUnsubscribe, NewAddress, UpcomingBirthday, UpcomingAnniversary | `ContactDetails` | `/accountLists/:alid/contacts/:cid?tab=ContactDetails` |
| NewPartnerNoDuplicate, NewPartnerDuplicateMerged | default | `/accountLists/:alid/contacts/:cid` |
| NewPartnerDuplicateNotMerged | — | `/accountLists/:alid/tools/merge/contacts` (the actionable screen is the merge tool, not the contact) |

**Multiple notifications batched into one push** (the `user_notifications.many?`
branch): there is no dedicated notifications page in the frontend (the bell
lives in the TopBar), so the tap target is the dashboard:

```
/accountLists/:alid
```

**Fallback rule:** any type not in the map (future types) → contact detail if
a contact is present, else `/accountLists/:alid`, else `/accountLists`.

### 1.3 Rails implementation

Add a single, easily-testable builder rather than 22 subclass overrides:

`app/services/user/device/deep_link_builder.rb`

```ruby
class User::Device::DeepLinkBuilder
  TAB_BY_TYPE = {
    'NotificationType::LargerGift' => 'Donations',
    # ... per table above; nil entries omitted
    'NotificationType::MissingAddressInNewsletter' => 'ContactDetails',
    # ...
  }.freeze

  MERGE_TOOL_TYPES = ['NotificationType::NewPartnerDuplicateNotMerged'].freeze

  def self.build(notification_type:, user_notifications:)
    contact = user_notifications.first.notification.contact
    alid = contact.account_list_id
    return "/accountLists/#{alid}" if user_notifications.many?
    return "/accountLists/#{alid}/tools/merge/contacts" if MERGE_TOOL_TYPES.include?(notification_type.type)

    tab = TAB_BY_TYPE[notification_type.type]
    path = "/accountLists/#{alid}/contacts/#{contact.id}"
    tab ? "#{path}?tab=#{tab}" : path
  end
end
```

Wire-in: `NotificationType#user_notification_options` adds the key —

```ruby
def user_notification_options(user_notifications)
  contact = user_notifications.first.notification.contact
  opts = {
    account_list_id: contact.account_list_id,
    deep_link: User::Device::DeepLinkBuilder.build(
      notification_type: self, user_notifications: user_notifications
    )
  }
  opts[:contact_url] = WebRouter.contact_url(contact) unless user_notifications.many?
  opts
end
```

- **Keep `contact_url`** (full URL) — the legacy native app may still parse it;
  removing it buys nothing.
- `opts` continues to flow `to_json` through `PublishWorker` →
  `PublishService`. The FCM-v1 design owns placing `deep_link` into
  FCM v1 `message.data.deepLink` and as an APNs top-level custom key
  `deepLink` (replacing the legacy `link: { data: ... }` wrapper for the new
  shell — keep the legacy key too until the old app is sunset). Naming
  handshake with that design: **Ruby side `deep_link` in opts; wire format in
  the push payload is camelCase `deepLink`** (FCM data values must be strings,
  and the shell reads `notification.data.deepLink`).

---

## 2. apple-app-site-association (AASA)

### 2.1 Current state — broken in two ways

`public/.well-known/` contains **`apple-app-site-association.json`** — wrong
filename. Apple fetches `/.well-known/apple-app-site-association` with **no
extension**, so the existing file is unreachable at the spec'd URL (this is
why the shared context calls it "empty/missing"). Its legacy content is still
useful intel: the old appID was **`DQ48D9BF2V.org.cru.mpdx`** (team ID
`DQ48D9BF2V`, bundle `org.cru.mpdx`) and it allowed
`/accountLists/*/contacts/*`, `/contacts/*`, `/auth/mobile`.

### 2.2 New file

Create `public/.well-known/apple-app-site-association` (extensionless),
delete the misnamed `.json` file:

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["DQ48D9BF2V.org.cru.mpdx"],
        "components": [
          { "/": "/accountLists/*", "comment": "All app screens incl. contacts, tasks, reports" }
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": ["DQ48D9BF2V.org.cru.mpdx"]
  }
}
```

- Modern `appIDs` + `components` format (iOS 13+; our shell targets far
  newer). `apps: []` inside `applinks` is no longer required in the modern
  format.
- `TEAMID.BUNDLEID` placeholder policy: **use `DQ48D9BF2V.org.cru.mpdx` as the
  working assumption** (it was the legacy production appID) but treat it as a
  placeholder until Daniel confirms the Apple team ID and whether the new
  shell reuses bundle `org.cru.mpdx` (reusing it = updating the old App Store
  listing, which preserves existing installs).
- `webcredentials` is included because the auth flow
  (`ASWebAuthenticationSession` / password autofill) benefits from it for free.
- **Include only `/accountLists/*`.** Everything tappable from a push or
  shareable as a screen lives there. Deliberately excluded: `/login`, `/api/*`,
  `/auth/*` (NextAuth endpoints must stay in the browser/system flow — having
  iOS hijack an OAuth redirect into the app mid-flow breaks it), `/acceptInvite`
  (invite emails should work even where the app/session state is uncertain —
  revisit later if wanted). If the auth design ends up needing a universal-link
  return path (e.g. `/auth/mobile`), it adds one **exact** component here —
  but note Apple does not reliably trigger universal links from HTTP redirects,
  so the auth design should prefer `ASWebAuthenticationSession`'s callback
  scheme instead (§7).
- Xcode side (shell repo work): Associated Domains entitlement
  `applinks:mpdx.org` (+ `applinks:stage.mpdx.org?mode=developer` for dev
  builds), `webcredentials:mpdx.org`.

### 2.3 Serving requirements (Next + Amplify)

Apple's CDN (`app-site-association.cdn-apple.com` fetches on app install)
requires: HTTPS, **no redirects**, 200, and `Content-Type: application/json`
(`text/json` also accepted; `application/octet-stream` is not).

- Next.js serves `public/` files via static file serving with the MIME type
  derived from the **extension** — an extensionless file is served as
  `application/octet-stream`. So the content type must be forced.
- **Primary fix — `next.config.ts` `headers()`** (works in `yarn serve`
  locally and on any host):

  ```ts
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ];
  },
  ```

  Caveat to verify in the task: whether Amplify's CDN honors Next `headers()`
  for public static assets in the SSR build (it should — Amplify runs the Next
  server — but static assets may be served from S3/CloudFront directly).
- **Belt-and-braces — `customHttp.yml`** (already in repo for `sw.js`):

  ```yaml
  - pattern: '/.well-known/apple-app-site-association'
    headers:
      - key: 'Content-Type'
        value: 'application/json'
  ```

  Amplify custom headers apply at the hosting layer and win regardless of how
  the asset is served. Do both.
- **Redirect check (manual, release checklist):**
  `curl -sI https://mpdx.org/.well-known/apple-app-site-association` must be a
  direct 200. If prod canonicalizes apex↔www with a redirect, the associated
  domain in the entitlement must be the *final* host. Same check for
  `assetlinks.json` (it presumably already passes, since the legacy Android
  app depended on it).
- Debugging: AASA changes propagate through Apple's CDN with up to ~24h
  delay/caching; use `?mode=developer` associated-domain flag on dev builds to
  bypass the CDN during development.

---

## 3. assetlinks.json (Android App Links)

Current file is valid and live: package `org.mpdx`, one SHA-256 fingerprint
(`1C:10:CC:...:C1:8B`), `handle_all_urls`.

**Key fact about fingerprints:** the fingerprint must match the certificate
that signed the APK *installed on the device*. For Play-distributed apps
that's the **Play App Signing key**, which Google holds per package name and
which does not change when the upload key or the codebase changes.

Decision tree:

1. **Reuse package `org.mpdx` (recommended if possible).** Ship the Capacitor
   shell as an *update* to the existing Play listing. Existing installs
   migrate in place, the Play App Signing key is unchanged, and the existing
   fingerprint in `assetlinks.json` keeps working with **zero changes**.
   Requires: Cru still controls the Play account/listing for `org.mpdx`
   (open question for Daniel). The legacy app's minSdk/target history is
   irrelevant; only package name + signing key matter.
2. **New package name** (e.g. `org.cru.mpdx`) if the listing is unrecoverable
   or product wants a clean launch: Play generates a new App Signing key →
   add a **second** JSON object to the `assetlinks.json` array with the new
   package + new fingerprint (obtained from Play Console → App Signing after
   the app is created). Keep the old entry until the legacy app is formally
   sunset — the array supports multiple targets.
3. **Either way, add the debug keystore fingerprint** as an additional entry
   (or additional fingerprint in the array) so app links verify on local dev
   builds, or use `adb shell pm set-app-links` overrides during dev.

AndroidManifest (shell repo work): `<intent-filter android:autoVerify="true">`
for `https` + host `mpdx.org` + `<data android:pathPrefix="/accountLists" />`.
Scope the intent filter to `/accountLists` rather than `handle_all_urls`-wide
`/` so that random mpdx.org marketing/auth URLs don't get captured by the app.
(The `relation` in assetlinks.json can stay `handle_all_urls`; the manifest is
what scopes capture.)

---

## 4. Frontend: tap → navigation in the shell

### 4.1 Module layout

```
src/lib/nativeShell/
  deepLink.ts             # pure functions — the unit-testable core
  deepLink.test.ts
src/components/NativeShell/
  NativeDeepLinkProvider.tsx       # listener wiring (thin, effect-only)
  NativeDeepLinkProvider.test.tsx
```

(`src/lib/nativeShell/` is the shared home the shell design should also use
for `isNativePlatform()` helpers; adjust the folder name to whatever the shell
design picks — the contract here is the function signatures.)

### 4.2 Pure routing core (`src/lib/nativeShell/deepLink.ts`)

```ts
const FALLBACK_ROUTE = '/accountLists';

/** Hosts whose universal links we are willing to route in-app. */
export const allowedDeepLinkHosts = (): string[] => [
  // window.location.host covers server.url mode (prod or stage shell)
  window.location.host,
];

/**
 * Validates an in-payload web path (from push data). Returns a safe
 * same-origin path or null.
 * Rules: must be a string, start with exactly one '/', no scheme, no '\\',
 * not '//host' protocol-relative, decodes cleanly.
 */
export const sanitizeDeepLinkPath = (value: unknown): string | null => { ... };

/**
 * Converts a universal-link URL (appUrlOpen) to an in-app path.
 * Returns null for disallowed hosts/schemes (caller ignores the event and
 * lets nothing happen rather than navigating somewhere unexpected).
 */
export const deepLinkFromUrl = (
  url: string,
  allowedHosts: string[],
): string | null => { ... };

/**
 * Extracts the route from a push notification's data payload.
 * Reads data.deepLink (string), falls back to FALLBACK_ROUTE when missing
 * or invalid — a push tap must always land somewhere sensible.
 */
export const routeFromPushData = (data: unknown): string => { ... };
```

Security invariants (these are the tests, §6.1):

- Output always begins with a single `/` → `router.push` stays same-origin.
  Reject `//evil.com`, `https://…`, `javascript:…`, `\` tricks, empty string.
- No allowlist of route shapes beyond same-origin: the payload comes from our
  own backend over APNs/FCM, and worst case a bad path 404s inside the app.
  Same-origin is the load-bearing check (open-redirect prevention).
- `deepLinkFromUrl` host check is exact-match against `allowedHosts`
  (no `endsWith` suffix matching).

### 4.3 Listener wiring (`NativeDeepLinkProvider`)

Mounted once in `pages/_app.page.tsx` (inside the session/Apollo providers so
`router` is live), entire body gated on `Capacitor.isNativePlatform()`;
plugin modules loaded via dynamic `import()` so the web bundle is untouched.

```tsx
export const NativeDeepLinkProvider: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    let cleanup = () => {};
    (async () => {
      const { App } = await import('@capacitor/app');
      const { PushNotifications } = await import('@capacitor/push-notifications');

      // Warm start: universal link tapped while app is running/backgrounded
      const urlListener = await App.addListener('appUrlOpen', ({ url }) => {
        const path = deepLinkFromUrl(url, allowedDeepLinkHosts());
        if (path) {
          router.push(path);
        }
      });

      // Push tap — warm start AND cold start. The Capacitor plugin queues the
      // action that launched the app and replays it once a listener registers,
      // so cold-start taps arrive here too, as long as this provider mounts
      // early in app bootstrap.
      const pushListener = await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        ({ actionId, notification }) => {
          if (actionId === 'tap') {
            router.push(routeFromPushData(notification.data));
          }
        },
      );

      // Cold start via universal link: appUrlOpen may fire before this effect
      // runs; getLaunchUrl() is the reliable source. Handle exactly once.
      const launch = await App.getLaunchUrl();
      if (launch?.url && !handledLaunchUrl) {
        handledLaunchUrl = true; // module-level latch — survives StrictMode remounts
        const path = deepLinkFromUrl(launch.url, allowedDeepLinkHosts());
        if (path) {
          router.replace(path); // replace: don't trap Back on the splash route
        }
      }

      cleanup = () => {
        urlListener.remove();
        pushListener.remove();
      };
    })();
    return () => cleanup();
  }, []);

  return null;
};
```

Notes:

- **Cold vs warm start, push:** `pushNotificationActionPerformed` is the
  single event for both; Capacitor delivers the launching tap after listener
  registration. The risk window is registering too late — hence a top-level
  provider in `_app`, not a page-level effect. (Verify against current
  `@capacitor/push-notifications` docs at implementation time; if the
  installed major no longer replays cold-start events, the fallback is
  `PushNotifications.getDeliveredNotifications()` + native `launchOptions`
  via `App.getLaunchUrl()` equivalent — flagged in the test plan.)
- **Cold vs warm start, universal link:** warm = `appUrlOpen` event; cold =
  `App.getLaunchUrl()` checked once with a module-level latch (also guards
  React 18 StrictMode double-effects in dev).
- **server.url mode interplay:** in `server.url` mode the webview is already
  on the same origin, so `router.push(path)` is a normal client-side Next
  navigation — no full reload, SW/runtime caching rules unchanged.
- **Duplicate-navigation guard:** if the target equals `router.asPath`, skip
  the push (tapping the same notification twice shouldn't churn history).

### 4.4 Auth guard interplay (session expired / logged out)

No new auth machinery is needed — the existing chain already does the right
thing; we just have to *not bypass it*:

1. We `router.push('/accountLists/123/contacts/456?tab=Donations')`.
2. The page renders inside `RouterGuard`
   (`src/components/RouterGuard/RouterGuard.tsx`). If the session is missing,
   `onUnauthenticated` fires
   `push({ pathname: '/login', query: { redirect: window.location.href } })` —
   and because our navigation has already happened, `window.location.href` *is*
   the deep-link target.
3. `pages/login.page.tsx` reads `redirect` (and the `mpdx-handoff.redirect-url`
   cookie) and sends the user to the target after sign-in completes.
4. Expired-but-present session: RouterGuard's expiry effect calls
   `signIn('okta')` which round-trips OAuth and returns to the current URL —
   again the deep-link target.

Therefore: **always navigate immediately on tap, regardless of auth state**,
and let RouterGuard own the login round-trip. Do not pre-check the session in
the deep-link handler.

Coordination requirement for the shell-auth design (§7): whatever
system-browser flow replaces in-webview OAuth must preserve this contract —
"after login, land on the URL the user was on (or `?redirect=`)". If the auth
flow rebuilds the entry URL from scratch after the browser round-trip, deep
links into an expired session silently drop their target. Add an explicit test
for "push tap → expired session → login → arrives at deep-link target" to the
shell QA checklist.

Account-list mismatch (user taps a push for an account list they no longer
have access to): existing page-level handling (`ensureSessionAndAccountList` /
API authorization) applies; no special casing.

Offline tap: deep-link routes are NetworkOnly per the Phase 1 SW allowlist, so
a cold-start tap while offline shows the offline fallback (or fails to load in
`server.url` mode). Acceptable for this release — same limitation as the rest
of cold-start offline, already documented in the roadmap.

---

## 5. What each repo ships

### mpdx_api (`pwa-push-fcm-v1` branch)

1. `User::Device::DeepLinkBuilder` + spec (pure, no AWS).
2. `NotificationType#user_notification_options` adds `deep_link`; keep
   `contact_url` + `account_list_id` as-is. Spec updates.
3. (Owned by FCM-v1 design, listed for completeness) `PublishService` places
   `opts[:deep_link]` as `deepLink` in FCM v1 `message.data` and as an APNs
   top-level custom key.

### mpdx-react / shell (`pwa-phase3-4-push-shell` branch)

1. Replace `public/.well-known/apple-app-site-association.json` with
   extensionless `apple-app-site-association` (content §2.2).
2. `next.config.ts` `headers()` + `customHttp.yml` entries for the AASA
   content type (§2.3).
3. `assetlinks.json`: unchanged if package `org.mpdx` is reused; otherwise
   append new entry (§3). Add debug-key entry for dev.
4. `src/lib/nativeShell/deepLink.ts` + tests.
5. `NativeDeepLinkProvider` + tests; mount in `_app.page.tsx`.
6. Shell config (Capacitor projects): iOS Associated Domains entitlement;
   Android `autoVerify` intent filter scoped to `/accountLists`.

---

## 6. TDD plan

### 6.1 Frontend unit tests — `deepLink.test.ts` (write first)

Pure-function table tests, no mocks:

- `sanitizeDeepLinkPath`
  - accepts `/accountLists/al-1/contacts/c-1?tab=Donations` (returns as-is,
    query + future hash preserved)
  - rejects: non-string (`null`, `42`, `{}`), empty, `'contacts/1'` (no slash),
    `'//evil.com/x'`, `'/\\evil.com'`, `'https://mpdx.org/x'`,
    `'javascript:alert(1)'`, `'/a b'`
- `deepLinkFromUrl`
  - `https://mpdx.org/accountLists/a/contacts/c?tab=Donations` with allowed
    host `mpdx.org` → `/accountLists/a/contacts/c?tab=Donations`
  - disallowed host → null; suffix lookalike `evilmpdx.org` → null
  - `http:` scheme on allowed host → null (https only)
  - custom scheme `mpdx://...` → null (not this module's job)
  - malformed URL → null (no throw)
- `routeFromPushData`
  - `{ deepLink: '/accountLists/a' }` → that path
  - missing/invalid `deepLink`, non-object data → `'/accountLists'` fallback
  - extra keys (`contact_url`, `account_list_id`, `message`) ignored

### 6.2 Frontend component test — `NativeDeepLinkProvider.test.tsx`

`jest.mock('@capacitor/core')` (`isNativePlatform` → true/false),
`jest.mock('@capacitor/app')` / `@capacitor/push-notifications` with
capturable listener registries; router via the project's existing
router-mocking pattern (mock `useRouter` push/replace):

- not native → no plugin imports, no listeners
- `appUrlOpen` with allowed-host URL → `router.push` with stripped path
- `appUrlOpen` with foreign host → no navigation
- `pushNotificationActionPerformed` (`actionId: 'tap'`, data with `deepLink`)
  → `router.push`; missing deepLink → fallback route
- `getLaunchUrl` returns a URL → `router.replace` exactly once across remount
  (latch behavior)
- unmount removes listeners

### 6.3 Rails specs

- `spec/services/user/device/deep_link_builder_spec.rb` — table-driven over
  **every** name in `NotificationType.types` (loop the constant so a future
  type without a mapping fails the spec loudly or falls through to the
  documented default — pick "falls through + explicit default expectation"):
  - gift types → `?tab=Donations`; contact-info types → `?tab=ContactDetails`;
    care types → bare contact path; `NewPartnerDuplicateNotMerged` → merge tool
  - `many?` → `/accountLists/:alid`
  - path uses `contact.account_list_id` / `contact.id` (UUIDs intact)
- `spec/models/notification_type_spec.rb` — `user_notification_options`
  includes `deep_link` (single + many), retains `contact_url` and
  `account_list_id`; `to_json` round-trips through
  `PublishWorker#perform` string-opts parsing (existing worker spec covers the
  JSON-parse path — extend with `deep_link` present).
- Payload-placement specs (FCM v1 `message.data.deepLink`, APNs custom key)
  belong to the FCM-v1 design's `publish_service_spec.rb` work — assert there
  that `deepLink` is a **string** in FCM data (FCM v1 rejects non-string data
  values).

### 6.4 Manual / release-checklist verification

- `curl -sI https://mpdx.org/.well-known/apple-app-site-association` → direct
  200, `application/json`, no redirect (repeat for stage; repeat for
  `assetlinks.json`).
- Apple CDN check: `https://app-site-association.cdn-apple.com/a/v1/mpdx.org`.
- Android: `adb shell pm get-app-links <package>` shows `verified` for
  mpdx.org.
- Device matrix: push tap on cold start / warm start / logged-out → lands on
  contact Donations tab after (re)auth, on both platforms.

---

## 7. Coordination notes for sibling designs

- **FCM-v1 payload design:** field name on the wire is `deepLink` (string) in
  FCM v1 `message.data` and APNs custom keys; Ruby opts key is `deep_link`.
  Keep legacy APNs `link: { data: ... }` alongside until the old app sunsets.
- **Shell auth design:** must preserve the `?redirect=` / current-URL contract
  after the system-browser OAuth round-trip (§4.4). Universal links are NOT a
  reliable OAuth return channel (Apple ignores them on HTTP redirects) —
  prefer `ASWebAuthenticationSession` / Custom Tabs callback schemes; if a
  web-path return URL is still wanted, add an exact-match component to the
  AASA (§2.2) rather than widening `/accountLists/*`.
- **Shell project design:** owns the Xcode entitlements, AndroidManifest
  intent filter, and final bundle/package identifiers that feed §2/§3.

## 8. Open questions (Daniel)

1. Apple: is team `DQ48D9BF2V` still Cru's team, and does the new shell reuse
   bundle `org.cru.mpdx` (update the old App Store listing) or get a new
   bundle ID? AASA `appIDs` follows the answer.
2. Google Play: do we still control the `org.mpdx` listing, and is the plan to
   update it (keeps Play App Signing key → existing assetlinks fingerprint
   keeps working) or create a new listing (new package + new fingerprint entry
   needed)?
3. Confirm Amplify serves Next `headers()` for `public/` assets in the SSR
   build (one curl after a preview deploy); if not, `customHttp.yml` alone
   carries it.
4. Product sign-off on the tab mapping in §1.2 (especially
   `NewPartnerDuplicateNotMerged` → merge tool instead of contact detail).
