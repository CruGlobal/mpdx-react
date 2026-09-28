import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { AggregationPeriod } from './aggregationPolicy';
import { GroupedTransaction, Transaction } from './filterTransactions';
import { getPendingLabel } from './pendingLabel';

const transaction = (id: string, isPending: boolean): Transaction => ({
  id,
  amount: 100,
  transactedAt: '2025-01-15',
  fundType: 'Primary',
  category: StaffExpenseCategoryEnum.Donation,
  displayCategory: 'Donation',
  isPending,
});

const rollup = (members: Transaction[]): GroupedTransaction => ({
  ...transaction('grouped', false),
  groupedTransactions: members,
  bucketKey: 'Primary|DONATION|2025-01',
  period: AggregationPeriod.Month,
});

describe('getPendingLabel', () => {
  it('labels a pending itemized transaction', () => {
    expect(getPendingLabel(transaction('1', true), i18n.t)).toBe('Pending');
  });

  it('returns null for a transaction that is not pending', () => {
    expect(getPendingLabel(transaction('1', false), i18n.t)).toBeNull();
  });

  it('counts the pending transactions in a partly pending rollup', () => {
    const members = [
      transaction('1', true),
      transaction('2', true),
      transaction('3', false),
      transaction('4', false),
      transaction('5', false),
    ];

    expect(getPendingLabel(rollup(members), i18n.t)).toBe('Pending 2 of 5');
  });

  it('labels a fully pending rollup without a count', () => {
    const members = [transaction('1', true), transaction('2', true)];

    expect(getPendingLabel(rollup(members), i18n.t)).toBe('Pending');
  });

  it('returns null for a rollup with nothing pending', () => {
    expect(
      getPendingLabel(rollup([transaction('1', false)]), i18n.t),
    ).toBeNull();
  });
});
