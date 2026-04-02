import { ElectionType403bEnum } from 'src/graphql/types.generated';
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
      electionType403b: ElectionType403bEnum.Pretax,
      phoneNumber: '555-1234',
      emailAddress: 'test@example.com',
      additionalInfo: 'Some additional info',
      totalAdditionalSalaryRequested: '20000',
    });
    expect(calculateCompletionPercentage(values)).toBe(100);
  });

  it('should exclude electionType403b none selection from calculation', () => {
    const values = createFormValues({
      currentYearSalaryNotReceived: '50000',
      electionType403b: ElectionType403bEnum.None,
    });
    expect(calculateCompletionPercentage(values)).toBe(11);
  });

  it('should treat zero values as unfilled', () => {
    const values = createFormValues({
      currentYearSalaryNotReceived: '0',
      previousYearSalaryNotReceived: '0',
      additionalSalaryWithinMax: '50000',
    });
    expect(calculateCompletionPercentage(values)).toBe(6);
  });

  it('should handle decimal values correctly', () => {
    const values = createFormValues({
      currentYearSalaryNotReceived: '50000.50',
      previousYearSalaryNotReceived: '48000.75',
    });
    expect(calculateCompletionPercentage(values)).toBe(11);
  });
});
