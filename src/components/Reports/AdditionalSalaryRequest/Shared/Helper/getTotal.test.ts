import { defaultCompleteFormValues } from '../../CompleteForm/CompleteForm.mock';
import { getTotal } from './getTotal';

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
