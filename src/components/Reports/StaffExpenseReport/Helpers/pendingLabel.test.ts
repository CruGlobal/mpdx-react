import i18n from 'src/lib/i18n';
import { getDescriptionWithPending, getPendingLabel } from './pendingLabel';

describe('getPendingLabel', () => {
  it('returns null when nothing is pending', () => {
    expect(getPendingLabel(null, i18n.t)).toBeNull();
  });

  it('labels a fully pending row without a count', () => {
    expect(getPendingLabel({ count: 1, total: 1 }, i18n.t)).toBe('Pending');
    expect(getPendingLabel({ count: 2, total: 2 }, i18n.t)).toBe('Pending');
  });

  it('counts the pending transactions in a partly pending row', () => {
    expect(getPendingLabel({ count: 2, total: 5 }, i18n.t)).toBe(
      '2 of 5 Pending',
    );
  });
});

describe('getDescriptionWithPending', () => {
  it('leaves a row with nothing pending alone', () => {
    expect(
      getDescriptionWithPending(
        { description: 'Donations', pending: null },
        i18n.t,
      ),
    ).toBe('Donations');
  });

  it('adds the pending label in parentheses', () => {
    expect(
      getDescriptionWithPending(
        { description: 'Donations', pending: { count: 2, total: 5 } },
        i18n.t,
      ),
    ).toBe('Donations (2 of 5 Pending)');
  });
});
