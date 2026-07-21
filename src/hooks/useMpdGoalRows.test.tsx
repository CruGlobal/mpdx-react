import React from 'react';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import {
  GoalCalculatorTestWrapper,
  goalCalculationMock,
} from 'src/components/HrTools/GoalCalculator/GoalCalculatorTestWrapper';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { MpdGoalRow, useMpdGoalRows } from './useMpdGoalRows';

const renderUseMpdGoalRows = (supportRaised = 1000) =>
  renderHook(() => useMpdGoalRows(supportRaised), {
    wrapper: GoalCalculatorTestWrapper,
  });

// A mock where the mirrored AccountTransfers category (line 3I) carries a non-zero entered amount.
// The default mock leaves every mirrored category at 0, which would let a dropped mirrored category
// slip past the footing check below; a non-zero value gives that check teeth.
const goalCalculationWithMirroredExpense = {
  ...goalCalculationMock,
  ministryFamily: {
    ...goalCalculationMock.ministryFamily,
    primaryBudgetCategories:
      goalCalculationMock.ministryFamily.primaryBudgetCategories.map(
        (category) =>
          category.category === PrimaryBudgetCategoryEnum.AccountTransfers
            ? { ...category, directInput: 250 }
            : category,
      ),
  },
};

const MirroredExpenseWrapper: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <GoalCalculatorTestWrapper
    goalCalculation={goalCalculationWithMirroredExpense}
  >
    {children}
  </GoalCalculatorTestWrapper>
);

// The default mock's admin/attrition rates (0.12/0.06) happen to equal the client constants, so a
// reference column that wrongly grossed up with the constants would produce identical numbers and
// hide the bug. Diverge the server rates here so only the server-sourced wiring
// (useMpdGoalRows -> calculateGoalSubtotals) can produce the values asserted below.
const goalCalculationWithDistinctRates = {
  ...goalCalculationMock,
  newStaffCalculations: {
    ...goalCalculationMock.newStaffCalculations,
    adminRate: 0.2,
    attritionRate: 0.15,
  },
};

const DistinctRatesWrapper: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <GoalCalculatorTestWrapper goalCalculation={goalCalculationWithDistinctRates}>
    {children}
  </GoalCalculatorTestWrapper>
);

describe('useMpdGoalRows', () => {
  it('returns a row for every goal line', () => {
    const { result } = renderUseMpdGoalRows();

    const lines = result.current.rows.map((row) => row.line);
    expect(result.current.rows).toHaveLength(29);
    expect(lines).toContain('1A');
    expect(lines).toContain('3E');
    expect(lines).toContain('9');
  });

  it('calculates the new staff reference amount for the net monthly salary line', async () => {
    const { result } = renderUseMpdGoalRows();

    await waitFor(() => {
      const netMonthlySalary = result.current.rows.find(
        (row) => row.line === '1A',
      );
      expect(netMonthlySalary).toBeDefined();
      const formatted =
        netMonthlySalary &&
        result.current.valueFormatter(
          netMonthlySalary.reference,
          netMonthlySalary,
        );
      expect(formatted).toBe('$5,211');
    });
  });

  it('sums a ministry-expense category from its sub-budget amounts', async () => {
    const { result } = renderUseMpdGoalRows();

    await waitFor(() => {
      const ministryMiles = result.current.rows.find(
        (row) => row.line === '3A',
      );
      expect(ministryMiles?.amount).toBe(1450);
    });
  });

  describe('new staff reference column', () => {
    // Guards the field-by-field mapping from newStaffCalculations into the reference column.
    // A swap such as salarySubtotal ↔ totalSalary, or a dropped ministry category, would
    // otherwise pass silently. Mock values come from GoalCalculatorTestWrapper.
    it('maps each server newStaffCalculations field to the correct line', async () => {
      const { result, waitForNextUpdate } = renderUseMpdGoalRows();
      await waitForNextUpdate();

      const reference = (line: string) =>
        result.current.rows.find((row) => row.line === line)?.reference;

      expect(reference('1C')).toBe(1146); // taxes ← seca
      expect(reference('1D')).toBe(6357); // salaryPreIra ← salarySubtotal
      expect(reference('1H')).toBe(479); // rothContribution ← totalContributing403bAmount
      expect(reference('1J')).toBe(82032); // grossAnnualSalary ← totalSalary * 12
      expect(reference('1')).toBe(6836); // grossMonthlySalary ← totalSalary
      expect(reference('2')).toBe(1910.54); // benefits ← benefitsCharge
      expect(reference('3A')).toBe(98); // ministry miles ← ministryMiles
      expect(reference('3E')).toBe(124.5); // MPD ← mpd
      expect(reference('3H')).toBe(330); // reimbursable medical ← medicalExpenses
    });

    it('foots the subtotal against the per-line 3A-3J references', async () => {
      // Render with a non-zero mirrored category (AccountTransfers → line 3I) so the footing check
      // has teeth: dropping a mirrored category from the subtotal would change line 4 without
      // changing the summed 3A–3J references, breaking the assertion instead of silently mis-summing.
      const { result, waitForNextUpdate } = renderHook(
        () => useMpdGoalRows(1000),
        { wrapper: MirroredExpenseWrapper },
      );
      await waitForNextUpdate();

      const { rows } = result.current;

      const ministryTotal = rows
        .filter((row) => row.line.match(/^3[A-Z]$/))
        .reduce((sum, line) => sum + line.reference, 0);

      const reference = (line: string) =>
        rows.find((row) => row.line === line)?.reference ?? 0;

      // AccountTransfers is mirrored from the entered amount (line 3I).
      expect(reference('3I')).toBe(250);
      // 822.5 base ministry references + the 250 mirrored AccountTransfers amount.
      expect(ministryTotal).toBeCloseTo(1072.5, 2);
      // Subtotal (line 4) must equal gross monthly salary + benefits + the visible ministry lines.
      expect(reference('4')).toBeCloseTo(
        reference('1') + reference('2') + ministryTotal,
        2,
      );
    });

    it('grosses up the subtotal lines with the server admin/attrition rates', async () => {
      // Proves the wiring in useMpdGoalRows (server adminRate/attritionRate -> calculateGoalSubtotals),
      // not just the pure calculation. With the divergent server rates (0.20/0.15) these relations
      // only hold if the reference column reads the server calculation; grossing up with the client
      // constants (0.12/0.06) would fail both assertions.
      const { result, waitForNextUpdate } = renderHook(
        () => useMpdGoalRows(1000),
        { wrapper: DistinctRatesWrapper },
      );
      await waitForNextUpdate();

      const reference = (line: string) =>
        result.current.rows.find((row) => row.line === line)?.reference ?? 0;

      // Line 5 = line 4 grossed up by the server admin rate (0.20).
      expect(reference('5')).toBeCloseTo(reference('4') / (1 - 0.2), 2);
      // Line 6 = line 5 plus the server attrition rate (0.15).
      expect(reference('6')).toBeCloseTo(reference('5') * 1.15, 2);
    });
  });

  describe('supportRaised parameter', () => {
    it('renders supportRaised for solid support developed', () => {
      const { result } = renderUseMpdGoalRows(1000);

      const solidSupport = result.current.rows.find((row) => row.line === '7');
      expect(solidSupport?.amount).toBe(1000);
      expect(solidSupport?.reference).toBe(1000);
    });

    it('treats 0 support as 0% progress with the full goal still to develop', async () => {
      const { result } = renderUseMpdGoalRows(0);

      await waitFor(() => {
        const totalGoal = result.current.rows.find((row) => row.line === '6');
        const toBeDeveloped = result.current.rows.find(
          (row) => row.line === '8',
        );
        const percentageProgress = result.current.rows.find(
          (row) => row.line === '9',
        );

        expect(totalGoal?.amount).toBeGreaterThan(0);
        expect(toBeDeveloped?.amount).toBe(totalGoal?.amount);
        expect(percentageProgress?.amount).toBe(0);
      });
    });

    it('clamps progress to 100% when support exceeds the goal', async () => {
      const { result } = renderUseMpdGoalRows(1_000_000);

      await waitFor(() => {
        const totalGoal = result.current.rows.find((row) => row.line === '6');
        const toBeDeveloped = result.current.rows.find(
          (row) => row.line === '8',
        );
        const percentageProgress = result.current.rows.find(
          (row) => row.line === '9',
        );

        expect(totalGoal?.amount).toBeGreaterThan(0);
        expect(percentageProgress?.amount).toBe(1);
        expect(toBeDeveloped?.amount).toBe(
          (totalGoal?.amount ?? 0) - 1_000_000,
        );
        expect(toBeDeveloped?.amount).toBeLessThan(0);
      });
    });
  });

  describe('valueFormatter', () => {
    const currencyRow: MpdGoalRow = {
      line: '1',
      category: 'Gross Monthly Salary',
      amount: 0,
      reference: 0,
    };
    const percentageRow: MpdGoalRow = {
      line: '1B',
      category: 'Taxes, SECA, VTL, etc. %',
      amount: 0,
      reference: 0,
      percentage: true,
    };

    it('formats currency rows with no fraction digits', () => {
      const { result } = renderUseMpdGoalRows();

      expect(result.current.valueFormatter(1234.56, currencyRow)).toBe(
        '$1,235',
      );
    });

    it('formats percentage rows with two fraction digits', () => {
      const { result } = renderUseMpdGoalRows();

      expect(result.current.valueFormatter(0.15, percentageRow)).toBe('15.00%');
    });
  });
});
