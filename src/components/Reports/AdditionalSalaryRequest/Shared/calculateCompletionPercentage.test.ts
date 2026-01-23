import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { defaultCompleteFormValues } from '../CompleteForm/CompleteForm.mock';
import { calculateCompletionPercentage } from './calculateCompletionPercentage';

const totalSteps = 3;

describe('calculateCompletionPercentage', () => {
  const createFormValues = (
    overrides: Partial<CompleteFormValues> = {},
  ): CompleteFormValues => ({
    ...defaultCompleteFormValues,
    currentYearSalary: '',
    previousYearSalary: '',
    additionalSalary: '',
    adoption: '',
    contribution403b: '',
    counseling: '',
    healthcareExpenses: '',
    babysitting: '',
    childrenMinistryTrip: '',
    childrenCollege: '',
    movingExpense: '',
    seminary: '',
    housingDownPayment: '',
    autoPurchase: '',
    reimbursableExpenses: '',
    ...overrides,
  });

  it('should return start percentage when all fields are empty', () => {
    const values = createFormValues();

    // Step 1 complete + 0 filled fields --> 1/18 = 5.55%
    expect(calculateCompletionPercentage(values, 0, totalSteps)).toBe(5);
  });

  it('should return 95 when all fields are filled', () => {
    const values = createFormValues({
      currentYearSalary: '50000',
      previousYearSalary: '48000',
      additionalSalary: '5000',
      adoption: '1000',
      contribution403b: '2000',
      counseling: '500',
      healthcareExpenses: '1500',
      babysitting: '800',
      childrenMinistryTrip: '1200',
      childrenCollege: '3000',
      movingExpense: '2500',
      seminary: '1000',
      housingDownPayment: '10000',
      autoPurchase: '5000',
      reimbursableExpenses: '750',
      telephoneNumber: '555-1234',
    });

    // Steps 1 & 2 complete + all fields filled --> 17/18 = 94.44%
    expect(calculateCompletionPercentage(values, 1, totalSteps)).toBe(95);
  });

  it('should return 100 when all fields are filled and all steps completed', () => {
    const values = createFormValues({
      currentYearSalary: '50000',
      previousYearSalary: '48000',
      additionalSalary: '5000',
      adoption: '1000',
      contribution403b: '2000',
      counseling: '500',
      healthcareExpenses: '1500',
      babysitting: '800',
      childrenMinistryTrip: '1200',
      childrenCollege: '3000',
      movingExpense: '2500',
      seminary: '1000',
      housingDownPayment: '10000',
      autoPurchase: '5000',
      reimbursableExpenses: '750',
      telephoneNumber: '555-1234',
    });

    // Steps 1, 2, & 3 complete + all fields filled --> 18/18 = 100%
    expect(calculateCompletionPercentage(values, 2, totalSteps)).toBe(100);
  });

  it('should exclude defaultPercentage from calculation', () => {
    const values = createFormValues({
      currentYearSalary: '50000',
      defaultPercentage: true,
    });

    // Step 1 & 2 complete + 1 filled field --> 3/18 = 16.66%
    expect(calculateCompletionPercentage(values, 1, totalSteps)).toBe(16);
  });

  it('should treat zero values as unfilled', () => {
    const values = createFormValues({
      currentYearSalary: '0',
      previousYearSalary: '0',
      additionalSalary: '50000',
    });

    // Steps 1 & 2 complete + 1 filled field --> 3/18 = 16.66%
    expect(calculateCompletionPercentage(values, 1, totalSteps)).toBe(16);
  });

  it('should handle decimal values correctly', () => {
    const values = createFormValues({
      currentYearSalary: '50000.50',
      previousYearSalary: '48000.75',
    });

    // Step 1 & 2 complete + 2 filled fields --> 4/18 = 22.22%
    expect(calculateCompletionPercentage(values, 1, totalSteps)).toBe(21);
  });
});
