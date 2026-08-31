import { defaultCompleteFormValues } from '../CompleteForm.mock';
import { getNonBackpayTotal, getTotal } from './getTotal';

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

describe('getNonBackpayTotal', () => {
  it('subtracts current-year backpay but keeps previous-year backpay', () => {
    expect(
      getNonBackpayTotal({
        ...defaultCompleteFormValues,
        currentYearSalaryNotReceived: '5000',
        previousYearSalaryNotReceived: '2000',
        autoPurchase: '20000',
      }),
    ).toBe(22000);
  });
});
