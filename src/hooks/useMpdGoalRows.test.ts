import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import { GoalCalculatorTestWrapper } from 'src/components/HrTools/GoalCalculator/GoalCalculatorTestWrapper';
import { MpdGoalRow, useMpdGoalRows } from './useMpdGoalRows';

const renderUseMpdGoalRows = (supportRaised = 1000) =>
  renderHook(() => useMpdGoalRows(supportRaised), {
    wrapper: GoalCalculatorTestWrapper,
  });

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
