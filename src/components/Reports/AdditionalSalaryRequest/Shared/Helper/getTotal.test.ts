import { defaultCompleteFormValues } from '../CompleteForm.mock';
import { getTotal, getTotalWithout403b } from './getTotal';

describe('getTotal', () => {
  it('returns correct number', () => {
    expect(
      getTotal({
        ...defaultCompleteFormValues,
        autoPurchase: '20000',
        movingExpense: '123',
      }),
    ).toBe(20123);
  });
});

describe('getTotalWithout403b', () => {
  it('excludes 403b contributions from total', () => {
    expect(
      getTotalWithout403b({
        ...defaultCompleteFormValues,
        autoPurchase: '20000',
        movingExpense: '123',
        traditional403bContribution: '5000',
        roth403bContribution: '3000',
      }),
    ).toBe(20123);
  });

  it('returns same result as getTotal when 403b contributions are zero', () => {
    const values = {
      ...defaultCompleteFormValues,
      currentYearSalaryNotReceived: '1000',
      adoption: '500',
    };

    expect(getTotalWithout403b(values)).toBe(getTotal(values));
  });

  it('returns zero when all fields are zero', () => {
    expect(getTotalWithout403b(defaultCompleteFormValues)).toBe(0);
  });
});
