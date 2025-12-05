import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { calculateDeductions } from './calculateDeductions';

describe('calculateDeductions', () => {
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

  it('calculates deductions with default percentage enabled', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      defaultPercentage: true,
      contribution403b: '1000',
    };
    const total = 10000;

    const result = calculateDeductions(values, total);

    expect(result.calculatedDeduction).toBe(1200);
    expect(result.contribution403b).toBe(1000);
    expect(result.totalDeduction).toBe(2200);
  });

  it('calculates deductions with default percentage disabled', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      defaultPercentage: false,
      contribution403b: '500',
    };
    const total = 10000;

    const result = calculateDeductions(values, total);

    expect(result.calculatedDeduction).toBe(0);
    expect(result.contribution403b).toBe(500);
    expect(result.totalDeduction).toBe(500);
  });

  it('handles empty contribution403b value', () => {
    const values: CompleteFormValues = {
      ...baseValues,
      defaultPercentage: true,
      contribution403b: '',
    };
    const total = 5000;

    const result = calculateDeductions(values, total);

    expect(result.calculatedDeduction).toBe(600);
    expect(result.contribution403b).toBe(0);
    expect(result.totalDeduction).toBe(600);
  });
});
