# Connect Cru USA from Add Organization Implementation Plan

> **For agentic workers:** Builders follow the repo's `/implement` rules: write app
> code only. Do not write or edit any test, and nothing in `src/answer-key/MPDX-10396/`.
> Do not special-case inputs to make tests pass. The checker agent writes the unit tests.

**Goal:** Turn on the Connect button for Cru USA in `ConnectOrganization` and show the
right inline message for each answer the API gives.

**Architecture:** One component changes. `ConnectOrganization` learns whether the picked
org is Cru USA (`apiClass === 'Siebel'`), keeps a small piece of state for the last check
result, sends the existing `CreateOrganizationAccount` mutation with the two codes
suppressed from the global error toast, and renders the result inside the existing yellow
ministry panel.

**Tech Stack:** Next.js 15, React, MUI v7, Formik, Apollo Client 3, react-i18next.

**Spec:** `docs/superpowers/specs/2026-11-24-MPDX-10396-connect-cru-usa-design.md`

## Global Constraints

- User-visible text goes through `t()`. Exact copy (straight apostrophes):
  - Before pressing: `If you are already logged in with your ministry email, press Connect and we'll check your access.`
  - No access, three parts: `We checked and you don't have access to this organization yet.` then the link `Ask your donation services team for access.` then `Once they've given it, come back and press Connect again.` (one space between parts)
  - Check failed: `We couldn't finish checking your access because of a problem on our end. Please press Connect again later.`
- Do not touch `public/locales/`, `*.generated.ts`, `src/lib/apollo/` or any test file.
- `getOrganizationType` and `OrganizationTypesEnum` stay as they are: other screens use them.
- Named exports only.

## Review Focus

1. A NetSuite ministry org (`Remote::Import::OrganizationAccountService`) must keep the
   disabled "Add Account" button and today's text, 24-hour line included.
2. A message left over from an earlier press must not show after picking another org, or
   while a new press is running.
3. A network error (no GraphQL error at all) must show the check-failed message, never the
   no-access one.
4. The login, OAuth and offline paths must keep "Invalid username or password." on failure
   and their current labels.
5. A double click on Connect must not send two requests (Formik's `isSubmitting` already
   disables the button; keep it in the `disabled` expression).

The checker pins 2 (clearing the field), 3 and 5 in unit tests, as the answer-key commit
message lists.

---

### Task 1: Cru USA Connect flow in `ConnectOrganization`

**Files:**

- Modify: `src/components/Settings/integrations/Organization/ConnectOrganization.tsx`
- Test (exists, do not edit): `src/answer-key/MPDX-10396/ConnectCruUsa.test.tsx`

**Interfaces:**

- Consumes: `useCreateOrganizationAccountMutation` (existing), the `donationServicesEmailLink`
  memo (existing, reused as is), `SuppressErrorsContext` shape from
  `src/lib/apollo/suppressErrors.ts` (`{ suppressErrorCodes: string[] }`).
- Produces: nothing other files use. Keep any new constants module-local.

- [ ] **Step 1: Run the answer keys to see them fail**

Run: `yarn test src/answer-key/MPDX-10396`
Expected: 12 failed, 4 passed (no "Connect" button for Cru USA yet).

- [ ] **Step 2: Know which org is Cru USA**

In the component, derive `isCruUsa` from the selected organization:
`selectedOrganization?.apiClass === 'Siebel'` (the Formik value, or track it next to the
existing `organizationType` state in the autocomplete `onChange`). Add module-level
constants `NO_MINISTRY_ACCESS = 'NO_MINISTRY_ACCESS'` and
`ACCESS_CHECK_FAILED = 'ACCESS_CHECK_FAILED'`.

- [ ] **Step 3: Hold the check result**

`const [cruUsaCheck, setCruUsaCheck] = useState<'noAccess' | 'checkFailed' | null>(null);`
Set it to `null` in the autocomplete `onChange` (any pick or clear) and at the start of
every Cru USA submit.

- [ ] **Step 4: Submit for Cru USA**

In `onSubmit`, when the picked org is Cru USA, call `createOrganizationAccount` with the same
`variables`, `refetchQueries: ['GetUsersOrganizationsAccounts']` and `onCompleted` as today,
plus `context: { suppressErrorCodes: [NO_MINISTRY_ACCESS, ACCESS_CHECK_FAILED] }`, and an
`onError` that sets `'noAccess'` when
`error.graphQLErrors.some(({ extensions }) => extensions?.code === NO_MINISTRY_ACCESS)`, and
`'checkFailed'` for everything else (including network errors). It must not enqueue
"Invalid username or password." All other orgs keep today's `onError` exactly.

- [ ] **Step 5: Render the panel**

Inside the existing `organizationType === OrganizationTypesEnum.MINISTRY` `WarningBox`, keep
the heading, the line under it and the log-out step for every ministry org. Then:

- Not Cru USA: today's italic paragraph, unchanged.
- Cru USA, `cruUsaCheck === null`: the before-pressing line in the same italic style.
- Cru USA, `'noAccess'`: the no-access message, in an element with `role="alert"`, with
  the middle sentence as `<Link href={donationServicesEmailLink} target="_blank">`.
- Cru USA, `'checkFailed'`: the check-failed message in an element with `role="alert"`,
  with no link.

The result message takes the place of the before-pressing line.

- [ ] **Step 6: The button**

Label `t('Connect')` when the org type is OAuth or the org is Cru USA, otherwise
`t('Add Account')`. Disabled when `!isValid || isSubmitting || (ministry && !isCruUsa)`.

- [ ] **Step 7: Run the answer keys and the nearby tests**

Run: `yarn test src/answer-key/MPDX-10396 src/components/Settings/integrations/Organization src/components/Setup`
Expected: all answer keys pass. If an existing test fails, report it with its name and
error; do not edit it (the checker decides).

- [ ] **Step 8: Lint and typecheck**

Run: `yarn eslint src/components/Settings/integrations/Organization/ConnectOrganization.tsx && yarn prettier --check src/components/Settings/integrations/Organization/ConnectOrganization.tsx && yarn lint:ts`
Expected: no errors.

- [ ] **Step 9: Leave the change uncommitted**

The session commits. Report the diff summary and the test output.
