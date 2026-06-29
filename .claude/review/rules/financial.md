# Financial Reporting — Focus Areas

MPDX displays and calculates donation/partner-giving aggregations across dozens of financial reports. Display-side miscalculations silently mislead staff about their support status. This agent supplements the generic Data Integrity agent with domain-specific invariants.

**Trigger conditions:**

- Any file under `src/components/Reports/**`
- Any file under `src/components/HrTools/**`
- Any file under `src/components/Reports/GoalCalculator/**`, `src/components/HrTools/GoalCalculator/**`, or `src/components/HrTools/PdsGoalCalculator/**`
- Any file under `src/components/Reports/SalaryCalculator/**` or `src/components/HrTools/SalaryCalculator/**`
- Any file under `src/components/EditDonationModal/**`
- Any file under `src/components/Reports/AdditionalSalaryRequest/**`, `src/components/HrTools/AdditionalSalaryRequest/**`, or `src/components/HrTools/MinisterHousingAllowance/**`
- Any file under `src/components/Dashboard/MonthlyGoal/**`, `src/components/Dashboard/DonationHistories/**`
- Diff content contains any of: `amount`, `currency`, `convertedAmount`, `pledgeAmount`, `goal`, `balance`, `total`, `sum(`, `reduce((`, `.toFixed(`, `Math.round(`, `Number(`, `parseFloat(`, `parseInt(` inside `src/components/Reports/**`, `src/components/HrTools/**`, or other goal/donation components

**Focus areas:**

- **Money is never a JavaScript `number` for arithmetic.** Check for floating-point arithmetic on money values — any `amount + amount`, `amount * rate`, or `.reduce` accumulating amounts must round at the display boundary.
- **Currency mixing.** Donations arrive in multiple currencies; verify no code path sums `amount` (native currency) across rows with different `currencyCode`. Aggregations must use `convertedAmount` (or equivalent) in a single reporting currency.
- **Rounding consistency.** Rounding should happen at the display boundary via `intlFormat` / `Intl.NumberFormat`, not sprinkled through calculation code. Flag any `.toFixed(n)` used inside aggregation logic.
- **Missing/null amounts.** Donations, pledges, and goals may be `null` or `undefined`. Verify nullish handling (`?? 0`) is present where aggregations happen, and that `null` is not silently coerced to `0` where it should surface as "unknown."
- **Date-window correctness.** Fourteen-month and expected-monthly reports depend on correct month boundaries, timezone handling (use Luxon — not `new Date()`), and inclusive/exclusive range semantics. Flag any `new Date()` in report logic.
- **Goal-calculation consistency.** Goal math in `GoalCalculator` / `PdsGoalCalculator` must match across UI layers — flag any duplicate calculation logic that could drift.
- **Empty-state / zero-state correctness.** A report with zero donations should render "no data" — not `$0.00` that looks like real data.
- **GraphQL aggregation fields vs client-side summing.** Prefer server-provided totals (`totalAmount`, `sum`, etc.) over client-side `.reduce` when both are available — client sums over a paginated `nodes` list are a silent bug.

**Output format:** Use the standard agent output format with `Critical Financial Issues`, `Financial Concerns`, `Financial Suggestions`, plus a `Financial Checklist`:

```
### Financial Checklist
- Arithmetic on money values safe: Yes/No/N/A
- Currency mixing prevented: Yes/No/N/A
- Rounding at display boundary only: Yes/No/N/A
- Null/undefined amounts handled: Yes/No/N/A
- Luxon used for dates (not `new Date()`): Yes/No/N/A
- Server-provided aggregations preferred: Yes/No/N/A
```

**Note:** If your analysis determines that the changes do not actually affect financial logic (e.g., the keyword match was a false positive — `amount` could be a form field label), state "No financial calculation code in this PR" clearly and skip the detailed review.
