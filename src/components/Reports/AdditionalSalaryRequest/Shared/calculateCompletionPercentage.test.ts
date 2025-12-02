import { CompleteFormValues } from '../CompleteForm/CompleteForm';
import { calculateCompletionPercentage } from './calculateCompletionPercentage';

describe('calculateCompletionPercentage', () => {
  const createFormValues = (
    overrides: Partial<CompleteFormValues> = {},
  ): CompleteFormValues => ({
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
    defaultPercentage: false,
    ...overrides,
  });

  it('should return 0 when all fields are empty', () => {
    const values = createFormValues();
    expect(calculateCompletionPercentage(values)).toBe(0);
  });

  it('should return 100 when all fields are filled', () => {
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
    });
    expect(calculateCompletionPercentage(values)).toBe(100);
  });

  it('should exclude defaultPercentage from calculation', () => {
    const values = createFormValues({
      currentYearSalary: '50000',
      defaultPercentage: true,
    });
    expect(calculateCompletionPercentage(values)).toBe(7);
  });

  it('should treat zero values as unfilled', () => {
    const values = createFormValues({
      currentYearSalary: '0',
      previousYearSalary: '0',
      additionalSalary: '50000',
    });
    expect(calculateCompletionPercentage(values)).toBe(7);
  });

  it('should handle decimal values correctly', () => {
    const values = createFormValues({
      currentYearSalary: '50000.50',
      previousYearSalary: '48000.75',
    });
    expect(calculateCompletionPercentage(values)).toBe(13);
  });
});
