# HrTools

Staff-facing HR/finance tools: goal calculators, salary and housing-allowance
requests, savings-fund transfers, questionnaires, and admin/supervisor reports.
This file captures the cross-tool "why" — rules and seams you can't see from any
single form's code. It loads whenever you touch anything under `HrTools/`.

Follow the root `CLAUDE.md` and `.CLAUDE/rules/code-review.md` for the usual
conventions (named exports, i18n, Formik/Yup, `GqlMockedProvider`, Luxon dates).
The financial-reporting review agent triggers on this tree — money math here is
load-bearing.

## How the tools are reached

There is **no** shared HrTools layout, index, or barrel component. Each tool is
exposed only through its own `pages/accountLists/[accountListId]/hrTools/<slug>`
entry, and the nav group `'hr-tools-page'` in `src/hooks/useNavPages.tsx`
(visibility-gated on `canSeeHrTools`, among other `hideTab` conditions).
Cross-tool cohesion comes only from that nav group plus the shared wizard
framework below.

**URL slugs and native GraphQL names differ from component names** — resolve the
real name before grepping:

| Component                | URL slug             | Native GraphQL root field          |
| ------------------------ | -------------------- | ---------------------------------- |
| MinisterHousingAllowance | `mhaCalculator/`     | `ministryHousingAllowanceRequest*` |
| PdsGoalCalculator        | `pdsGoalCalculator/` | `designationSupport*`              |
| SalaryCalculator         | `salaryCalculator/`  | `salaryRequest*`                   |
| MinistryPartnerReminders | `partnerReminders/`  | `ministryPartnerReminders`         |

`StaffSavingFund/` is not a data tool — it's a context/layout shell whose pages
render **SavingsFundTransfer** components. Don't add transfer logic to it.

## GraphQL routing

Every HrTools operation routes to the **primary/native API** — all their root
fields are in `src/graphql/rootFields.generated.ts`, and no HrTools `.graphql`
uses `@rest` or `@client`. None of this tree goes through the REST proxy. When
in doubt, resolve the actual root field (see the table — names differ) before
checking `rootFields.generated.ts`.

## Reuse the shared wizard framework — don't reinvent it

`Shared/CalculationReports/` is a full multi-step "submit a request" framework:
`PanelLayout` (stepper shell) + `StepsList` + `DirectionButtons` + `FormCard` +
`SubmitModal`/`Receipt`/`StatusCard` + `useCustomAutosave`. The request forms
(**AdditionalSalaryRequest, MinisterHousingAllowance, SalaryCalculator**) build on
it, and its `PanelLayout` stepper shell is also what the three goal calculators
and NsoMpdQuestionnaire wrap for their own step navigation. Any new step-based
form should reach here before writing a new stepper.

Other shared pieces worth knowing before you build a local copy:

- `Shared/Adornments.tsx` — `CurrencyAdornment` / `PercentageAdornment`. Use on
  every money/percent input (widest reuse in the tree).
- `Shared/HcmData/Hcm.graphql` — the shared `hcm(effectiveDate:)` query for
  staff/HR data. `StaffInfoCard`, `AccountInfoBox`, `EligibilityStatusTable`,
  `GoalPresentation/`, `SummaryHeaderCard`, and `useFormatters` are the other
  shared leaves. Prefer them over one-off equivalents.

## The three goal calculators are independent — and their math can drift

`GoalCalculator`, `PdsGoalCalculator`, and `NsGoalCalculator` are **three parallel
products**, not a base + variants. Each has its own step enum, Context, layout,
and route. Their arithmetic lives in three different places with three different
strategies:

- **GoalCalculator (MPD worksheet)** — client-side math in
  `GoalCalculator/Shared/calculateTotals.ts`.
- **PdsGoalCalculator (Designation Support)** — client-side math in
  `PdsGoalCalculator/calculations/`.
- **NsGoalCalculator (New Staff)** — **no goal-formula math on the client.** It
  reads a server-computed worksheet and recalculates unsaved edits via a server
  round-trip (`previewNewStaffGoalCalculation`); only display-level arithmetic
  (rounding, remaining-need) lives here. Don't add goal math to this tree.

⚠️ **Drift risk:** the same goal-total concepts (admin/assessment gross-up,
attrition) are computed independently in generic (`calculateTotals.ts`), PDS
(`calculations/`), and again on the server for NS — with different step ordering.
Changing the math in one place does **not** update the others. Treat these three
as a set: when you touch goal arithmetic, check whether the other copies need the
same change. Constants are year-versioned (`calculationsYear`).

Non-obvious per-calculator rules:

- **PDS reimbursable expenses** are clamped to a minimum; `formType === Simple`
  zeroes reimbursable + 403(b); 403(b) % comes from HCM, not the form.
- **Generic budget fallback:** with no direct input, the monthly budget is
  derived from net pay — that derivation is a load-bearing assumption, not raw
  user entry.
- **Rounding is at submission only** — floats through the calc, rounded at the
  write boundary, currency hardcoded `'USD'`.
- NS has a real-goal vs admin "scenario-goal" split behind one hook (keyed by
  `accountListId` vs `scenarioGoalId`); only scenario goals may edit identity
  fields.

## How forms persist

Three patterns — know which one a form uses before adding a field:

- **Field-level autosave** (most forms) — each field saves on change/blur.
  **Wrap an existing autosave primitive rather than writing your own** `Autosave*`
  fields. Two base hooks cover this:
  - repo-wide `src/components/Shared/Autosave/useAutosave` (currently
    GoalCalculator, PdsGoalCalculator, SalaryCalculator, NsoMpdQuestionnaire; a
    `useAutosaveCheckbox` sibling variant exists for checkbox fields)
  - HrTools-local `Shared/CalculationReports/CustomAutosave/useCustomAutosave`
    (currently AdditionalSalaryRequest, MinisterHousingAllowance)
- **Single submit through a mapping** — NsGoalCalculator collects a Formik form
  and writes once via `goalSettingsApiMapping.ts`, the one place UI-only fields
  are dropped. Adding a field here means updating that mapping, not just the form.
- **Explicit modal CRUD** — SavingsFundTransfer persists through its transfer
  modals + mutations, not autosave.

The mock tools below persist nothing. Note the finalize step is separate from
persistence: NSO autosaves each field but has a distinct `Complete` mutation, and
the request forms autosave a draft but `Submit` through the wizard's `SubmitModal`.

## Per-form domain gotchas

- **MinisterHousingAllowance** — the online flow gates on **MHA eligibility only**
  (`hcmData.mhaEit.mhaEligibility`). Italian/MHI staff fall out because their
  `mhaEligibility` is false — not via a country check; `staffInfo.country` only
  drives an informational note pointing them to the **paper MHI form**. There is
  no online MHI path. A new request is blocked while the current one is
  unresolved, and separately hidden when a board-approved request is still
  processing. The request list is assumed newest-first; married state is derived
  from the HCM query returning a second record (the spouse).
- **NsoMpdQuestionnaire** — **no create/upsert exists.** The record is created by
  the OneApp import; the frontend only Updates/Completes, keyed by
  `accountListId` (not a questionnaire id). A null query → render
  `NoOpenQuestionnaire`, not a blank form (so no first-save cache write to worry
  about). `0` and `false` are valid answers (only null/undefined/'' count as
  empty). Required fields are variant-driven (`Sosa`, `SpouseSeniorStaff`); the
  ministry dropdown is a separate OneApp source with brittle string-matched
  labels.

## Mock / prototype tools — not wired to a backend

These are prototypes — they currently render from `mockData.ts`, have **no
`.graphql`**, and hit neither API (that will change once they're wired). Don't
mistake them for read paths or wire tests against a real operation:

- **MpdGoalAdmin** — `MpdGoalAdmin/mockData.ts` (modals exist, no mutations).
- **MpdSupervisorReport** — `MpdSupervisorReport/mockData.ts` + `useMockInfiniteStaff.ts`.

Everything else (AdditionalSalaryRequest, SavingsFundTransfer, MHA, SalaryCalculator,
NsoMpdQuestionnaire, the three goal calculators, MinistryPartnerReminders) performs
real mutations against the primary API.
