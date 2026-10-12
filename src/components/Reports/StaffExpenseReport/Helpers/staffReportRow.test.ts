import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import { ReportType } from './StaffReportEnum';
import { AggregationPeriod } from './aggregationPolicy';
import { GroupedTransaction, Transaction } from './filterTransactions';
import { buildStaffReportRows } from './staffReportRow';

const locale = 'en-US';

const transaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: '1',
  amount: -150,
  transactedAt: '2025-09-02',
  fundType: 'Primary',
  category: StaffExpenseCategoryEnum.Other,
  displayCategory: 'Other',
  ...overrides,
});

const rollup = (members: Transaction[]): GroupedTransaction => ({
  ...transaction({
    id: 'grouped-Primary|DONATION|2025-01',
    amount: 250,
    transactedAt: '2025-01-01',
    category: StaffExpenseCategoryEnum.Donation,
    displayCategory: 'Donations',
    description: 'Donations',
  }),
  groupedTransactions: members,
  bucketKey: 'Primary|DONATION|2025-01',
  period: AggregationPeriod.Month,
});

const buildRow = (
  row: Transaction | GroupedTransaction,
  tableType: ReportType.Income | ReportType.Expense = ReportType.Expense,
) => buildStaffReportRows([row], tableType, locale)[0];

describe('buildStaffReportRows', () => {
  describe('description', () => {
    it("uses the transaction's own description", () => {
      expect(
        buildRow(transaction({ description: 'Conference Registration' }))
          .description,
      ).toBe('Conference Registration');
    });

    it('falls back to the category label', () => {
      expect(buildRow(transaction({ description: null })).description).toBe(
        'Other',
      );
    });
  });

  describe('dateLabel', () => {
    it('shows the day for an itemized transaction', () => {
      expect(buildRow(transaction()).dateLabel).toBe('Sep 2, 2025');
    });

    it('shows the month and year for a monthly rollup', () => {
      expect(buildRow(rollup([]), ReportType.Income).dateLabel).toBe(
        'January 2025',
      );
    });
  });

  describe('amountLabel', () => {
    it('shows expenses as positive', () => {
      const row = buildRow(transaction({ amount: -2724 }));

      expect(row.amountLabel).toBe('$2,724');
      expect(row.amount).toBe(-2724);
    });

    it('shows income as is', () => {
      expect(
        buildRow(transaction({ amount: 3500 }), ReportType.Income).amountLabel,
      ).toBe('$3,500');
    });
  });

  describe('pending', () => {
    it('is null for a transaction that is not pending', () => {
      expect(buildRow(transaction({ isPending: false })).pending).toBeNull();
    });

    it('counts a pending itemized transaction as one of one', () => {
      expect(buildRow(transaction({ isPending: true })).pending).toEqual({
        count: 1,
        total: 1,
      });
    });

    it('counts the pending members of a rollup', () => {
      const members = [
        transaction({ id: '1', isPending: true }),
        transaction({ id: '2', isPending: true }),
        transaction({ id: '3', isPending: false }),
      ];

      expect(buildRow(rollup(members), ReportType.Income).pending).toEqual({
        count: 2,
        total: 3,
      });
    });

    it('is null for a rollup with nothing pending', () => {
      expect(
        buildRow(rollup([transaction({ isPending: false })]), ReportType.Income)
          .pending,
      ).toBeNull();
    });
  });

  it('keeps the order it was given', () => {
    const rows = buildStaffReportRows(
      [
        transaction({ id: 'a', transactedAt: '2025-09-01', description: 'A' }),
        transaction({ id: 'b', transactedAt: '2025-09-03', description: 'B' }),
        transaction({ id: 'c', transactedAt: '2025-09-02', description: 'C' }),
      ],
      ReportType.Expense,
      locale,
    );

    expect(rows.map(({ description }) => description)).toEqual(['A', 'B', 'C']);
  });

  it('links a rollup to its grouped transaction', () => {
    const grouped = rollup([]);

    expect(buildRow(grouped, ReportType.Income).groupedTransaction).toBe(
      grouped,
    );
    expect(buildRow(transaction()).groupedTransaction).toBeUndefined();
  });
});
