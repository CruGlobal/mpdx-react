import { renderHook } from '@testing-library/react';
import { useAnnualTotal } from './useAnnualTotal';

describe('useAnnualTotal', () => {
  it('calculates annual totals correctly for rent', () => {
    const values = {
      rentalValue: null,
      furnitureCostsOne: null,
      avgUtilityOne: null,
      mortgagePayment: 5,
      furnitureCostsTwo: 5,
      repairCosts: 5,
      avgUtilityTwo: 5,
      unexpectedExpenses: 5,
    };

    const { result } = renderHook(() => useAnnualTotal(values));

    expect(result.current.totalFairRental).toBe(0);
    expect(result.current.annualFairRental).toBe(0);
    expect(result.current.totalCostOfHome).toBe(25);
    expect(result.current.annualCostOfHome).toBe(300);
    expect(result.current.annualTotal).toBe(300);
  });

  it('calculates annual totals correctly for own', () => {
    const values = {
      rentalValue: 5,
      furnitureCostsOne: 5,
      avgUtilityOne: 5,
      mortgagePayment: 5,
      furnitureCostsTwo: 5,
      repairCosts: 5,
      avgUtilityTwo: 5,
      unexpectedExpenses: 5,
    };
    const { result } = renderHook(() => useAnnualTotal(values));

    expect(result.current.totalFairRental).toBe(15);
    expect(result.current.annualFairRental).toBe(180);
    expect(result.current.totalCostOfHome).toBe(25);
    expect(result.current.annualCostOfHome).toBe(300);
    expect(result.current.annualTotal).toBe(180);
  });
});
