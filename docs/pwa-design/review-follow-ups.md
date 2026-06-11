# Review Follow-ups — Phase 3+4 Multi-Agent Code Review

Status: TRACKING — 2026-06-11. Companion to `phase3-4-master-plan.md`.
Scope: suggestion-severity findings from the multi-agent review of the
`pwa-phase3-4-push-shell` branch that were deliberately deferred (not fixed in
the review-fix round), plus findings that were re-reviewed and refuted, plus
the manual QA still owed. Critical/major findings were fixed on-branch in the
review-fix commits and are not listed here.

---

## 1. Deferred suggestions (11)

Each entry: file pointer → one-line disposition. Two were pulled forward and
**already applied in the review-fix round** (marked APPLIED).

1. **destroyUserDevice interpolates client-supplied id into the REST path
   without encoding** — `pages/api/graphql-rest.page.ts:658`.
   APPLIED: id is now `encodeURIComponent`-wrapped (defense-in-depth; no
   privilege escalation existed).
2. **Push-payload deepLink accepts any same-origin path** —
   `src/lib/nativeShell/deepLink.ts:26-42`. Recommend: tighten
   `routeFromPushData` to the `/accountLists` prefix the AASA/intent-filter
   and backend `DeepLinkBuilder` already enforce; small follow-up before GA.
3. **PublishService RESERVED_KEYS only strips symbol keys; string
   'aps'/'link' leak** — `app/services/user/device/publish_service.rb`
   (mpdx_api). Refuted on re-review — see §2; no action.
4. **UserDevices datahandler silently ignores the serializer's `user`
   relationship without documenting it** —
   `pages/api/Schema/UserDevices/datahandler.ts:6-18`. Recommend: extend the
   inline comment to name the dropped `relationships.user` member; fold into
   the next proxy touch.
5. **Deep-link listeners only mount in the authenticated tree; warm-start
   taps on /login are dropped** — `pages/_app.page.tsx:91`. Recommend:
   accept as designed (matches deep-links.md §4.3; cold-start taps replay via
   Capacitor's queue), correct NativeDeepLinkProvider's overstated doc
   comment, and verify the logged-out warm-start case during T30 device QA.
6. **DeepLinkBuilder inlines dashboard/merge-tool path strings instead of
   WebRouter helpers** — `app/services/user/device/deep_link_builder.rb:39`
   (mpdx_api). Recommend: add `dashboard_path` / `merge_contacts_path`
   helpers to WebRouter next time DeepLinkBuilder is touched; strings are
   verified correct today.
7. **capacitorMocks platform state leaks between tests with no automatic
   reset** — `__tests__/util/capacitorMocks.ts:28`. Recommend: have the mock
   module register its own `afterEach` reset (platform → 'web', re-pin
   default `checkPermissions` resolution) so order-dependent passes are
   impossible.
8. **Haptics tests use untyped `as jest.Mock` casts** —
   `src/components/Shared/Modal/DeleteConfirmation/DeleteConfirmation.test.tsx:16`
   (and `TaskModalCompleteForm.test.tsx`). Recommend: migrate to
   `jest.mocked(useHaptics)` to match the branch's newer tests; do alongside
   the next edit to either file.
9. **DeleteConfirmation confirm button not disabled while the delete
   mutation is in flight** —
   `src/components/Shared/Modal/DeleteConfirmation/DeleteConfirmation.tsx:110-112`.
   APPLIED: the Yes button now disables on `deletingTask`/`deleting`.
10. **PublishService data_payload excludes reserved keys by symbol only,
    while deep_link handles both key types** —
    `app/services/user/device/publish_service.rb:3-10` (mpdx_api). Duplicate
    of #3; refuted on re-review — see §2; no action.
11. **DeepLinkBuilder inlines paths against the single-source-of-paths
    goal** — `app/services/user/device/deep_link_builder.rb:39-40`
    (mpdx_api). Duplicate of #6; same disposition.

---

## 2. Reviewed and refuted — do not re-litigate

These were raised during review, adversarially re-checked against the mpdx_api
code, and refuted. Listed so future review passes don't re-open them.

- **String-keyed reserved-key bypass in PublishService** (raised twice,
  suggestions #3/#10): refuted — `PublishWorker` symbolizes the opts keys
  upstream before invoking `PublishService`, so string-keyed `'aps'`/`'link'`
  can never reach `data_payload`; the symbol-only `RESERVED_KEYS.except` is
  sufficient for every reachable call path.
- **PublishWorker Hash-passthrough**: refuted — the worker's options hash is
  normalized before publish; no caller-controlled hash passes through to the
  SNS payload unsanitized.

---

## 3. Remaining manual QA

Automated coverage ends at the unit/component boundary; the following must be
run on simulators/devices before the T-gates close:

- **`t1-gate-runbook.md`** — Gates 1–3 for the Capacitor shell prototype,
  plus §7.2's device QA checklist for the T27 polish items (status bar,
  splash, reload gesture).
- **`push-registration-frontend.md` §6.3** — manual push QA (needs Phase 4
  shell + Firebase/APNs credentials + backend FCM v1). Remember the staging
  trap: pushes silently drop for non-admin users on staging
  (`fcm-v1-backend.md` §"Staging guard"), so QA accounts must be admins.
- **`camera-contact-photo.md` §"Manual device QA checklist"** — iOS + Android
  camera/library permission flows and real-photo upload paths.
- **`capacitor-shell.md` §10 checklist** — airplane-mode QA (in-session
  offline, errorPath) and the cold-start precondition stack (§5.2, §7).
- **`phase3-4-master-plan.md` T30** — end-to-end push QA on devices,
  including deep-link taps warm/cold and (per §1 item 5 above) the
  logged-out warm-start tap case.
