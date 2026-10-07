# UX & Accessibility — Focus Areas

MPDX is a Material UI v7 app whose users live in it for hours at a time, on desktop and on phones, in
a dozen locales. `eslint-plugin-jsx-a11y` runs on every PR (`plugin:jsx-a11y/recommended`) and
Lighthouse CI (`lighthouserc.js`) measures eleven real routes — six of them reports — seven times
each on a desktop preset. UX regressions here are measured, not just noticed.

**Trigger this review when the diff touches** `src/components/**/*.tsx`, `pages/**/*.page.tsx`,
`src/theme.ts`, Formik wiring (`<Formik>`, `useFormik`, `<Field>`, `ErrorMessage`), any
`Dynamic*.tsx`, or adds user-visible strings.

---

**Material UI v7 conventions**

- Style with the `sx` prop, or `styled()` from `@mui/material/styles` for reused patterns (see the
  `ModalTitle` / `CloseButton` pattern in `src/components/Shared/Modal/Modal.tsx`, which uses
  `shouldForwardProp` to keep custom props off the DOM).
- `makeStyles` from `tss-react/mui` survives in legacy components
  (`Dashboard/MonthlyGoal/MonthlyGoal.tsx`, `Dashboard/DonationHistories/DonationHistories.tsx`).
  Don't add new ones.
- Never `style={{ ... }}` — it bypasses the theme and breakpoints.
- Look for: MUI v5 Grid syntax. This repo is on the v7 API — `<Grid size={{ xs: 6, md: 3 }}>`, not
  `<Grid item xs={6} md={3}>`. `@mui/x-data-grid` is v8 and `@mui/x-date-pickers` is v7; check the
  right major's API before accepting a prop.

**Theme tokens, not literals**

- `src/theme.ts` defines `cruColors` (the Cru brand palette), `mpdxColors`, `statusColors`, and
  `chartColors`, surfaced as custom palette entries (`theme.palette.mpdxGrayDark.main`,
  `mpdxGrayMedium`, `mpdxGrayLight`, …). Spacing is `theme.spacing(n)`.
- Look for: raw hex (`'#FFCF07'`, `'#17AEBF'` appear in the legacy dashboard components), raw pixel
  values, and chart series colors invented inline instead of taken from `chartColors`.
- Look for: a new Recharts series whose color isn't in the theme, or a chart that runs out of colors —
  `DonationHistories.tsx` pops from a four-element `fills` array and falls back to `''` for a fifth
  currency.

**Responsive**

- `theme.breakpoints.down('sm')` / `up('sm')` inside `sx`, or the object shorthand
  (`my={{ xs: 1, sm: 2 }}`, `sx={{ display: { xs: 'block', md: 'flex' } }}`).
- `useMediaQuery(theme.breakpoints.down('sm'))` for structural mobile/desktop differences (see
  `MonthlyGoal.tsx`, which renders a separate mobile goal readout).
- Look for: a new table, report header, or dialog with no mobile treatment; fixed pixel widths;
  horizontal scroll introduced at `xs`.

**Loading, error, and empty states — every Apollo query needs all four branches**

`src/components/Reports/DesignationAccountsReport/DesignationAccountsReport.tsx` is the reference:

```
loading ? <CircularProgress data-testid="..." />
  : error ? <Notification type="error" message={error.toString()} />
  : data?.x.length === 0 ? <EmptyReport title={t('…')} subTitle={t('…')} />
  : <RealContent />
```

- Loading: MUI `Skeleton` (or `src/components/Shared/MultilineSkeleton.tsx`) for content-shaped
  placeholders; `CircularProgress` for whole panels. `MonthlyGoal.tsx` shows the pattern of
  skeletoning each value in place rather than blanking the card.
- Error: `src/components/Notification/Notification.tsx` with `type="error"`, or an MUI
  `<Alert severity="error">`. Never render empty content on error.
- Empty: `src/components/Reports/EmptyReport/EmptyReport.tsx` (and
  `src/components/Shared/EmptyDonationsTable`) — a zero-row report must say "no data", not render
  `$0.00`.
- **Beware the refetch flash.** `src/lib/apollo/client.ts` sets `fetchPolicy: 'cache-and-network'`
  and `notifyOnNetworkStatusChange: true` app-wide, so `loading` goes true again on every refetch. A
  bare `if (loading) return <Skeleton/>` blanks a populated screen. Use `previousData` or
  `networkStatus`.

**Forms**

- Formik + Yup. Fields wire `name`, `value`, `onChange`, `onBlur`, `error`, and `helperText` from
  Formik state — validation errors must be visible **next to the field**, never only in a toast or a
  summary.
- Use the shared validators in `src/lib/yupHelpers.ts` (`amount`, `percentage`, `integer`,
  `phoneNumber`, `dateTime`/`nullableDateTime`/`requiredDateTime`) so messages stay localized and
  consistent.
- Money and percent inputs take `CurrencyAdornment` / `PercentageAdornment` from
  `src/components/HrTools/Shared/Adornments.tsx`.
- Submit buttons are `disabled` while `isSubmitting`, so they can't double-fire.
- Autosaving forms wrap an existing primitive — `src/components/Shared/Autosave/useAutosave` (or
  `useAutosaveCheckbox`), or the HrTools-local `useCustomAutosave`. Don't write a new `Autosave*`
  field, and don't autosave a record that belongs to someone else (`MpdSupervisorReport`'s
  `GeographicLocationSelect` uses an explicit Save for exactly that reason).

**Notifications — the rule that gets broken most**

- `src/lib/apollo/client.ts` already calls `snackNotifications.error(graphQLError.message)` (and
  `networkError.message`) for **every** GraphQL and network error, app-wide.
- **Do not add a manual `enqueueSnackbar` / `snackNotifications.error` in a mutation's
  `onError`/`catch` for a generic failure** — it double-toasts. Only add one for a domain-specific
  message the generic path cannot convey (e.g. a blob download that never goes through Apollo).
- To render an error inline instead of toasting it, pass `context: { suppressErrors: true }` on the
  operation — see `src/components/HrTools/NsGoalCalculator/GoalSettings/useMpdGoalPreview.ts`.
- **Prefer no success snackbar.** "Saved!" after every save is noise; let the updated UI communicate
  success.
- All notifications go through `src/components/Snackbar/Snackbar.tsx`
  (`snackNotifications.{toast,success,warning,info,error}`) — never `alert()` or ad-hoc inline text.

**Code-split every non-trivial modal — the `Dynamic<Name>` pattern**

There are ~76 `Dynamic*.tsx` files; the canonical one is
`src/components/EditDonationModal/DynamicEditDonationModal.tsx`:

```tsx
export const preloadEditDonationModal = () =>
  import(
    /* webpackChunkName: "EditDonationModal" */ './EditDonationModal'
  ).then(({ EditDonationModal }) => EditDonationModal);

export const DynamicEditDonationModal = dynamic(preloadEditDonationModal, {
  loading: DynamicModalPlaceholder,
});
```

Four things must all be true:

1. A sibling `Dynamic<Name>.tsx` exports **both** `preload<Name>` and the `dynamic(...)` component,
   with `loading: DynamicModalPlaceholder` from
   `src/components/DynamicPlaceholders/DynamicModalPlaceholder`.
2. The `webpackChunkName` magic comment is present — `import/dynamic-import-chunkname` is an ESLint
   **error**, so this isn't optional.
3. The trigger preloads on hover: `onMouseEnter={preload<Name>}` (see
   `src/components/Reports/EmptyReport/EmptyReport.tsx`).
4. It is mounted **only while open**: `{isOpen && <Dynamic<Name> … />}`. A statically rendered
   `dynamic()` component fetches its chunk on first paint, which defeats the split entirely.

Look for: a static `import { SomeModal } from './SomeModal'` for a large, rarely opened modal; a
`Dynamic*` component rendered unconditionally with `open={isOpen}`; a trigger with no `onMouseEnter`
preload. Tests for these must use `findBy*` after the opening interaction (see rules/testing.md).

**Dialogs**

- Use `src/components/Shared/Modal/Modal.tsx` rather than a raw `<Dialog>`: it renders the styled
  title, centers it above `sm`, and provides a close `IconButton` with `aria-label={t('Close')}`.
- Dialogs need a clear primary/secondary action pair, a primary action disabled while submitting, and
  a close on success.
- Ensure the dialog has an accessible name — wire `aria-labelledby` to the title element for any new
  dialog that doesn't go through the shared `Modal`.

**Accessibility**

`plugin:jsx-a11y/recommended` is on, with `jsx-a11y/no-autofocus` disabled repo-wide and
`anchor-is-valid` / `click-events-have-key-events` / `no-static-element-interactions` disabled **only
in test files**. Everything else is enforced — and lint doesn't catch semantics, so check:

- Every interactive element has an accessible name (visible text, `aria-label`, or `aria-labelledby`).
- **Icon-only `IconButton`s must have `aria-label`** — MUI adds nothing automatically. And the label
  must be localized: `aria-label={t('Close')}`, never a bare English literal.
- Form fields have associated labels — MUI `TextField label=…`, or an explicit `<InputLabel htmlFor>`.
  A placeholder is not a label.
- `<Dialog>` is labelled by its title.
- **Color is never the only indicator of state.** `MonthlyGoal.tsx` pairs each colored swatch with a
  text label (`Goal`, `Gifts Started`, `Commitments`) — follow that. Chart legends, status chips, and
  validation states all need text or an icon too.
- Keyboard: logical tab order, Enter/Space activation, Escape closes modals, focus doesn't get
  trapped or lost when a dynamic modal resolves.
- Prefer role + accessible name over `data-testid` for new components; testids are everywhere in
  legacy code but they are a testing crutch, not an affordance.

**Localization in the UI**

Every user-visible string goes through `t()`, including `aria-label`s, table headers, chart axis
labels, snackbar text, and empty-state copy. Four rules are enforced by `no-restricted-syntax` in
`.eslintrc.js` and will fail `yarn lint:ci` (see rules/standards.md for the exact wording): keys must
be statically resolvable, no nested `t()`, `<Trans>` needs `t={t}`, and `<Trans>` must not take
`i18nKey`. `yarn extract` runs on every PR.

Also: dates, numbers, currencies, and percentages format through `src/lib/intlFormat.ts` with the
locale from `useLocale()` — never a hardcoded `'en-US'` (see rules/financial.md).

**Performance shape that Lighthouse will notice**

`lighthouserc.js` collects `/accountLists`, the dashboard, contacts (list and detail), tasks, and six
report routes (`donations`, `partnerCurrency`, `salaryCurrency`, `designationAccounts`,
`partnerGivingAnalysis`, `coaching`), seven runs each.

- Look for: new heavy imports pulled into the initial bundle of those routes (Recharts, the data
  grid, a big modal) instead of being code-split.
- Look for: query waterfalls — a second query fired from a `useEffect` that depends on the first
  query's result. Collapse into one operation or run in parallel with `skip`.
- Look for: a long list rendered without `react-virtuoso` where the repo already virtualizes.

---

## Mined from merged PR history

Rules derived from 50 merged PRs (#2002–#2056). Each carries the PRs it came from.

- **A failed query must not render as an affirmative empty state.** Flag any `use*Query` destructure
  that takes `data` / `loading` but not `error` in a component that renders an empty state, a zero
  count, or a heading asserting a data window — "No staff members found" and "Showing 0 of 0" are
  claims about the world, and the global Apollo toast is transient while the page body contradicts
  it. Render an `<Alert severity="error">` in place of the list or table, with a retry affordance.
  A hook that destructures only `data` returns its loading sentinel forever on error, so downstream
  "no options" treatments never engage: surface `error` distinctly from `loading`. This includes
  mid-drain `fetchMore` rejections, which silently truncate a list presented as complete, and
  `.catch(() => undefined)` / a bare `.finally` swallowing a rejected mutation. A button whose
  confirm dialog interpolates a count must be disabled when that count is zero —
  `disabled={loading || !!error}` does not cover it, which is exactly when both are falsy.
  <!-- evidence: PR #2003, #2004, #2008, #2014, #2022, #2023, #2024, #2033 -->
- A nullable or route-dependent value must get an explicit null branch — hide the row, or render an
  en dash at the render site (matching the MPD Goal column and the Scenario Goals table) — not an
  empty disabled input or a visually blank table cell, which reads as a render bug. Put the fallback
  in the cell, not in the row mapper: row types like `StaffGoalRow` are data types. Check every
  route that renders the component, not just the one the PR targets.
  <!-- evidence: PR #2017, #2023, #2054 -->
- **Copy must not assert more than the data supports.** Check banner, tooltip, and helper text
  against what the backing field actually records: "All complete goals were run and sent" over a
  `goalsSentAt` holding only the most recent (often partial) batch, and a "requirements are missing"
  tooltip shown on already-Sent rows, are both falsehoods. New helper text must also be reconciled
  with what is already on the same card — do not restate the intro paragraph, do not name a
  different role than the surrounding copy ("MPD coach" where the card says "MPD coordinator"), and
  match the neighbors' punctuation. Wording lifted verbatim from a Jira ticket is the usual source;
  treat a spec that says something untrue as a defect to raise, not a requirement to ship.
  <!-- evidence: PR #2014, #2016, #2041, #2042 -->
- **Accessibility.** Flag labels attached to elements that cannot expose them: `aria-label` on a MUI
  `Chip` with no `onClick` / `onDelete` (it renders a roleless `<div>`, the label is
  name-from-author-prohibited, and a `getByLabelText` test still passes), `role="button"` +
  `tabIndex={0}` with no `onKeyDown`, and a select label that never reaches the select slot. Prefer
  `ButtonBase` / `component=` for activatable rows and `visuallyHidden` text for status that is
  otherwise colour-only; add `role="status"` to an empty state so it is announced when the spinner
  unmounts. Any change to the colour of body text must state its measured contrast ratio against its
  background and clear 4.5:1 — chip and chart-fill hues (`chipGreenDark`, `chipRedDark`) and MUI
  defaults (`warning.dark`, which `src/theme.ts` never defines) fail as text. Use `.dark` variants or
  the repo's own `statusWarning` token for text and reserve chip hues for non-text fills.
  <!-- evidence: PR #2016, #2020, #2024, #2030 -->
- Any `save(...)` or mutation chain in a component needs a `.catch` that calls
  `enqueueSnackbar(getErrorMessage(err), { variant: 'error' })` (notistack + `src/lib/error`). A
  `.then(...).finally(...)` with no catch produces an unhandled rejection, silently re-enables the
  button, and drives users to click the failing action repeatedly — this was caught by a Datadog
  frustration-rate monitor, not by review.
  <!-- evidence: PR #2046 -->
- **AI failure mode — fabricated justification for a bespoke component.** When a PR body or comment
  defends a custom styled component with a specific measured claim ("MUI `disabled` renders at 2.4:1
  contrast"), treat the number as unverified and check whether the stock MUI prop does the job. That
  reasoning produced a `ReadOnlyField` / `GreyedTextField` wrapper; the reviewer asked "was there a
  reason you couldn't use the disabled prop?", the author called the justification "nonsense", and
  the whole thing collapsed to `disabled` on the `TextField`. Also flag a derived-default effect
  that overwrites what the user typed, and a wrapper pattern (Tooltip/span/tabIndex/eslint-disable
  around a disabled button) copy-pasted into a second or third file instead of extracted.
  <!-- evidence: PR #2039 -->
