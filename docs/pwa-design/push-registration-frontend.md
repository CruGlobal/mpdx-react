# Push Registration — Frontend/Shell Design (Phase 3 frontend)

Status: DESIGN — 2026-06-10; §3.2/§3.3/§5.1/§6 reconciled with the
implemented listener-ownership, session-scoped registration, and enablePush
completion semantics after code review — 2026-06-11
Scope: the mpdx-react side of Phase 3 push notifications: Capacitor push plugin
integration, device registration against `/api/v2/user/devices`, unregister on
logout, permission UX, settings toggles, and notification-tap deep links.
Backend FCM v1 migration is designed separately (mpdx_api, branch
`pwa-push-fcm-v1`).

---

## 0. Verified facts this design rests on

### Backend contract (`/api/v2/user/devices`, read 2026-06-10)

`app/controllers/api/v2/user/devices_controller.rb` + `app/models/user/device.rb`:

- **Routes** (`config/routes.rb:299`): `resources :devices, except: :update`
  under `/api/v2/user` → `GET /api/v2/user/devices`, `GET/DELETE
/api/v2/user/devices/:id`, `POST /api/v2/user/devices`. JSON:API format,
  Bearer auth, scoped to `current_user.devices`.
- **Create attributes** (`User::Device::PERMITTED_ATTRIBUTES`): `platform`,
  `token`, `version`, `locale` (+ optional `id`, timestamps, `overwrite`).
  `platform`, `token`, `version`, `locale` are all presence-validated.
- **`platform` ∈ `['APNS', 'GCM']`** (uppercase). Android FCM tokens still
  register under `'GCM'` — that is the SNS platform name, do not "fix" it.
- **`locale` must be in Rails `I18n.available_locales`**
  (`config/initializers/fast_gettext.rb`): `en, en-US, ar, hy, my, zh-Hans-CN,
nl-NL, fr-CA, fr-FR, de, de-CH, id, it, ko, pl, pt-BR, ro, ru, es-419, th,
tr, uk, vi`. Note: **no bare `fr`** (frontend has one) — mapping needed.
- **Idempotent re-registration**: `before_validation :delete_conflicting_device`
  deletes any existing row with the same `platform`+`token` (without
  unregistering the SNS endpoint), then `register` creates/reuses the SNS
  endpoint. Re-POSTing the same token is safe; POSTing a token after a
  different user logs in on the same device transfers it (old user stops
  receiving pushes). This is the server-side idempotency we lean on.
- **Destroy**: `DELETE /api/v2/user/devices/:id` → `after_destroy :unregister`
  tears down the SNS endpoint; `Aws::SNS::Errors::InvalidClientTokenId` is
  swallowed. Policy: device must belong to `current_user`.
- **Serializer** (`user/device_serializer.rb`) returns `id, created_at, locale,
platform, version, updated_at` — **not** `token`. So the client must keep its
  own record of the registered token; the server response gives us the `id` we
  need for later DELETE.
- No client-generated-UUID requirement found in `app/lib/json_api_service.rb`;
  the server can mint the id and the create response returns it.

### Frontend plumbing (read 2026-06-10)

- The `apiToken` never needs to be touched by feature code: `makeAuthLink`
  (`src/lib/apollo/link.ts:54`) attaches `Authorization: Bearer <apiToken>` to
  **every** Apollo operation, and the REST proxy
  (`pages/api/graphql-rest.page.ts:1144`) forwards `req.headers.authorization`
  into `MpdxRestApi` (`willSendRequest` sets the `Authorization` header on the
  upstream REST call). Operations whose root fields are not in
  `rootFields.generated.ts` are routed to `/api/graphql-rest` by
  `isNativeOperation` — a new proxy-only mutation routes correctly with zero
  link changes.
- Signout paths wired to `clearApolloData()` today (the Phase 2 invariant):
  1. `pages/logout.page.tsx` (also clears SW CacheStorage)
  2. `src/components/Layouts/Primary/TopBar/Items/ProfileMenu/ProfileMenu.tsx:413`
  3. `src/components/Layouts/Primary/NavBar/NavTools/ProfileMenuPanel/ProfileMenuPanel.tsx:202`
  4. `src/lib/apollo/client.ts:39` — `AUTHENTICATION_ERROR` handler (token
     already invalid at this point).
- `src/components/Settings/notifications/NotificationsTable.tsx` **already
  renders the `app` channel** as the "In App" column (checkbox per notification
  type, Formik + `UpdateNotificationPreferences` mutation). The backend Phase 3
  task wires this same `app` flag to gate push sends — so per-type push
  toggles are already 95% built; we only adjust copy.
- Capacitor is not yet in `package.json` — this phase introduces
  `@capacitor/core` + plugins (the Phase 4 shell builds on the same install).
- Capacitor plugin API confirmed current (context7, 2026-06):
  `checkPermissions()`, `requestPermissions()` (prompts iOS first call only;
  Android 13+ prompts, ≤12 auto-grants), `register()` (never prompts; fires
  `registration` event with token or `registrationError`), `unregister()`,
  `removeAllListeners()`, events `registration`, `registrationError`,
  `pushNotificationReceived`, `pushNotificationActionPerformed`. On iOS the
  `registration` token is the **raw APNs device token** (no FCM SDK involved)
  — exactly what the SNS `APNS` platform app expects. On Android it is the FCM
  token, which the SNS `GCM` platform app expects.

---

## 1. Decision: device registration goes through the REST proxy (new Schema folder)

**Chosen:** a new `pages/api/Schema/UserDevices/` folder exposing
`registerUserDevice` / `destroyUserDevice` mutations, called from the client
through Apollo like every other proxy operation.

**Rejected:** direct `fetch('https://api.../api/v2/user/devices')` from a
shell-only module.

Justification:

1. **Token handling.** Direct fetch needs the `apiToken` in client JS
   (`useSession().user.apiToken`). The codebase's standard is that _only_ the
   Apollo auth link touches the token; the proxy boundary is the sanctioned
   fetch layer (`.CLAUDE/rules/code-review.md`: "No raw fetch or axios calls
   for data that could go through Apollo"). This data can go through Apollo.
2. **Shell mode makes it free.** The Capacitor webview runs the _hosted_ app
   (`server.url` mode), so `/api/graphql-rest` is same-origin and works
   identically in shell and browser. No CORS, no second auth path.
3. **Free behavior we want:** the Phase 2 `offlineLink` blocks the mutation
   when offline (registration retried next launch); generated TypeScript types;
   `GqlMockedProvider` testability; consistent error surfaces.
4. **Cost is small:** one schema folder following the documented 7-step
   pattern.

One non-issue to note: device mutations go through Apollo but their results are
junk data in the persisted cache. The schema below returns a plain
`UserDevice` type; we do not add a type policy for it, and the stored device
id lives in `localStorage`, not the Apollo cache (it must survive
`clearStore()` long enough to be used _during_ logout — see §4).

### 1.1 Schema folder: `pages/api/Schema/UserDevices/`

Per the repo pattern (`.graphql` → `resolvers.ts` → `datahandler.ts` → REST
call in `graphql-rest.page.ts`, register in `pages/api/Schema/index.ts`):

`pages/api/Schema/UserDevices/userDevices.graphql`:

```graphql
extend type Mutation {
  registerUserDevice(input: RegisterUserDeviceInput!): UserDevice!
  destroyUserDevice(input: DestroyUserDeviceInput!): UserDeviceDeletion!
}

enum UserDevicePlatformEnum {
  APNS
  GCM
}

input RegisterUserDeviceInput {
  platform: UserDevicePlatformEnum!
  token: String!
  version: String!
  locale: String!
}

input DestroyUserDeviceInput {
  id: ID!
}

type UserDevice {
  id: ID!
  platform: String!
  version: String!
  locale: String!
}

type UserDeviceDeletion {
  success: Boolean!
}
```

`MpdxRestApi` methods (in `pages/api/graphql-rest.page.ts`, matching existing
POST/DELETE shapes):

```ts
async registerUserDevice(attributes: RegisterUserDeviceInput) {
  const { data } = await this.post('user/devices', {
    body: {
      data: {
        type: 'user_devices',
        attributes: {
          platform: attributes.platform,
          token: attributes.token,
          version: attributes.version,
          locale: attributes.locale,
        },
      },
    },
  });
  return RegisterUserDevice(data); // datahandler: snake_case → camelCase
}

async destroyUserDevice(id: string) {
  await this.delete(`user/devices/${id}`, {
    body: { data: { type: 'user_devices' } },
  });
  return { success: true };
}
```

`datahandler.ts` maps the JSON:API resource (`data.id`,
`data.attributes.{platform,version,locale}`) to `UserDevice`. Every REST
response field is either mapped or intentionally ignored (timestamps —
ignored; `token` is not returned by the serializer).

Client operations live next to the code that uses them:
`src/lib/nativeShell/UserDevice.graphql` with operations named
`RegisterUserDevice` and `DestroyUserDevice` (descriptive, no Get/Load
prefix). Run `yarn gql` after adding.

---

## 2. Module layout — shell-only code, web build unaffected

New directory **`src/lib/nativeShell/`** — the single home for
Capacitor-aware code (Phase 4 camera work will join it):

```
src/lib/nativeShell/
├── nativeShell.ts            # platform detection — the ONLY static @capacitor/core import
├── pushRegistration.ts       # enable/disable/sync logic (lazy-imports the plugin)
├── pushStorage.ts            # localStorage keys: device id, token, enabled flag, locale
├── deviceLocale.ts           # frontend locale → API-accepted locale mapping
├── UserDevice.graphql        # RegisterUserDevice / DestroyUserDevice operations
├── *.test.ts                 # colocated tests
```

Rules that keep the web build unaffected:

- **`@capacitor/core` is statically imported only in `nativeShell.ts`.** It is
  a few-KB, side-effect-free runtime; `Capacitor.isNativePlatform()` returns
  `false` in any browser. Everything else gates on it:

  ```ts
  // src/lib/nativeShell/nativeShell.ts
  import { Capacitor } from '@capacitor/core';

  export const isNativeShell = (): boolean => Capacitor.isNativePlatform();

  // 'APNS' for ios, 'GCM' for android, null on web
  export const getDevicePlatform = (): 'APNS' | 'GCM' | null =>
    Capacitor.getPlatform() === 'ios'
      ? 'APNS'
      : Capacitor.getPlatform() === 'android'
        ? 'GCM'
        : null;
  ```

- **`@capacitor/push-notifications` and `@capacitor/app` are only ever loaded
  via dynamic `import()`** inside functions that have already checked
  `isNativeShell()`. The plugin code is split into an async chunk that web
  users never download, and the plugin's "not implemented on web" warnings
  never fire.

  ```ts
  const loadPushPlugin = async () =>
    (await import('@capacitor/push-notifications')).PushNotifications;
  ```

- Dependencies added now: `@capacitor/core`, `@capacitor/push-notifications`,
  `@capacitor/app` (for `App.getInfo().version` and Phase 4 reuse). Pin all
  three to the same Capacitor major chosen in Phase 4 (Capacitor 7 was current
  as of early 2026 — verify latest major at install time). Native platform
  packages (`@capacitor/ios`, `@capacitor/android`) remain Phase 4.

UI/bootstrap components:

```
src/components/Shell/PushBootstrap/PushBootstrap.tsx        # mounted in _app, returns null
src/components/Settings/notifications/PushNotificationsCard/
├── PushNotificationsCard.tsx                               # settings opt-in UI
├── PushNotificationsCard.test.tsx
```

`PushBootstrap` mounts inside `<ApolloProvider>` in `pages/_app.page.tsx`
(needs `useApolloClient` + `useRouter`). On web it renders nothing and touches
no plugin code (first check is `isNativeShell()`).

---

## 3. Registration lifecycle

### 3.1 State kept on the device (`pushStorage.ts`, localStorage)

The Capacitor webview's localStorage persists per app install; no extra
plugin needed. Keys (all cleared by `disablePush`):

| Key                   | Value                              | Purpose                                                      |
| --------------------- | ---------------------------------- | ------------------------------------------------------------ |
| `mpdx_push_enabled`   | `'true'`                           | user opted in via settings — gates launch-time auto-register |
| `mpdx_push_device_id` | server id from create response     | needed for `DELETE /user/devices/:id` on logout              |
| `mpdx_push_token`     | last token successfully registered | skip redundant POSTs when the token hasn't rotated           |
| `mpdx_push_locale`    | locale sent at registration        | re-register if user changes language                         |

These deliberately live _outside_ Apollo/IndexedDB: `clearApolloData()` must
not race with reading the device id during logout, and `clearStore()` would
otherwise wipe it before the DELETE fires.

### 3.2 Core functions (`pushRegistration.ts`)

All take the `ApolloClient` as an argument (callers get it from
`useApolloClient()`); mutations use the generated documents from
`UserDevice.graphql`.

**Listener ownership (reconciled 2026-06-11).** The `PushNotifications`
plugin is a module singleton shared with `NativeDeepLinkProvider`, which owns
the `pushNotificationActionPerformed` tap listener (deep-links design §4.3,
master plan §3.4 R3). An earlier revision of this section prescribed
`removeAllListeners()` for "idempotent re-attach"; that wiped the deep-link
tap listener whenever registration re-ran (locale settle, settings enable,
disable) and killed push-tap routing for the session. `pushRegistration`
therefore tracks the `PluginListenerHandle`s it attaches at module level and
removes ONLY those — it must never call `removeAllListeners()`.

**Session-scoped idempotency.** Module-level state per app launch:

- `registeredThisSession` — the localStorage token/locale comparison only
  short-circuits once a registration has succeeded in THIS session. Every app
  launch therefore performs exactly one upserting `RegisterUserDevice` POST,
  which lets the backend's `delete_conflicting_device` upsert (§0) fix device
  ownership after a user switch on the same shell (stale `mpdx_push_*` keys
  must not suppress the POST) and recreate rows the server deleted (e.g. SNS
  `PlatformApplicationDisabled` cleanup). Repeat `registration` events within
  the session are still skipped without a network call.
- `teardownEpoch` — bumped by `disablePush` before anything else. A
  registration mutation that resolves from a previous epoch must NOT
  `storeRegistration`/`setPushEnabled`; it fires a compensating
  `DestroyUserDevice` for the row it just created instead. This closes the
  disable-while-registering race where a late mutation resurrected push state
  after the user (or logout) disabled it.

```ts
// Attach 'registration'/'registrationError' listeners (removing only the
// handles THIS module previously attached), then PushNotifications.register().
// The listener is where the server call happens — this single path handles
// first registration, every app launch, AND token rotation (FCM onNewToken /
// APNs token change both surface as a new 'registration' event). The optional
// onRegistered callback fires once a registration event has been fully
// processed (mutation done or in-session skip confirmed) — enablePush uses it
// to report truthful completion.
export const startPushRegistration = async (
  client,
  locale,
  onRegistrationError?,
  onRegistered?,
): Promise<void> => {
  if (!isNativeShell()) return;
  const PushNotifications = await loadPushPlugin();
  await removeOwnedListeners(); // ours only — NEVER removeAllListeners()
  ownedListenerHandles.push(
    await PushNotifications.addListener('registration', ({ value: token }) =>
      registerDeviceWithApi(client, token, locale).then(
        (active) => active && onRegistered?.(),
        (error) => onRegistrationError?.(error),
      ),
    ),
  );
  ownedListenerHandles.push(
    await PushNotifications.addListener('registrationError', (error) =>
      onRegistrationError?.(error),
    ),
  );
  await PushNotifications.register(); // never prompts; fires 'registration'
};

const registerDeviceWithApi = async (
  client,
  token,
  locale,
): Promise<boolean> => {
  const platform = getDevicePlatform();
  if (!platform) return false;
  const mappedLocale = toDeviceLocale(locale); // §3.4
  if (
    registeredThisSession && // skip only applies WITHIN a session
    getStoredToken() === token &&
    getStoredLocale() === mappedLocale &&
    getStoredDeviceId()
  ) {
    return true; // unchanged within this session — no network call
  }
  const epoch = teardownEpoch;
  const version = await getShellVersion(); // App.getInfo().version, fallback '0.0.0'
  const { data } = await client.mutate({
    mutation: RegisterUserDeviceDocument,
    variables: { input: { platform, token, version, locale: mappedLocale } },
  });
  if (epoch !== teardownEpoch) {
    // disablePush ran while the mutation was in flight — compensate
    await client
      .mutate({
        mutation: DestroyUserDeviceDocument,
        variables: { input: { id: data.registerUserDevice.id } },
      })
      .catch(() => undefined);
    return false;
  }
  storeRegistration(data.registerUserDevice.id, token, mappedLocale);
  setPushEnabled(true);
  registeredThisSession = true;
  return true;
};
```

```ts
// User-facing opt-in (settings card button) — the ONLY place that prompts.
// Resolves 'granted' only once the device registration has ACTUALLY
// completed (OS 'registration' event received AND the RegisterUserDevice
// mutation finished), so the card's enabled state and success snackbar are
// truthful. Rejects on registrationError, mutation failure, or a 30s timeout
// waiting for the OS token — the card shows the error state with Retry.
export const enablePush = async (
  client,
  locale,
  onRegistrationError?,
): Promise<PushPermissionResult> => {
  if (!isNativeShell()) return 'unavailable';
  const PushNotifications = await loadPushPlugin();
  const { receive } = await PushNotifications.requestPermissions();
  if (receive !== 'granted') return 'denied';
  return new Promise((resolve, reject) => {
    // settle-once wrapper with a 30s timeout (registrationTimeoutMs)
    startPushRegistration(
      client,
      locale,
      (error) => {
        onRegistrationError?.(error);
        reject(error);
      },
      () => resolve('granted'),
    ).catch(reject);
  });
};
```

```ts
// Best-effort teardown — used by settings "disable" AND logout (§4).
// Every step is wrapped so one failure never blocks the next or the caller.
export const disablePush = async (client): Promise<void> => {
  if (!isNativeShell()) return;
  teardownEpoch += 1; // in-flight registrations must compensate, not store
  registeredThisSession = false;
  const deviceId = getStoredDeviceId();
  if (deviceId) {
    await client
      .mutate({
        mutation: DestroyUserDeviceDocument,
        variables: { input: { id: deviceId } },
      })
      .catch(() => undefined); // offline / 401 / already gone — proceed anyway
  }
  try {
    await removeOwnedListeners(); // ours only — the deep-link tap listener survives
    const PushNotifications = await loadPushPlugin();
    await PushNotifications.unregister(); // device stops receiving even if DELETE failed
  } catch {
    // plugin unavailable — nothing to tear down
  }
  clearPushStorage(); // always
};
```

### 3.3 App-launch flow (`PushBootstrap`) — silent re-registration + rotation

```ts
useEffect(() => {
  if (!isNativeShell() || !isPushEnabled()) return;
  (async () => {
    const PushNotifications = await loadPushPlugin();
    const { receive } = await PushNotifications.checkPermissions(); // NON-prompting
    if (receive !== 'granted') return; // user revoked in OS settings — stay silent
    await startPushRegistration(client, locale); // register() → 'registration' →
    // registerDeviceWithApi: one upserting POST per launch, then in-session skip
  })();
}, [client, locale]);
```

Invariants enforced here:

- **Never prompt on launch**: `requestPermissions()` is called _only_ from the
  settings card button. The bootstrap uses `checkPermissions()` (read-only)
  and `register()` (never prompts).
- **Token rotation handled**: the `registration` listener stays attached for
  the whole session, so an FCM rotation mid-session re-registers immediately;
  rotation while the app was closed is caught by the launch-time `register()`.
- **One upserting POST per launch**: the first `registration` event of each
  session POSTs even when token + locale match localStorage — the server-side
  `delete_conflicting_device` upsert makes this idempotent, fixes ownership
  after a user switch, and recreates server-deleted rows (§3.2). Repeat
  events within the session make zero network calls.
- If the POST fails (offline — `offlineLink` blocks it), nothing is stored;
  next launch retries naturally.

Notification-tap deep links are NOT handled here: `NativeDeepLinkProvider`
owns the `pushNotificationActionPerformed` listener and all tap/link routing
(deep-links design §4.3, master plan §3.4 R3). `PushBootstrap` is
registration lifecycle only, and `pushRegistration` never touches listeners
it does not own (§3.2), so the provider's tap listener survives every
registration re-run.

### 3.4 Locale + version

- `toDeviceLocale(locale)` (`deviceLocale.ts`): exact match against the API's
  accepted list when possible, else base-language match (`fr` → `fr-FR`),
  else `'en'`. Keep the accepted-locale list as a frozen const with a comment
  pointing at `mpdx_api/config/initializers/fast_gettext.rb` (drift risk noted
  in §7). Locale source: `useLocale()` (user preference), matching what the
  API uses for push text.
- `getShellVersion()`: `(await import('@capacitor/app')).App.getInfo()` →
  `version`, with `'0.0.0'` fallback (the attribute is presence-validated
  server-side). This is the _shell_ version — exactly what we need for the
  Phase 4 minimum-shell-version handshake later.

---

## 4. Unregister on logout — extending the clearApolloData invariant

Phase 2 established: _every path that ends a session must call
`clearApolloData()`_. The same three user-initiated paths currently duplicate
a 3–4 line teardown block. Rather than adding a fourth copy-pasted line, we
consolidate:

**New: `src/lib/auth/logoutCleanup.ts`**

```ts
export const logoutCleanup = async (
  client: ApolloClient<object>,
): Promise<void> => {
  // 1. Unregister push FIRST — needs a valid apiToken for the DELETE,
  //    and clearStore() below would drop in-flight operations.
  await disablePush(client); // no-op on web; never throws
  // 2. Clear SW CacheStorage (previously only on logout.page — now everywhere,
  //    a strict improvement for the shared-device story).
  if (typeof caches !== 'undefined') {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
  clearDataDogUser();
  // 3. The Phase 2 invariant.
  await clearApolloData(client);
};
```

Callers become `await logoutCleanup(client); await signOut({ callbackUrl: 'signOut' });`:

1. `pages/logout.page.tsx`
2. `ProfileMenu.tsx` (TopBar)
3. `ProfileMenuPanel.tsx` (NavBar)
4. `src/lib/apollo/client.ts` `AUTHENTICATION_ERROR` handler: keep its current
   signOut-then-clean ordering but swap `clearApolloData(client)` for
   `logoutCleanup(client)`. The DELETE will 401 here (token already dead) —
   `disablePush` swallows it, still calls the plugin `unregister()` (device
   stops receiving) and clears local keys. The orphaned server row is cleaned
   up by `delete_conflicting_device` on the next login from that device, and
   by the backend's stale-device cleanup on `EndpointDisabled`.

Web safety: `disablePush` returns immediately when `!isNativeShell()` — no
plugin chunk is ever fetched in a browser, and the behavior of the three web
signout paths is unchanged except for the (beneficial) CacheStorage clearing.

Update the invariant comment in `clearApolloData.ts` and the roadmap to say
new signout paths must call **`logoutCleanup()`** (which wraps
`clearApolloData`).

Note: logging out _keeps OS-level permission granted_ — by design. Logging
back in re-registers silently on next launch only if `mpdx_push_enabled` is
set; since `disablePush` cleared it, the returning user must re-enable from
settings. If product prefers "stays enabled across re-login on the same
device", we instead preserve the flag in `logoutCleanup` (1-line change —
flagged as an open question).

---

## 5. Permission UX + settings toggles

### 5.1 `PushNotificationsCard` (in-context prompt, never on first launch)

Rendered at the top of the existing notifications settings page
(`pages/accountLists/[accountListId]/settings/notifications.page.tsx`, above
`<NotificationsTable>`), and **only when `isNativeShell()`** — web users never
see it, so the page is visually unchanged in browsers.

States (MUI `Card` + `Alert`, all copy via `t()`):

| State         | Detection                                                                                     | UI                                                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading       | permission not yet read (`usePushPermission()` returns `null`)                                | `<Skeleton>` — never flash an active enable button at a previously-denied user                                                                                                     |
| Off (default) | `!isPushEnabled()` and permission not `denied`                                                | Explainer copy ("Get notified on this device when…") + **Enable Push Notifications** button → `enablePush()` — this button is the only `requestPermissions()` call site in the app |
| Enabled       | `isPushEnabled()` and permission `granted`                                                    | Success state + **Disable on this device** button → `disablePush()` (stays signed in)                                                                                              |
| Denied        | `checkPermissions().receive === 'denied'`                                                     | `<Alert severity="warning">` with per-OS instructions to enable notifications in device Settings, then return here (no extra native-settings plugin this release)                  |
| Error         | `registrationError` fired, mutation failed, or registration timed out (`enablePush` rejected) | `<Alert severity="error">` + Retry                                                                                                                                                 |

The enabled state and success snackbar appear only after `enablePush`
resolves — i.e. after the OS token arrived AND the `RegisterUserDevice`
mutation completed (§3.2) — never on `register()` returning. While the flow
runs, the button is disabled with a `CircularProgress` in-progress indicator.

Permission state comes from a small colocated `usePushPermission()` hook:
`checkPermissions()` (non-prompting) on mount AND on every document
`visibilitychange` back to visible — returning from OS Settings resumes the
Capacitor webview without a remount, so the denied state must clear within
the session for the alert's "then return here" instructions to work.

### 5.2 Per-type toggles — reuse the `app` channel column

`NotificationsTable` already renders, persists, and selects-all the `app`
flag per notification type ("In App" column, smartphone icon). The backend
Phase 3 task gates push sends on exactly this flag. Therefore **no new
per-type UI is built**. Changes are copy-only:

- Relabel the column header `t('In App')` → `t('Mobile App')` with a tooltip:
  `t('Delivered as push notifications in the MPDX mobile app')` (final copy:
  open question; the smartphone icon already implies this).
- When rendered inside the shell with push enabled, the card (§5.1) sits
  directly above the table, so the user sees "enable on device" + "choose
  types" as one flow.

No changes to the Formik schema, mutation, or the `app` field wiring.

---

## 6. TDD plan

Conventions: colocated `*.test.{ts,tsx}`, `GqlMockedProvider` with typed
generics + `mutationSpy`/`toHaveGraphqlOperation`, `findBy*`, no `fetch`
mocking, no `any` (use generated `RegisterUserDeviceMutation` etc. after
`yarn gql`).

### 6.1 Mocking Capacitor

Real packages are installed, so plain `jest.mock` factories work — including
through dynamic `import()` (Jest resolves dynamic imports from the same module
registry). Shared helper at `__tests__/util/capacitorMocks.ts`:

```ts
export const mockPushNotifications = {
  checkPermissions: jest.fn().mockResolvedValue({ receive: 'prompt' }),
  requestPermissions: jest.fn().mockResolvedValue({ receive: 'granted' }),
  register: jest.fn().mockResolvedValue(undefined),
  unregister: jest.fn().mockResolvedValue(undefined),
  addListener:
    jest.fn(/* returns { remove } handles that mark the handler removed */),
  removeAllListeners: jest.fn(/* marks every attached handler removed */),
};

// Fire attached listeners like the OS would. These respect handle.remove()
// and removeAllListeners() semantics — a removed listener no longer receives
// events — so cross-module listener-ownership bugs reproduce in jest:
export const emitRegistration = async (token: string) => {
  /* … */
};
export const emitRegistrationError = async (error: string) => {
  /* … */
};
export const emitPushNotificationActionPerformed = async (actionId, data) => {
  /* … */
};

export const setNativePlatform = (platform: 'ios' | 'android' | 'web') => {
  /* drives the @capacitor/core mock */
};
```

Test files do:

```ts
jest.mock('@capacitor/core', () => capacitorCoreMock);
jest.mock('@capacitor/push-notifications', () => ({
  PushNotifications: mockPushNotifications,
}));
jest.mock('@capacitor/app', () => ({
  App: { getInfo: jest.fn().mockResolvedValue({ version: '1.0.0' }) },
}));
```

For lib functions that need an `ApolloClient`, render a tiny probe component
inside `GqlMockedProvider` that grabs `useApolloClient()` — keeps Apollo
mocking at the operation level per project convention.

### 6.2 Test matrix (write each failing first — red/green per superpowers TDD)

**`deviceLocale.test.ts`** — exact match (`de`), regional passthrough
(`pt-BR`), base-language upgrade (`fr` → `fr-FR`), unknown → `'en'`.

**`pushRegistration.test.ts`** (probe-component harness):

- web platform → `enablePush` returns `'unavailable'`, no plugin import, no mutation
- ios → `emitRegistration('tok')` → `toHaveGraphqlOperation('RegisterUserDevice', { input: { platform: 'APNS', token: 'tok', version: '1.0.0', locale: 'en' } })`; android → `'GCM'`
- stores device id from mocked mutation response; sets enabled flag
- second `emitRegistration` with the _same_ token in the same session → no second mutation (in-session idempotent skip); with a _rotated_ token → re-registers and updates stored id; a _fresh session_ with matching localStorage → still POSTs once (upsert, §3.2)
- permission denied → returns `'denied'`, `register()` never called
- `enablePush` resolves `'granted'` only after the registration mutation completes; rejects on `registrationError`, mutation failure, or timeout
- **listener ownership**: a foreign `pushNotificationActionPerformed` listener survives `startPushRegistration` AND `disablePush`; `removeAllListeners()` is never called (regression also pinned in `NativeDeepLinkProvider.test.tsx`)
- `disablePush`: fires `DestroyUserDevice` with stored id, removes only its own listeners, calls `unregister()`, clears all keys; mutation rejection still clears keys and resolves; no stored id → skips mutation but still tears down plugin
- disable-while-registering race: `disablePush` during an in-flight register mutation → state stays cleared and a compensating `DestroyUserDevice` fires for the late-created row

**`PushBootstrap.test.tsx`**:

- web → renders null, no plugin access
- native + flag unset → `checkPermissions` not even needed, no `register()`
- native + flag set + granted → `register()` called; one upserting POST per launch even with unchanged token/locale; rotated token re-registers via `toHaveGraphqlOperation`
- native + flag set + revoked (`denied`) → silent, no mutation
- **invariant test: `requestPermissions` is NEVER called from bootstrap**
- (tap routing tests live in `NativeDeepLinkProvider.test.tsx` — see deep-links design §4.3)

**`PushNotificationsCard.test.tsx`** (`GqlMockedProvider<{ RegisterUserDevice: RegisterUserDeviceMutation }>`):

- web → renders nothing
- default state → enable button; click → `requestPermissions` then `register`; no enabled state or snackbar until `emitRegistration` + mutation complete → then success snackbar + enabled state
- denied result → instructions alert, no `register()`
- denied recovery: permission re-granted in OS Settings + `visibilitychange` back to visible → card leaves the denied state
- loading skeleton while the permission read is unresolved (no enable-button flash)
- enabled state → disable button → `toHaveGraphqlOperation('DestroyUserDevice', ...)` + reverts to default state
- disable failure paths: `unregister()` rejection and `DestroyUserDevice` rejection both still revert to the off state with local keys cleared
- buttons disabled (with progress indicator) while in flight; error state shows retry; register-mutation failure shows the error alert and never a success snackbar

**`logoutCleanup.test.ts`**:

- ordering: `DestroyUserDevice` mutation observed **before** `cachePersistor.purge`/`clearStore` (spy call-order assertion) — protects the "unregister while token valid" rule
- mutation rejection → `clearApolloData` still runs and the function resolves (signout never blocked)
- web → no plugin import; CacheStorage cleared when `caches` exists
- existing `logout.page.test`, `ProfileMenu.test`, `ProfileMenuPanel.test` updated to assert `logoutCleanup` behavior is preserved (CacheStorage + clearApolloData + signOut still happen)

**Proxy layer** — `pages/api/Schema/UserDevices/datahandler.test.ts`: JSON:API
device resource → `UserDevice` mapping; destroy returns `{ success: true }`.
Verify `yarn gql` runs cleanly after adding the schema + operations (Standards
checklist requirement).

**`NotificationsTable.test.tsx`** — update label assertions for the renamed
column; behavior tests unchanged.

### 6.3 Manual QA (needs Phase 4 shell + Firebase/APNs credentials — gated)

Real-device checklist (cannot be Jest-tested): iOS prompt appears only from
settings button; kill/relaunch → no prompt, silent re-register; FCM token
rotation (reinstall) → new token registered; logout → push stops arriving;
notification tap cold-start deep link; OS-level revoke → card shows denied
state.

---

## 7. Build/ship order and risks

Order (all frontend tasks land dark — native-gated, zero web behavior change —
so they can merge before the Phase 4 shell exists):

1. Proxy schema folder + datahandler tests (`yarn gql` green)
2. Capacitor deps + `nativeShell.ts` + `deviceLocale.ts` + `pushStorage.ts`
3. `pushRegistration.ts` + tests
4. `logoutCleanup.ts` consolidation + signout-path rewiring + tests
5. `PushNotificationsCard` + page integration + table relabel + tests
6. `PushBootstrap` + `_app` mount + deep-link handling + tests
7. Manual QA once Phase 4 shell + Firebase/APNs creds + backend FCM v1 land

Risks:

- **iOS token type assumption**: Capacitor hands us the raw APNs token, which
  matches the current SNS `APNS` platform app. If the backend migration ever
  consolidates on FCM-for-iOS instead, the shell needs the FCM iOS SDK
  (`@capacitor-firebase/messaging`) — confirm the backend keeps the APNS
  platform app before building (open question).
- **`app` channel semantics**: relabeling "In App" assumes the flag's only
  consumer becomes push. If `app` also drives an in-app notification list,
  keep the label broader.
- **Locale list drift** between the hardcoded accepted list and
  `fast_gettext.rb`; a 422 on locale falls back to retry-with-`'en'` only if
  we add that — current design relies on the mapping staying fresh.
- **End-to-end untestable until Phase 4**: unit coverage is strong but the
  registration⇄SNS⇄FCM path is unproven until shell + credentials exist.
- **Capacitor major version**: verify current major (7 vs newer) at install
  time; plugin API above is stable across 5→7.
