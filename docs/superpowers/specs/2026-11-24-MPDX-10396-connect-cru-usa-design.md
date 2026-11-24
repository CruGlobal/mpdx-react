# Connect Cru USA from Add Organization

Date: 2026-11-24
Ticket: [MPDX-10396](https://jira.cru.org/browse/MPDX-10396)
Branch: `MPDX-10396-connect-cru-usa`
Depends on: CruGlobal/mpdx_api#3829 (in production since 2026-11-23)

## Why

Today a user who was just given US access must sign out and back in before MPDX
connects Cru USA. The Add Organization screen keeps the button turned off for
Cru USA and only tells them to email Donation Services and wait 24 hours. Many of
those emails go to Global Finance and then to us.

The API now handles `createOrganizationAccount` for Cru USA. It runs the same
access check that sign-in runs, for the user's own logins, and answers one of:

| API answer                                         | Meaning                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| Success, with the organization account             | Connected (or was already connected)                                 |
| Error with `extensions.code` `NO_MINISTRY_ACCESS`  | The check ran and found no Cru USA access                            |
| Error with `extensions.code` `ACCESS_CHECK_FAILED` | The check could not run (WSAPI error or its circuit breaker is open) |

This change turns on the button for Cru USA and shows the right message for each answer.

## In scope

- `ConnectOrganization` (used by Settings > Connect Services > Organization > Add Account,
  and by the Setup flow's Connect step).
- Cru USA is the organization whose `apiClass` is `Siebel`. The API's organization
  type has no `code` field, so `apiClass` is the only thing React can go on. The API
  code and the help doc both speak of "the Siebel org" (code `CCC-USA`) as the only one.
- The copy below.

## Out of scope

- NetSuite ministry orgs (`apiClass` `Remote::Import::OrganizationAccountService`). They
  keep today's behavior: button off, today's text, including the 24-hour line.
- Any API change.
- Whether Connect should follow the new-staff rule in CruGlobal/mpdx_api#3821 (Jeff Clay's
  sign-in change for new staff with no Siebel profile). That is an open product question
  for Justin and Jeff. This change builds against the API as it is on master today: the
  API decides who gets `NO_MINISTRY_ACCESS`, so if that rule lands on the API, React needs
  no change.
- The help doc (`docs/helpscout/common-problems.md`) lives in mpdx_api and gets its own PR.

## Copy

Scott Paros approved the no-access message on 2026-11-19 ("Wording sounds good, and keep
the email link to DSG"). The other two lines are new and need the developer's review.

| When                                                                                                                                                                                                                                                   | Text                                                                                                                                                                                                                                        | Status                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Cru USA picked, before pressing Connect (replaces today's italic "If you are already logged in using your ministry account, you'll need to contact your donation services team to request access. Once this is done you'll need to wait 24 hours ...") | "If you are already logged in with your ministry email, press Connect and we'll check your access."                                                                                                                                         | New, for review                                  |
| `NO_MINISTRY_ACCESS`                                                                                                                                                                                                                                   | "We checked and you don't have access to this organization yet. **Ask your donation services team for access.** Once they've given it, come back and press Connect again." The bold sentence is the existing Donation Services mailto link. | Approved by Scott                                |
| `ACCESS_CHECK_FAILED`, or any other failure                                                                                                                                                                                                            | "We couldn't finish checking your access because of a problem on our end. Please press Connect again later."                                                                                                                                | New, for review. Must never read as "no access". |

The heading ("You must log into MPDX with your ministry email"), the line under it and the
"Click here to log out" step stay as they are for Cru USA: the check only looks at the
logins the user has signed in with, so the advice still holds.

## Acceptance criteria

1. When the user picks Cru USA, the panel shows the heading, the log-out step and the new
   "If you are already logged in with your ministry email, press Connect ..." line. It
   does not show "wait 24 hours" or the old "you'll need to contact your donation services
   team" line.
2. With Cru USA picked, the submit button reads "Connect" and is enabled.
3. Pressing Connect sends `CreateOrganizationAccount` once, with the Cru USA organization id
   and no username or password. While it runs the button is disabled, so a second press
   sends nothing.
4. When the API returns success, the user sees "MPDX added your organization account",
   the organization list reloads, and the form closes (the same `onDone` as other orgs).
5. When the API returns `NO_MINISTRY_ACCESS`, the panel shows the approved no-access
   message. "Ask your donation services team for access." is a link to the same
   Donation Services mailto as today (subject "Request access to ministry organization",
   body naming the organization). The button stays enabled so the user can press Connect
   again.
6. When the API returns `ACCESS_CHECK_FAILED`, the panel shows the check-failed message. It
   does not show the no-access message or the Donation Services link. The button stays
   enabled.
7. When the request fails any other way (another GraphQL error, a network error), the panel
   shows the check-failed message, as in 6.
8. For a Cru USA failure the user never sees "Invalid username or password.", and the
   global error toast does not show the API's raw text for `NO_MINISTRY_ACCESS` or
   `ACCESS_CHECK_FAILED` (the component shows its own message instead).
9. The no-access and check-failed messages are announced to screen readers when they
   appear (rendered in an element with `role="alert"`).
10. Picking a different organization, or clearing the field, removes any no-access or
    check-failed message.
11. A NetSuite ministry org (`Remote::Import::OrganizationAccountService`) behaves as today:
    button disabled and labeled "Add Account", today's text including the 24-hour line.
12. Login, OAuth and offline orgs behave as today.
13. 1 to 12 hold in both places `ConnectOrganization` is used: the Add Account modal in
    Settings and the Setup flow's Connect step.

Risky: no

## Questions for the BA

None.
