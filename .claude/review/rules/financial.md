# Financial Correctness — Focus Areas

MPDX tells staff whether they are funded. Every number on a report is a donation aggregation, a goal
calculation, or a currency conversion, and a wrong one is silent — it renders as a perfectly
plausible dollar amount. This document supplements rules/data-integrity.md with the domain
invariants.

**Trigger this review when the diff touches** `src/components/Reports/**`,
`src/components/HrTools/**`, `src/components/EditDonationModal/**`,
`src/components/Dashboard/MonthlyGoal/**`, `src/components/Dashboard/DonationHistories/**`,
`src/lib/intlFormat.ts`, `src/hooks/useAnnualTotal.ts`, or anything containing `amount`, `currency`,
`convertedAmount`, `pledgeAmount`, `goal`, `balance`, `total`, `.reduce(`, `.toFixed(`,
`Math.round(`, `Number(`, `parseFloat(`, `parseInt(` in those trees.

If the keyword match turns out to be a false positive (e.g. `amount` is a form label), say
"No financial calculation code in this PR" and skip the rest.

---

**Currency mixing**

Donations arrive in the donor's currency; reports display either donor currency or the account's
salary currency. The two must never be added together.

- Look for: a `.reduce` over `amount` (native) instead of `convertedAmount` / `converted_amount` /
  `convertedTotal` / `convertedBalance` when the rows can differ in `currencyCode`
- Look for: summing across `currencyGroups` in
  `src/components/Reports/FourteenMonthReports/useFourteenMonthReport.ts`. Each entry of
  `currencyGroups` is one currency; totals are per group by design, which is also why
  `src/lib/apollo/cache.ts` sets `FourteenMonthReportContact: { keyFields: false }` — the same
  contact id in two currency groups must stay two rows
- Look for: `isSalaryType` branches that pick the wrong side of a pair —
  `totals.year_converted` vs `totals.year`, and `salaryCurrencyTotal` (summed from
  `donation.converted_amount`) vs `Number(month.total)`
- Look for: a `currency` argument sourced from the wrong row.
  `DesignationAccountsReport.tsx` formats its total with
  `data.designationAccounts[0].designationAccounts[0].currency` — the _first account's_ currency, not
  a report-level one. Any new total needs an explicitly justified currency
- Look for: new hardcoded `'USD'`. It exists deliberately in
  `MPGAIncomeExpensesContext` (`const currency = 'USD'`) and in the PDS goal calculator's write
  boundary; a _new_ one needs the same justification

**REST-sourced amounts are strings**

- The fourteen-month payload types every money field as `string` (`total`, `amount`,
  `converted_amount`, `pledge_amount`). `useFourteenMonthReport.ts` wraps each in `Number()`
- Look for: arithmetic on a REST-derived field with no `Number()` — `sum + row.total` on strings
  concatenates and produces a long, wrong, and very plausible number

**Rounding at the boundary, not mid-pipeline**

- Formatting is the boundary: `currencyFormat`, `numberFormat`, `percentageFormat`, `amountFormat`,
  `zeroAmountFormat` in `src/lib/intlFormat.ts`, always with the locale from `useLocale()`
- Look for: `.toFixed(n)` or `Math.round()` inside aggregation logic. The sanctioned exceptions are
  explicit write boundaries: `useCsvData.ts` rounds each cell for the CSV export, and the goal
  calculators keep floats through the calc and round at submission. Note that `useCsvData.ts`'s
  totals row sums `roundedTotals` — the already-rounded per-month figures — so the CSV total equals
  the sum of the printed columns. That is deliberate; don't "fix" it to sum unrounded values
- Look for: two places computing the same total differently (e.g. a table footer and a CSV export)

**Zero, null, and "no data" are three different things**

- `amountFormat(value, locale)` returns **`''` for any falsy value, including `0`** —
  `amountFormat(0)` renders blank. `zeroAmountFormat` renders `'-'` for `0`. `currencyFormat` renders
  `$0` (with `trailingZeroDisplay: 'stripIfInteger'` unless `showTrailingZeros: true`). Picking the
  wrong one changes what a legitimate zero looks like on screen
- `currencyFormat` also defaults a nullish `currency` to `'USD'` and catches `Intl` failures back to
  `` `${amount} ${currency}` `` — so a bad currency code degrades quietly
- Every formatter guards with `Number.isFinite(value) ? value : 0`, so **`NaN` and `Infinity` both
  render as zero**. A divide-by-zero upstream therefore shows as `$0`, not as an error
- Look for: `?? 0` applied where `null` means "unknown" rather than "zero"
- Look for: `|| 0` on a sum — e.g. `MPGAIncomeExpensesContext`'s
  `rows?.reduce(...) || 0` coerces a legitimate `0` and a `NaN` identically
- Look for: a report with no rows rendering `$0.00` instead of the empty state. The repo has
  `src/components/Reports/EmptyReport/EmptyReport.tsx` for this, and `DonationHistories.tsx`
  computes `empty` as "periods total === 0" before rendering its illustration instead of a flat chart
- Look for: a `> 0` visibility guard that hides legitimately negative data —
  `DesignationAccountsReport` renders its balance node only when `totalBalance > 0`, so a zero or
  negative balance renders nothing at all

**Division by a goal or rate**

- `MonthlyGoal.tsx` computes `received / goal`, `pledged / goal`, and `belowGoal / goal` with `goal`
  defaulting to `0`, and guards each render site with `isNaN(...) ? '-' : percentageFormat(...)`.
  New goal-percentage math must guard the same way — don't rely on the formatter's silent
  `Number.isFinite` fallback, which would print `0%`
- `calculateGoalSubtotals` in `src/components/HrTools/GoalCalculator/Shared/calculateTotals.ts` does
  `overallSubtotal / (1 - adminRate)`. An `adminRate` of 1 divides by zero. `toPercentage(v) =
(v ?? 0) / 100` — the constants are whole percents, so a rate passed in already-fractional is
  off by 100×

**Goal-formula ordering and the three-calculator drift**

Order of operations is part of the formula:
`grossAnnualSalary = grossMonthlySalary * 12`,
`overallSubtotal = grossMonthlySalary + ministryExpensesTotal + benefitsCharge`,
`overallSubtotalWithAdmin = overallSubtotal / (1 - adminRate)` (**admin gross-up first**),
`attrition = overallSubtotalWithAdmin * attritionRate`,
`overallTotal = overallSubtotalWithAdmin + attrition`.

There are **three independent implementations** of overlapping goal concepts (per
`src/components/HrTools/CLAUDE.md`):

- `GoalCalculator` (MPD worksheet) — `GoalCalculator/Shared/calculateTotals.ts`, client-side
- `PdsGoalCalculator` (Designation Support) — `PdsGoalCalculator/calculations/`, client-side;
  reimbursable expenses are clamped to a minimum, `formType === Simple` zeroes reimbursable + 403(b),
  and the 403(b) percentage comes from HCM, not the form
- `NsGoalCalculator` (New Staff) — **no goal-formula math on the client**; it reads a server-computed
  worksheet and recalculates unsaved edits through `previewNewStaffGoalCalculation`. Only
  display-level arithmetic belongs in that tree

Changing the math in one does **not** update the others, and the step ordering already differs.
Look for: a formula change confined to one calculator; new goal math added to `NsGoalCalculator`;
a "shared" helper extracted from one of them without checking the other two agree.

Also: the generic calculator derives the monthly budget from net pay when there is no direct input —
a load-bearing assumption, not raw user entry. And NS captures a user-selected `calculationsYear`
while the client constants are **not** year-versioned.

**MHA annual totals — `src/hooks/useAnnualTotal.ts`**

- `totalFairRental` is computed only when `rentOrOwn === MhaRentOrOwnEnum.Own`; otherwise it is `0`
- `annualTotal = min(annualFairRental, annualCostOfHome)`, but with `0` treated as "not applicable"
  via the nested ternary. A genuinely-zero cost-of-home is therefore indistinguishable from an
  unfilled form — preserve that branch structure rather than collapsing it to `Math.min`
- Every input is `?? 0`; the `useMemo` dependency list enumerates each field individually, so adding
  a field to `CalculationFormValues` means adding it to the deps or the total goes stale

**Date windows**

- Fourteen-month reports request `range: '13m'` because "the backend sends one extra month" — the
  off-by-one is intentional and commented
- `useCsvData.ts` computes the in-hand monthly equivalent from `contact.months.slice(1, n + 1)` —
  **skipping the current month** because monthly partners may not have given yet
- `MPGAIncomeExpensesContext` derives `firstFutureMonthIndex = now.month` under the year-to-date
  filter and greys future months via `isFutureMonth(index) => index >= firstFutureMonthIndex`.
  Future months must not enter averages
- `now` is captured once with `useMemo(() => DateTime.now(), [])` so a long-lived page doesn't shift
  its window mid-session
- Look for: any `new Date()` in report logic (Luxon only), naive month arithmetic across boundaries,
  and inclusive/exclusive range mistakes

**Prefer server aggregates over client sums**

- When both a server total (`total`, `totalCount`, `averagePerMonth`, `convertedTotal`) and a
  `nodes`/row array exist, use the server value. A client `.reduce` over one 25-item page is a silent
  undercount
- If a client-side aggregate is genuinely needed over a paginated field, load every page with
  `useFetchAllPages` first

**Money input widgets**

- Use `CurrencyAdornment` / `PercentageAdornment` from `src/components/HrTools/Shared/Adornments.tsx`
- Validate with `amount()` / `percentage()` / `integer()` from `src/lib/yupHelpers.ts`
- Parse typed currency strings back to numbers with `parseNumberFromCurrencyString(input, locale)` —
  it derives the locale's group and decimal separators from `Intl.NumberFormat`, so a bare
  `parseFloat(input.replace(/,/g,''))` is wrong outside en-US

---

### Financial Checklist

- Currency mixing prevented (`convertedAmount`, no cross-group sums): Yes/No/N/A
- REST-sourced amounts converted with `Number()` before arithmetic: Yes/No/N/A
- Rounding only at the display/write boundary: Yes/No/N/A
- Correct formatter chosen for zero (`currencyFormat` vs `amountFormat` vs `zeroAmountFormat`): Yes/No/N/A
- Null/undefined amounts handled deliberately (not `?? 0` over "unknown"): Yes/No/N/A
- Division by goal/rate guarded against zero: Yes/No/N/A
- Goal-formula step order preserved and the other two calculators checked for drift: Yes/No/N/A
- Date windows correct (Luxon, no `new Date()`, future months excluded): Yes/No/N/A
- Server-provided aggregates preferred over client `.reduce` over `nodes`: Yes/No/N/A
- Empty state renders "no data", not `$0.00`: Yes/No/N/A

---

## Mined from merged PR history

Rules derived from 50 merged PRs (#2002–#2056). Each carries the PRs it came from.

- **Null money is not `$0.00`.** Flag `?? 0` on a nullable balance, payroll, or stock money field —
  for a balance, null ("unknown") and zero ("empty") demand opposite responses, and a fabricated
  `$0.00` reads as real data. Null must render the shared unknown sentinel (`pendingField`), must
  not drive red/green colouring, and an empty chart must hide its currency axis rather than draw
  twelve `$0` months. `?? 0` stays acceptable for flow values (contributions, expenses) where zero
  and "no activity" genuinely coincide.
  <!-- evidence: PR #2020, #2024, #2033 -->
- A status enum must not short-circuit a present amount:
  `if (status === MpdHealthStatusEnum.Gray) return '-'` hid real quarterly payroll for staff who had
  started payroll and needed `&& !averagePayroll`. Every branch returning a placeholder (`-`, `N/A`,
  `Partial`) must be reachable only when the amount is genuinely absent, and each placeholder must
  mean a distinct kind of absence.
  <!-- evidence: PR #2050 -->
- When a diff changes a denominator, cap, threshold, or date window, re-read every adjacent status
  message, banner, tooltip, and label that asserts a relationship to it. A changed cap denominator
  left a card claiming the request "is within your Combined Maximum Allowable Salary" next to a
  negative Remaining; a banner naming a specific December rollover was reused for an unrelated
  condition; a "Started on:" label rendered for a schedule that never started.
  <!-- evidence: PR #2002, #2003, #2006 -->
- A derived money value whose computation changed must be renamed, and a new meaning must never be
  aliased onto an identifier that still carries the old meaning elsewhere — the deleted line then
  reintroduces cleanly with no type error and no failing test. `totalAnnualSalary` stopped being a
  total once current-year backpay was excluded; `combinedCap` was aliased to a sum of effective caps
  while `calculations.combinedCap` still meant the household policy ceiling in two sibling files.
  For a large mechanical rename across money paths (an AI-coauthored `pendingAsrAmount` →
  `ytdAsrAmount` across 17 files), look for the semantic change hiding inside it — that commit also
  swapped a computed difference for a direct field read and changed which field fed the cap
  calculation. "Scanned twice, found nothing" is not sufficient on a money-path rename; require a
  test asserting the resulting cap or total numerically.
  <!-- evidence: PR #2002, #2010, #2021 -->
