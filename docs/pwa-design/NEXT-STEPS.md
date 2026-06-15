# PWA Phases 3+4 — Next Steps (Handoff)

_Last updated: 2026-06-15. Written so a fresh session or a new developer can
resume cold. Read this first, then `phase3-4-master-plan.md` for detail._

## TL;DR

Phases 3 (native push) and 4 (Capacitor shell) are **code-complete and
reviewed**. All tests pass. Nothing else can ship until **Daniel** provides
accounts/credentials and runs three on-device auth gates. The remaining code
(production native auth, CI signing, store submission) is deliberately blocked
on those gates because its assumptions can't be validated without a device.

**Stage/prod hosts (confirmed 2026-06-15):** stage is `https://stage.mpdx.org`,
production is `https://mpdx.org`. These are now baked into `capacitor.config.ts`,
`WKAppBoundDomains`, and the associated-domains entitlement. Before Gate 1, just
sanity-check that `https://stage.mpdx.org` serves the Next.js stage app and you
can log in.

## Where everything lives

| Thing | Location |
| --- | --- |
| Frontend branch | `pwa-phase3-4-push-shell` (26 commits ahead of `mpdx-pwa`) |
| Frontend worktree | `MPDX/worktrees/mpdx-react-pwa` |
| Backend branch | `pwa-push-fcm-v1` (8 commits ahead of `origin/master`) |
| Backend worktree | `MPDX/worktrees/mpdx_api-pwa` |
| Design docs | `docs/pwa-design/` (this folder) |
| Ordered task list | `docs/pwa-design/phase3-4-master-plan.md` (T1–T32) |
| Auth gate runbook | `docs/pwa-design/t1-gate-runbook.md` |
| Backend/ops runbook | `docs/pwa-design/fcm-v1-backend.md` §5 |
| Deferred review items | `docs/pwa-design/review-follow-ups.md` |

**Neither branch is pushed.** No PRs are open. Main checkouts are on their own
branches (mpdx-react on `mpdx-pwa`, mpdx_api on `add-new-tables-updates`); the
PWA branches are checked out in the worktrees above. Git won't let you check
out `pwa-phase3-4-push-shell` or `pwa-push-fcm-v1` in the main repos while the
worktrees hold them — that's expected.

## What's done (don't redo this)

- **Backend FCM v1**: `publish_service.rb` emits the SNS `fcmV1Message`
  envelope; APNs custom keys flattened; `DeepLinkBuilder` maps all 22
  notification types to web paths; `app`-channel gating regression-tested;
  raw-token logging removed. The **code** is done — the SNS platform-app
  **credential swap** is an ops step (below).
- **Frontend push**: `@capacitor/push-notifications` registration via a new
  `UserDevices` REST-proxy schema; settings card is the only permission prompt
  site; `NativeDeepLinkProvider` routes notification taps; token rotation +
  session-scoped registration; unregister wired into `logoutCleanup()`.
- **Capacitor shell**: in-repo, `server.url` mode, Capacitor 7. Deep links
  (AASA + assetlinks), camera contact-photo, native polish (splash, status
  bar, safe areas, haptics), shell-version handshake + upgrade screen.
- **Review**: 7-dimension adversarial review found 23 confirmed issues; all
  fixed (incl. a critical cross-module `removeAllListeners()` bug that killed
  notification-tap routing). Full sweep green.

## The critical path to shipping (all blocked on Daniel, in order)

Do these top to bottom — each unblocks the next.

1. **Create the stage Doorkeeper/Okta public PKCE client** for the auth gate
   (runbook §2.2). _(Stage host already confirmed as `stage.mpdx.org` and baked
   into the config — just sanity-check it loads.)_
2. **Run the three auth go/no-go gates on a device** — `t1-gate-runbook.md`:
   - Gate 1: bridge injection on the remote origin (SW registers, IndexedDB
     readable). _Only Gate 1 failure invalidates the architecture._
   - Gate 2: system-browser PKCE round-trip lands a working session cookie.
   - Gate 3: cookie survives kill / relaunch / reboot + 48h soak.
     _Gate 3 failure activates Plan B (Keychain refresh token)._
3. **AWS SNS / Firebase / APNs credentials** — `fcm-v1-backend.md` §5: confirm
   the GCM platform-app credential type, upload the FCM v1 service-account JSON,
   confirm the APNs `.p8` + bundle ID, update the `SNS_*_APPLICATION_ARN` deploy
   config. **Trap:** the Firebase project for `google-services.json` must be the
   _same_ project as the SNS credentials (SENDER_ID_MISMATCH otherwise).
4. **Register the Okta native PKCE client** and append its client ID to
   `OKTA_AUTH_CLIENT_IDS` in the mpdx_api deploy config (or sign-in rejects with
   "Invalid access_token cid").
5. **Identity decisions** (drive everything else):
   - Android: reuse `org.mpdx` Play listing + signing key? (recommended — keeps
     `assetlinks.json` fingerprint valid)
   - Apple: is team `DQ48D9BF2V` still Cru's, and reuse bundle `org.cru.mpdx`?
     (fills the AASA, entitlements, APNs registration)

## Remaining code tasks (start AFTER the gates pass)

These were deliberately left unimplemented because they depend on gate
outcomes. Designs are locked; pick them up in a new session.

- **T20 / T21 — Production native auth.** System-browser PKCE → NextAuth
  `CredentialsProvider` (`native-okta`) + a secretless token-exchange proxy +
  App Link / iOS scheme callback. Full design in `capacitor-shell.md` §4 and
  `phase3-4-master-plan.md` (T20, T21). _Critical-file change — run a security
  review._
- **T29 — Fastlane CI build + signing** (needs Apple/Google accounts).
- **T30 — End-to-end push QA on devices** (needs step 4 done). Checklist in
  `fcm-v1-backend.md` §5.4.
- **T32 — Store submission** — listings, privacy labels / Play Data Safety,
  Apple 4.2 receipts. Checklist in `capacitor-shell.md` §11.
- **T31 — Offline viewer (shell v1.1)** — optional, parallel with store prep,
  not blocking submission.

See `review-follow-ups.md` for 11 deferred (suggestion-tier) cleanups and the
3 refuted findings (so they aren't re-litigated).

## How to resume in a fresh session

1. Start in the worktree: `cd MPDX/worktrees/mpdx-react-pwa`.
2. Read this file, then `phase3-4-master-plan.md`.
3. The auto-memory note `project_pwa_phase3_4.md` has the running status and the
   workflow run IDs.
4. To run the work via multi-agent orchestration again, use the **ultracode**
   keyword (Daniel approved it for this initiative).
5. Verify before claiming anything: frontend `yarn && yarn gql && yarn lint:ts
   && yarn test`; backend `bundle exec rspec` in `MPDX/worktrees/mpdx_api-pwa`.

## When ready to integrate

- Push both branches and open PRs (not yet done). Backend PR targets
  `master`; frontend PR targets `mpdx-pwa`.
- Frontend PR is large (26 commits) and touches critical files
  (`_app.page.tsx`, `next.config.ts`, Apollo client, auth) — expect a high
  risk score from `/quality:agent-review`; that review already ran once
  pre-PR and its findings are fixed.
- **Do not commit a real `google-services.json`** — the one in the repo is a
  marked placeholder; the real file carries Firebase config and should be
  injected at build time (ops).
