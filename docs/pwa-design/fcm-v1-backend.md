# Phase 3 Backend Design — FCM HTTP v1 Push Migration (mpdx_api)

Status: DESIGN — 2026-06-10
Repo: `/Users/danielbisgrove/Documents/Web_Dev/MPDX/mpdx_api`, branch `pwa-push-fcm-v1`
Companion: `docs/pwa-roadmap.md` (Phase 3), deep-links design doc (routes TBD by deep-links agent)

## 1. Current pipeline (verified by reading the code)

```
AccountList::NotificationsSender#send_notifications        (12h cron per account list)
  ├─ NotificationType.check_all            — only runs a type if a preference has app OR email OR task = true
  ├─ create_tasks(...)                     — gated by NotificationPreference.task
  ├─ send_email_notifications(...)         — gated by NotificationPreference.email (require_user: true)
  └─ send_user_notifications(...)          — gated by NotificationPreference.app   (require_user: true)
       └─ User::Notification.create_by_type (app/models/user/notification.rb:20)
            └─ User::Device::PublishWorker.perform_at(user.send_notifications_at, user_id,
                 notification_type.user_notification_description(...),
                 notification_type.user_notification_options(...).to_json)

Task::NotificationWorker (app/workers/task/notification_worker.rb)
  └─ PublishWorker.new.perform(user.id, "<type> <contact> <subject>", task_id:, account_list_id:)
       — gated per-task by task.notification_type IN ('mobile','both'), NOT by NotificationPreference

Api::V2::User::Notifications::BulkController#update (re-push existing notifications to own devices)
  └─ PublishWorker.perform_async(current_user.id, description, options.to_json)

User::Device::PublishWorker (app/workers/user/device/publish_worker.rb)
  — JSON-parses opts (symbolize_names), skips non-admins on staging, iterates user.devices,
    destroys device on EndpointDisabled / PlatformApplicationDisabled
  └─ User::Device::PublishService.publish(device, message, opts)
       └─ ClientService#publish(endpoint_arn, payload, message_structure: 'json')   # AWS SNS
```

`User::Device` (app/models/user/device.rb): platforms `APNS`/`GCM`, registers an SNS
endpoint on create via `RegistrationService` using `SNS_APNS_APPLICATION_ARN` /
`SNS_GCM_APPLICATION_ARN`, idempotent, deletes conflicting (platform, token) rows,
unregisters on destroy. REST endpoints at `/api/v2/user/devices`
(`app/controllers/api/v2/user/devices_controller.rb`) — the Capacitor shell reuses
these unchanged.

**Current payloads** (app/services/user/device/publish_service.rb):

```ruby
# APNs — valid, keep working:
{ aps: { alert: message }, link: { data: opts.to_json } }
# GCM — LEGACY FORMAT, dead since Google killed the legacy FCM API (mid-2024):
{ data: opts.merge(message: message) }
```

Two problems with the GCM payload beyond the dead API:

1. Even after SNS credentials move to FCM v1 (SNS auto-transforms legacy payloads),
   this payload is **data-only** — no `notification` block — so Android shows
   nothing in the tray when the app is backgrounded/killed. The Capacitor shell
   needs a display notification.
2. Custom data is mixed with `message` in one bag; FCM v1 requires `message.data`
   values to be **strings** (map<string,string>), which the current hash does not
   guarantee (`account_list_id` is a UUID string, but `task_id`, counts, etc. ride
   through untyped).

## 2. Payload migration — `publish_service.rb`

### Wire format decision

- **FCM v1 (Android):** SNS accepts a native v1 payload under the `GCM` key when
  wrapped in the top-level key `fcmV1Message` (AWS docs:
  [Using FCM v1 payloads in Amazon SNS](https://docs.aws.amazon.com/sns/latest/dg/sns-fcm-v1-payloads.html)).
  We send `message.notification` (display) + `message.data` (custom keys, all
  string values) + `message.android.priority: "high"`.
- **APNs (iOS):** unchanged transport. Custom keys ride **flattened at the top
  level alongside `aps`** — `@capacitor/push-notifications` surfaces these as
  `notification.data.<key>` on iOS (plugin `data` = full APNs `userInfo`),
  giving the frontend one uniform shape (`notification.data.deepLink`) on both
  platforms. **VERIFIED 2026-06-10 against plugin source
  (ionic-team/capacitor-plugins, branches `7.x` and `main`/v8.1.1 — identical
  mapping):**
  - iOS: `push-notifications/ios/Sources/PushNotificationsPlugin/PushNotificationsHandler.swift`,
    `makeNotificationRequestJSObject` sets
    `"data": JSTypes.coerceDictionaryToJSObject(request.content.userInfo) ?? [:]`
    for both `willPresent` (foreground) and `didReceive` (tap →
    `pushNotificationActionPerformed`). So `data` is the **entire** `userInfo`:
    top-level `deepLink` arrives as `data.deepLink`, and `data.aps` /
    `data.link` (legacy key) are also present — readers must pick fields, not
    assume `data` contains only our custom keys.
  - Android: `push-notifications/android/src/main/java/com/capacitorjs/plugins/pushnotifications/PushNotificationsPlugin.java`
    — `fireNotification` copies every `remoteMessage.getData()` entry into
    `data`; the background/killed tap path (`handleOnNewIntent`, fired when the
    launch intent extras contain `google.message_id`) copies all bundle extras
    into `data` (mapping `google.message_id` → `id`), so FCM v1 `message.data`
    entries (incl. `deepLink`) surface as `data.deepLink` on tap, alongside FCM
    bookkeeping extras (`google.*`, `from`, `collapse_key`) that readers must
    ignore.

  The legacy `link: { data: ... }` key is kept for the still-fielded legacy iOS
  app and dropped once that app is retired.
- `deepLink` is camelCase on the wire (frontend-friendly); `:deep_link` snake_case
  inside Ruby `opts`.

### New `publish_service.rb` (full sketch)

```ruby
# This service class is responsible for publishing a message to a device registered with AWS SNS.
class User::Device::PublishService
  # Keys that may not be used as custom data (reserved by APNs / our envelope)
  RESERVED_KEYS = %i[aps link].freeze

  class << self
    def publish(device, message, opts = {})
      new(device, message, opts).publish
    end
  end

  def initialize(device, message, opts = {})
    @device = device
    @message = message
    @opts = opts
  end

  def publish
    client.publish(device.endpoint, payload)
  end

  private

  attr_accessor :device, :message, :opts

  def client
    @client ||= User::Device::ClientService.new
  end

  def payload
    @payload ||= { device_platform => sns_payload.to_json }.to_json
  end

  def sns_payload
    case device.platform
    when 'APNS' then apns_payload
    when 'GCM'  then gcm_payload
    end
  end

  def device_platform
    case device.platform
    when 'APNS'
      return 'APNS_SANDBOX' if ENV.fetch('SNS_APNS_APPLICATION_ARN').include?('APNS_SANDBOX')
      'APNS'
    else
      device.platform
    end
  end

  # Custom keys delivered to the app on tap. FCM v1 requires string values;
  # we apply the same constraint to APNs for cross-platform consistency.
  # opts MUST be a flat hash of scalars (existing callers comply).
  def data_payload
    data = opts.except(*RESERVED_KEYS)
    deep_link = data.delete(:deep_link) || data.delete('deep_link')
    data[:deepLink] = deep_link if deep_link.present?
    data.compact.transform_values(&:to_s)
  end

  def apns_payload
    data_payload.merge(
      aps: { alert: message },
      # Legacy native iOS app compatibility — remove when that app is retired.
      link: { data: opts.to_json }
    )
  end

  # FCM HTTP v1 message, wrapped in SNS's fcmV1Message envelope.
  # https://docs.aws.amazon.com/sns/latest/dg/sns-fcm-v1-payloads.html
  def gcm_payload
    {
      fcmV1Message: {
        message: {
          notification: { body: message.to_s },
          data: data_payload,
          android: { priority: 'high' }
        }
      }
    }
  end
end
```

### Resulting wire payloads (exact)

APNs (SNS `Message` body, `MessageStructure=json`):

```json
{
  "APNS": "{\"deepLink\":\"/accountLists/<alid>/contacts/<cid>\",\"accountListId\":\"<alid>\",\"contactUrl\":\"https://mpdx.org/...\",\"aps\":{\"alert\":\"Sarah Jones gave a special gift of $100\"},\"link\":{\"data\":\"{...legacy opts json...}\"}}"
}
```

(key spelling note: only `:deep_link` is renamed to `deepLink`; other opts keys pass
through as-is — today they are `contact_url`, `account_list_id`, `task_id`. The
frontend reads only `deepLink`; the rest is legacy/diagnostic. If we later want
fully camelCase data, do it as a follow-up with the deep-links agent.)

FCM v1:

```json
{
  "GCM": "{\"fcmV1Message\":{\"message\":{\"notification\":{\"body\":\"Sarah Jones gave a special gift of $100\"},\"data\":{\"contact_url\":\"https://mpdx.org/...\",\"account_list_id\":\"<alid>\",\"deepLink\":\"/accountLists/<alid>/contacts/<cid>\"},\"android\":{\"priority\":\"high\"}}}}"
}
```

Notes / deliberate choices:

- `notification.body` only, no `title` — Android shows the app name as title;
  matches today's APNs behavior (bare `alert` string). Adding per-type titles is a
  cheap follow-up (`NotificationType#user_notification_title_template` already
  exists as an abstract hook).
- No `sound` added — keeps behavior identical to today; flag for product decision.
- No `default` key in the SNS message — the existing production publishes omit it
  for endpoint publishes and work; don't churn that.
- `ClientService`, `RegistrationService`, `PublishWorker`, `User::Device` are all
  **unchanged**. `APNS_SANDBOX` switch is unchanged.

## 3. Deep-link data

Format contract (owned by the deep-links design agent; we only define carriage):
`deepLink` is a **path-only** web route string, e.g.
`/accountLists/<accountListId>/contacts/<contactId>`. It rides:

- APNs: top-level custom key `deepLink` alongside `aps`
- FCM v1: `message.data.deepLink`

Capacitor's `pushNotificationActionPerformed` handler reads
`notification.data.deepLink` on both platforms and routes the webview.

### Where `deep_link` enters `opts` (two call sites + the WebRouter helper refactor)

(Terminology aligned with deep-links.md §1.1 and master plan §3.4 R7: the actual
opts-injection call sites are (b) and (c); (a) is a path-helper refactor that
supplies the strings, not an injection site.)

**a) `WebRouter` — add path helpers** (app/services/web_router.rb), refactoring
`contact_url` to reuse them so path strings exist in exactly one place:

```ruby
def self.contact_path(contact, tab = nil)
  "/accountLists/#{contact.account_list_id}/contacts/#{contact.id}#{"?tab=#{tab}" if tab}"
end

def self.contacts_path(account_list_id)
  "/accountLists/#{account_list_id}/contacts"
end

def self.tasks_path(account_list_id)
  "/accountLists/#{account_list_id}/tasks"
end

def self.contact_url(contact, tab = nil)
  "#{base_url}#{contact_path(contact, tab)}"
end

def self.tasks_url(account_list_id)
  "#{base_url}#{tasks_path(account_list_id)}"
end
```

**b) `NotificationType#user_notification_options`** (app/models/notification_type.rb:127)
— covers both the cron sender path and the bulk re-push controller (which calls the
same method):

```ruby
def user_notification_options(user_notifications)
  contact = user_notifications.first.notification.contact
  if user_notifications.many?
    {
      account_list_id: contact.account_list_id,
      deep_link: WebRouter.contacts_path(contact.account_list_id) # PLACEHOLDER route — deep-links agent finalizes
    }
  else
    {
      contact_url: WebRouter.contact_url(contact),
      account_list_id: contact.account_list_id,
      deep_link: WebRouter.contact_path(contact)
    }
  end
end
```

**c) `Task::NotificationWorker#send_mobile_notification`**
(app/workers/task/notification_worker.rb:23):

```ruby
User::Device::PublishWorker.new.perform(
  user.id,
  [_(task.activity_type), task.contacts.first&.name, task.subject].compact.join(' '),
  task_id: task.id,
  account_list_id: task.account_list_id,
  deep_link: WebRouter.tasks_path(task.account_list_id) # PLACEHOLDER — deep-links agent may define /tasks?taskId=<id>
)
```

Coordination note for the deep-links agent: the two PLACEHOLDER routes above
(multi-notification target, single-task target) are the only routes this design
does not consider final; single-contact (`/accountLists/<id>/contacts/<id>`) is
final since it mirrors the existing `contact_url`.

## 4. NotificationPreference `app` channel gating — ALREADY WIRED

Finding (this changes the roadmap task from "build" to "verify"):
`AccountList::NotificationsSender` already gates push exactly like email —
`queue_notifications_by_type(notifications, type, {}, :app)` →
`send_user_notifications` → `create_by_type` → `PublishWorker`
(app/services/account_list/notifications_sender.rb:46,76,147). It is also already
spec'd both ways (spec/services/account_list/notifications_sender_spec.rb:218-237:
`app: true` sends, `app: false` doesn't), and `NotificationType.check_all` includes
`app` in its OR clause. The `app` column is already exposed through the
NotificationPreference serializer/GraphQL type, so the frontend settings UI work in
Phase 3 needs no new API.

Remaining work in this area:

1. **Strengthen the regression spec** — the existing `app: true` spec asserts
   `User::Notification.create_by_type` is received; add one asserting the
   observable outcome: a `User::Device::PublishWorker` job is enqueued with the
   expected description and opts JSON (including `deep_link`), and zero jobs when
   `app: false`. This is the contract the shell depends on.
2. **Document, don't change, the two non-preference paths:**
   - `Task::NotificationWorker` is gated by the per-task `notification_type`
     ('mobile'/'both') the user picked when scheduling the reminder — explicit
     intent, correctly independent of NotificationPreference.
   - `Notifications::BulkController#update` is a user-initiated "send my
     notifications to my phone" action on `current_user` — also correctly
     ungated.
3. Note for QA: `PublishWorker` drops sends for non-admin users on **staging**
   (publish_worker.rb:21) — staging test users must be admins.

## 5. Ops runbook for Daniel (AWS SNS console + Firebase)

### 5.1 Inspect the existing platform applications

AWS Console → Amazon SNS → Mobile → Push notifications → Platform applications
(region from the deploy config's `AWS_REGION`). Find the two apps whose ARNs match
`SNS_GCM_APPLICATION_ARN` / `SNS_APNS_APPLICATION_ARN` in cru-deploy/ECS task defs.

**GCM/FCM app — record:**

- "Firebase Cloud Messaging credential type": **API key** (legacy server key —
  dead since June 2024) vs **Token** (FCM HTTP v1 service-account JSON).
- The Firebase **Sender ID / project** the old key belonged to (visible in the
  old key's Firebase project if recoverable). This matters: device tokens are
  per-Firebase-project; if the new credentials come from a *different* Firebase
  project than the one the shell's `google-services.json` uses, every send fails
  with `SENDER_ID_MISMATCH`. Platform app credentials and the shell's Firebase
  app must come from the **same project**.

**APNs app — record:**

- "Apple credential type": certificate (.p12, expires yearly — check expiry) vs
  signing key (.p8 token, never expires — preferred).
- The bundle ID it's configured for (legacy app's ID). The new Capacitor shell's
  bundle ID must match the platform app's configuration, or we create a second
  APNs platform app for the shell and point `SNS_APNS_APPLICATION_ARN` at it.

### 5.2 Firebase project setup (placeholder until accounts confirmed)

1. Firebase console → Add project (suggest reusing the legacy MPDX project if it
   still exists — keeps any surviving tokens valid; otherwise new project "MPDX").
2. Add an **Android app** with the shell's applicationId — placeholder
   `org.mpdx` (the legacy package from `public/.well-known/assetlinks.json`);
   confirm with the Capacitor shell design before creating.
3. Download `google-services.json` → goes into the Capacitor Android project
   (frontend task, not this repo).
4. Project settings → Cloud Messaging: confirm "Firebase Cloud Messaging API (V1)"
   is **Enabled**.
5. Project settings → Service accounts → **Generate new private key** → downloads
   the service-account JSON used by SNS.

### 5.3 Update SNS credentials

- GCM platform app → Edit → credential type **Token** → upload the
  service-account JSON from 5.2. (If the console refuses to edit in place,
  create a new platform application and update `SNS_GCM_APPLICATION_ARN` in the
  deploy config — note `User::Device::RegistrationService::PLATFORMS` reads the
  env var at boot, so an ECS redeploy is required.)
- APNs platform app → if cert-based or expired: Apple Developer portal →
  Certificates, Identifiers & Profiles → Keys → create an APNs Auth Key (.p8) →
  SNS Edit → "Token" credential type → upload .p8 + Key ID + Team ID + the
  shell's bundle ID. For development builds you'll also want a sandbox platform
  app (ARN containing `APNS_SANDBOX` — the code's auto-switch keys off that
  substring in `SNS_APNS_APPLICATION_ARN`).
- Existing GCM endpoints in SNS are ~2 years stale; don't bulk-clean — the
  pipeline self-heals (`EndpointDisabled` → `device.destroy`).

### 5.4 End-to-end validation with one test device

1. Build the Capacitor shell dev build with `google-services.json`, log in as an
   **admin** user (staging guard), grab the FCM token from the
   `registration` event log.
2. Register it:
   `POST /api/v2/user/devices` body
   `{"data":{"type":"user_devices","attributes":{"platform":"GCM","token":"<fcm-token>","version":"1","locale":"en"}}}`
   → confirm 201 and that the created device has an `endpoint` ARN.
3. Console smoke test without the app (proves SNS+credentials alone):
   ```bash
   aws sns publish --target-arn '<endpoint-arn>' --message-structure json \
     --message '{"GCM":"{\"fcmV1Message\":{\"message\":{\"notification\":{\"body\":\"MPDX test\"},\"data\":{\"deepLink\":\"/accountLists/test/contacts\"}}}}"}'
   ```
4. Full-pipeline test from `rails console` on staging:
   ```ruby
   User::Device::PublishWorker.new.perform(user.id, 'Test push',
     deep_link: "/accountLists/#{account_list_id}/contacts")
   ```
5. Verify: tray notification appears; tapping it opens the app and the
   `pushNotificationActionPerformed` payload contains `data.deepLink`.
6. Repeat 2–5 for APNs with a TestFlight/dev build (`platform: "APNS"`); confirm
   sandbox vs production ARN matches the build type.
7. Optional: enable SNS delivery status logging on the platform app → CloudWatch
   shows per-message FCM/APNs responses (the failure table in the AWS doc above
   maps error codes).

## 6. TDD plan (rspec; ruby 3.3.10 via asdf, `bundle exec rspec`)

Order of work — each step: write/adjust spec (red) → implement (green):

1. **`spec/services/user/device/publish_service_spec.rb`** (primary; rewrite the
   GCM context, extend APNs):
   - GCM: publishes `{"GCM": <json>}` where json is exactly the `fcmV1Message`
     structure above (notification.body = message, android.priority = high).
   - GCM data stringification: `opts = { task_id: 123, deep_link: '/x' }` →
     `data == { task_id: '123', deepLink: '/x' }` (no `deep_link` key, all values
     strings, nils compacted).
   - APNs: custom keys flattened at top level alongside `aps`; `aps.alert` still
     the bare message string; legacy `link.data` key still present and unchanged.
   - APNs reserved-key safety: opts containing `aps`/`link` keys cannot clobber
     the envelope.
   - APNS_SANDBOX context: existing spec keeps passing (only inner payload
     changes).
2. **`spec/services/web_router_spec.rb`**: new `contact_path`, `contacts_path`,
   `tasks_path`; `contact_url`/`tasks_url` outputs byte-identical to today
   (refactor-safety).
3. **`spec/models/notification_type_spec.rb` `#user_notification_options`**
   (UPDATE existing): both `eq` assertions gain the `deep_link` key (single →
   contact path; many → contacts-list placeholder path).
4. **`spec/workers/task/notification_worker_spec.rb`** (UPDATE): mobile
   notification expectation gains `deep_link` in opts.
5. **`spec/services/account_list/notifications_sender_spec.rb`** (ADD): with
   `app: true`, drain to assert a `User::Device::PublishWorker` job is enqueued
   whose opts JSON includes `deep_link`; with `app: false`, no job. Existing
   app-gating specs (lines 218–237) must keep passing unchanged.
6. **Verify-unchanged set** (run, no edits expected):
   `spec/workers/user/device/publish_worker_spec.rb` (opts passthrough),
   `spec/models/user/notification_spec.rb` (mocks `user_notification_options`),
   `spec/controllers/api/v2/user/notifications/bulk_controller_spec.rb` (asserts
   `.to_json` of options — will transparently include `deep_link`),
   `spec/models/user/device_spec.rb`, devices controller/acceptance specs.

Suggested run:

```bash
cd /Users/danielbisgrove/Documents/Web_Dev/MPDX/mpdx_api
bundle exec rspec spec/services/user/device spec/services/web_router_spec.rb \
  spec/models/notification_type_spec.rb spec/workers/task/notification_worker_spec.rb \
  spec/services/account_list/notifications_sender_spec.rb \
  spec/workers/user/device/publish_worker_spec.rb spec/models/user/notification_spec.rb \
  spec/controllers/api/v2/user/notifications/bulk_controller_spec.rb
```

## 7. Files changed (summary)

| File | Change |
| --- | --- |
| `app/services/user/device/publish_service.rb` | `gcm_payload` → fcmV1Message; `apns_payload` → flattened custom keys + keep `link`; new `data_payload` |
| `app/services/web_router.rb` | add `contact_path`/`contacts_path`/`tasks_path`; `contact_url`/`tasks_url` delegate |
| `app/models/notification_type.rb` | `user_notification_options` adds `deep_link` |
| `app/workers/task/notification_worker.rb` | add `deep_link` to opts |
| specs per §6 | rewrite publish_service GCM context; update notification_type + task worker; add sender regression |
| — | No changes: ClientService, RegistrationService, PublishWorker, User::Device, devices controller, bulk controller |

## 8. Risks

- **Firebase project / sender-ID mismatch**: SNS credentials and the shell's
  `google-services.json` must come from the same Firebase project, or every send
  is `SENDER_ID_MISMATCH`. This is the most likely silent-failure mode.
- **APNs bundle ID**: if the new shell's bundle ID differs from the legacy app's,
  the existing APNs platform app will not deliver — needs new platform app + ARN
  change + redeploy.
- **Legacy iOS app**: flattening custom keys next to `aps` is additive and `link`
  is preserved, so the legacy app keeps working; dropping `link` later is a
  separate decision. Legacy Android is already dead (no compat concern).
- **Flat-opts invariant**: `transform_values(&:to_s)` corrupts nested hashes;
  all current callers pass flat scalars, and the publish_service spec encodes
  the invariant, but it is convention, not type-enforced.
- **Staging guard**: pushes silently drop for non-admins on staging — QA trap.
- **Env vars read at boot** (`RegistrationService::PLATFORMS.freeze`): ARN changes
  require redeploy, and a missing var crashes boot — coordinate deploy-config
  changes with the credential swap.

## 9. Open questions (Daniel)

1. SNS console: GCM platform app credential type today (API key vs Token), and is
   the original Firebase project recoverable?
2. New shell Android applicationId — reuse `org.mpdx` or new ID? (Drives Firebase
   app registration and assetlinks.)
3. APNs: cert or .p8 today; bundle ID + Team ID for the new shell?
4. Should pushes play a sound (`aps.sound` / `android.notification.sound` =
   `"default"`)? Currently silent banners; this design keeps that.
5. Is the legacy native iOS app formally retired (lets us drop the `link` key)?
6. Multi-notification and task deep-link target routes — confirm with deep-links
   agent (placeholders: contacts list, tasks list).
