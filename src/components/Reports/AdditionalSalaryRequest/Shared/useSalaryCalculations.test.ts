import { renderHook } from '@testing-library/react';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useSalaryCalculations } from './useSalaryCalculations';

describe('useSalaryCalculations', () => {
  const baseValues: CompleteFormValues = {
    currentYearSalary: '0',
    previousYearSalary: '0',
    additionalSalary: '0',
    adoption: '0',
    contribution403b: '0',
    counseling: '0',
    healthcareExpenses: '0',
    babysitting: '0',
    childrenMinistryTrip: '0',
    childrenCollege: '0',
    movingExpense: '0',
    seminary: '0',
    housingDownPayment: '0',
    autoPurchase: '0',
    reimbursableExpenses: '0',
    defaultPercentage: false,
  };

  it('calculates all salary values correctly with default percentage enabled', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalary: '5000',
      previousYearSalary: '3000',
      adoption: '2000',
      contribution403b: '1000',
      defaultPercentage: true,
    };

    const { result } = renderHook(() => useSalaryCalculations(values));

    expect(result.current.total).toBe(11000); // 5000 + 3000 + 2000 + 1000
    expect(result.current.calculatedDeduction).toBe(1320); // 11000 * 0.12
    expect(result.current.contribution403b).toBe(1000);
    expect(result.current.totalDeduction).toBe(2320); // 1320 + 1000
    expect(result.current.netSalary).toBe(8680); // 11000 - 2320
  });

  it('calculates all salary values correctly with default percentage disabled', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalary: '10000',
      contribution403b: '500',
      defaultPercentage: false,
    };

    const { result } = renderHook(() => useSalaryCalculations(values));

    expect(result.current.total).toBe(10500); // 10000 + 500
    expect(result.current.calculatedDeduction).toBe(0);
    expect(result.current.contribution403b).toBe(500);
    expect(result.current.totalDeduction).toBe(500);
    expect(result.current.netSalary).toBe(10000); // 10500 - 500
  });

  it('handles empty contribution403b value', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalary: '5000',
      defaultPercentage: true,
      contribution403b: '',
    };

    const { result } = renderHook(() => useSalaryCalculations(values));

    expect(result.current.total).toBe(5000);
    expect(result.current.calculatedDeduction).toBe(600); // 5000 * 0.12
    expect(result.current.contribution403b).toBe(0);
    expect(result.current.totalDeduction).toBe(600);
    expect(result.current.netSalary).toBe(4400); // 5000 - 600
  });

  it('excludes defaultPercentage from total calculation', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      currentYearSalary: '1000',
      previousYearSalary: '2000',
      defaultPercentage: true,
    };

    const { result } = renderHook(() => useSalaryCalculations(values));

    // Should not include defaultPercentage boolean in total
    expect(result.current.total).toBe(3000); // 1000 + 2000
  });

  it('handles all fields with values', () => {
    const values: CompleteFormValues = {
      currentYearSalary: '1000',
      previousYearSalary: '1000',
      additionalSalary: '1000',
      adoption: '1000',
      contribution403b: '1000',
      counseling: '1000',
      healthcareExpenses: '1000',
      babysitting: '1000',
      childrenMinistryTrip: '1000',
      childrenCollege: '1000',
      movingExpense: '1000',
      seminary: '1000',
      housingDownPayment: '1000',
      autoPurchase: '1000',
      reimbursableExpenses: '1000',
      defaultPercentage: false,
    };

    const { result } = renderHook(() => useSalaryCalculations(values));

    expect(result.current.total).toBe(15000); // 15 fields * 1000
    expect(result.current.calculatedDeduction).toBe(0); // defaultPercentage is false
    expect(result.current.contribution403b).toBe(1000);
    expect(result.current.totalDeduction).toBe(1000);
    expect(result.current.netSalary).toBe(14000); // 15000 - 1000
  });

  it('handles zero values correctly', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      defaultPercentage: false,
    };

    const { result } = renderHook(() => useSalaryCalculations(values));

    expect(result.current.total).toBe(0);
    expect(result.current.calculatedDeduction).toBe(0);
    expect(result.current.contribution403b).toBe(0);
    expect(result.current.totalDeduction).toBe(0);
    expect(result.current.netSalary).toBe(0);
  });
});
