import i18n from 'src/lib/i18n';
import { overBalanceMessage } from './overBalanceMessage';

describe('overBalanceMessage', () => {
  it('names the available amount', () => {
    expect(overBalanceMessage(i18n.t, 'en-US', 11000, 0)).toBe(
      'Exceeds the $11,000.00 available for this request (balance plus deficit limit).',
    );
  });

  it('names the other unpaid requests', () => {
    expect(overBalanceMessage(i18n.t, 'en-US', 8500, 2500)).toBe(
      'Exceeds the $8,500.00 available for this request (balance plus deficit limit, minus $2,500.00 in other unpaid requests).',
    );
  });
});
