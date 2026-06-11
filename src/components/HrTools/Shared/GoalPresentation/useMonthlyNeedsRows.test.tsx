import { renderHook } from '@testing-library/react';
import { MonthlyNeeds, useMonthlyNeedsRows } from './useMonthlyNeedsRows';

const monthlyNeeds: MonthlyNeeds = {
  married: false,
  salary: 5000,
  ministryExpenses: 1000,
  benefits: 800,
  socialSecurityAndTaxes: 600,
  voluntaryRetirement: 400,
  adminCharge: 200,
};

describe('useMonthlyNeedsRows', () => {
  it('returns the rows in order with their amounts', () => {
    const { result } = renderHook(() => useMonthlyNeedsRows(monthlyNeeds));

    expect(result.current.map(({ title, amount }) => [title, amount])).toEqual([
      ['Salary', 5000],
      ['Ministry Expenses', 1000],
      ['Benefits', 800],
      ['Social Security and Taxes', 600],
      ['Voluntary 403b Retirement Plan', 400],
      ['Administrative Charge', 200],
    ]);
  });

  it('uses the combined salary title when married', () => {
    const { result } = renderHook(() =>
      useMonthlyNeedsRows({ ...monthlyNeeds, married: true }),
    );

    expect(result.current[0].title).toBe('Salary (Combined)');
  });

  it('does not bold the administrative charge title', () => {
    const { result } = renderHook(() => useMonthlyNeedsRows(monthlyNeeds));

    expect(result.current[5].titleBold).toBe(false);
  });
});
