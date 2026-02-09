import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { defaultCompleteFormValues } from './CompleteForm.mock';
import { calculateCompletionPercentage } from './calculateCompletionPercentage';

describe('calculateCompletionPercentage', () => {
  const createFormValues = (
    overrides: Partial<CompleteFormValues> = {},
  ): CompleteFormValues => ({
    ...defaultCompleteFormValues,
    currentYearSalaryNotReceived: '',
    previousYearSalaryNotReceived: '',
    additionalSalaryWithinMax: '',
    adoption: '',
    traditional403bContribution: '',
    roth403bContribution: '',
    counselingNonMedical: '',
    healthcareExpensesExceedingLimit: '',
    babysittingMinistryEvents: '',
    childrenMinistryTripExpenses: '',
    childrenCollegeEducation: '',
    movingExpense: '',
    seminary: '',
    housingDownPayment: '',
    autoPurchase: '',
    expensesNotApprovedWithin90Days: '',
    ...overrides,
  });

  it('should return 0 when all fields are empty', () => {
    const values = createFormValues();
    expect(calculateCompletionPercentage(values)).toBe(0);
  });

  it('should return 100 when all fields are filled', () => {
    const values = createFormValues({
      currentYearSalaryNotReceived: '50000',
      previousYearSalaryNotReceived: '48000',
      additionalSalaryWithinMax: '5000',
      adoption: '1000',
      traditional403bContribution: '2000',
      roth403bContribution: '1500',
      counselingNonMedical: '500',
      healthcareExpensesExceedingLimit: '1500',
      babysittingMinistryEvents: '800',
      childrenMinistryTripExpenses: '1200',
      childrenCollegeEducation: '3000',
      movingExpense: '2500',
      seminary: '1000',
      housingDownPayment: '10000',
      autoPurchase: '5000',
      expensesNotApprovedWithin90Days: '750',
      phoneNumber: '555-1234',
      emailAddress: 'test@example.com',
      additionalInfo: 'Some additional info',
      totalAdditionalSalaryRequested: '20000',
    });
    expect(calculateCompletionPercentage(values)).toBe(100);
  });

  it('should exclude deductTaxDeferredPercent from calculation', () => {
    const values = createFormValues({
      currentYearSalaryNotReceived: '50000',
      deductTaxDeferredPercent: true,
      deductRothPercent: true,
    });
    expect(calculateCompletionPercentage(values)).toBe(5);
  });

  it('should treat zero values as unfilled', () => {
    const values = createFormValues({
      currentYearSalaryNotReceived: '0',
      previousYearSalaryNotReceived: '0',
      additionalSalaryWithinMax: '50000',
    });
    expect(calculateCompletionPercentage(values)).toBe(5);
  });

  it('should handle decimal values correctly', () => {
    const values = createFormValues({
      currentYearSalaryNotReceived: '50000.50',
      previousYearSalaryNotReceived: '48000.75',
    });
    expect(calculateCompletionPercentage(values)).toBe(10);
  });
});
