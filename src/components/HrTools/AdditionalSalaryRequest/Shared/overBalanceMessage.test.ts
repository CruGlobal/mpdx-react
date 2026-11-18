import i18n from 'src/lib/i18n';
import { overBalanceMessage } from './overBalanceMessage';

describe('overBalanceMessage', () => {
  it('names the available amount', () => {
    expect(overBalanceMessage(i18n.t, 'en-US', 11000)).toBe(
      'Exceeds the $11,000.00 available for this request.',
    );
  });
});
