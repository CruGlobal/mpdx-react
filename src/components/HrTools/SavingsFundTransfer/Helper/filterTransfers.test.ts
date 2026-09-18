import { DateTime, Settings } from 'luxon';
import { Transactions } from 'src/components/HrTools/SavingsFundTransfer/mockData';
import { filteredTransfers } from './filterTransfers';

// Earlier than every fixture below, so the window never clips a scan unless a test wants it to.
const historyStart = DateTime.fromISO('2023-01-01');

const mockTransactions: Transactions[] = [
  {
    transaction: {
      id: '1',
      amount: 2500,
      description: null,
      transactedAt: DateTime.fromISO('2023-09-26'),
    },
    subCategory: {
      id: '1',
      name: 'deposit',
    },
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer: null,
    baseAmount: 2500,
    failedCount: 0,
  },
  {
    transaction: {
      id: '2',
      amount: 20,
      description: null,
      transactedAt: DateTime.fromISO('2023-09-15'),
    },
    subCategory: {
      id: '1',
      name: 'deposit',
    },
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer: {
      id: '1',
      amount: 20,
      recurringStart: DateTime.fromISO('2023-09-15'),
      recurringEnd: DateTime.fromISO('2023-12-15'),
      active: true,
    },
    baseAmount: 20,
    failedCount: 0,
  },
  {
    transaction: {
      id: '3',
      amount: 20,
      description: null,
      transactedAt: DateTime.fromISO('2023-10-15'),
    },
    subCategory: {
      id: '1',
      name: 'deposit',
    },
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer: {
      id: '1',
      amount: 20,
      recurringStart: DateTime.fromISO('2023-09-15'),
      recurringEnd: DateTime.fromISO('2023-12-15'),
      active: true,
    },
    baseAmount: 20,
    failedCount: 0,
  },
  {
    transaction: {
      id: '4',
      amount: -10,
      description: null,
      transactedAt: DateTime.fromISO('2023-11-29'),
    },
    subCategory: {
      id: '2',
      name: 'withdrawal',
    },
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer: null,
    baseAmount: -10,
    failedCount: 0,
  },
  {
    transaction: {
      id: '5',
      amount: 20,
      description: null,
      transactedAt: DateTime.fromISO('2023-12-15'),
    },
    subCategory: {
      id: '1',
      name: 'deposit',
    },
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer: {
      id: '1',
      amount: 20,
      recurringStart: DateTime.fromISO('2023-09-15'),
      recurringEnd: DateTime.fromISO('2023-12-15'),
      active: true,
    },
    baseAmount: 20,
    failedCount: 0,
  },
  {
    transaction: null,
    subCategory: null,
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer: {
      id: '2',
      amount: 10,
      recurringStart: DateTime.fromISO('2024-04-15'),
      recurringEnd: DateTime.fromISO('2024-07-15'),
      active: true,
    },
    baseAmount: 10,
    failedCount: 0,
  },
  {
    transaction: null,
    subCategory: null,
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer: null,
    scheduledTransfer: {
      id: 'sched-1',
      amount: 400,
      transactedAt: DateTime.fromISO('2024-02-01'),
      description: 'Conference fee',
    },
    baseAmount: 400,
    failedCount: 0,
  },
];

// One positive $20 transaction per date, all tied to the same recurring transfer.
const makeRecurringTransactions = ({
  id,
  recurringStart,
  recurringEnd = null,
  active = true,
  dates,
}: {
  id: string;
  recurringStart: string;
  recurringEnd?: string | null;
  active?: boolean;
  dates: string[];
}): Transactions[] => {
  const recurringTransfer = {
    id,
    amount: 20,
    recurringStart: DateTime.fromISO(recurringStart),
    recurringEnd: recurringEnd ? DateTime.fromISO(recurringEnd) : null,
    active,
  };
  return dates.map((date, index) => ({
    transaction: {
      id: `${id}-${index}`,
      amount: 20,
      description: null,
      transactedAt: DateTime.fromISO(date),
    },
    subCategory: {
      id: '1',
      name: 'deposit',
    },
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer,
    baseAmount: 20,
    failedCount: 0,
  }));
};

describe('useFilteredTransfers', () => {
  beforeEach(() => {
    Settings.now = () => Date.parse('2024-01-15');
  });

  it('should return the correct number of transfers', () => {
    const { filtered, upcoming } = filteredTransfers(
      mockTransactions,
      historyStart,
    );
    expect(filtered).toHaveLength(2);
    // upcoming holds the future-dated recurring transfer and the scheduled transfer
    expect(upcoming).toHaveLength(2);
  });

  it('should route a pending scheduled transfer to upcoming without summarizing it', () => {
    const { filtered, upcoming } = filteredTransfers(
      mockTransactions,
      historyStart,
    );

    const scheduled = upcoming.filter((tx) => tx.scheduledTransfer);
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0].scheduledTransfer?.id).toBe('sched-1');
    expect(scheduled[0].summarizedTransfers).toBeUndefined();
    expect(filtered.every((tx) => !tx.scheduledTransfer)).toBe(true);
  });

  it('should correctly add amounts for recurring transfers', () => {
    const { filtered } = filteredTransfers(mockTransactions, historyStart);
    const recurringTransfer = filtered.find(
      (tx) => tx.recurringTransfer?.id === '1',
    );
    expect(recurringTransfer?.transaction?.amount).toBe(60);
  });

  it('should include one-time transfers', () => {
    const { filtered } = filteredTransfers(mockTransactions, historyStart);
    const oneTimeTransfer = filtered.find(
      (tx) => tx.recurringTransfer === null,
    );
    expect(oneTimeTransfer).toBeDefined();
    expect(oneTimeTransfer?.transaction?.amount).toBe(2500);
  });

  it('should exclude transfers with zero or negative amounts', () => {
    const { filtered } = filteredTransfers(mockTransactions, historyStart);
    const negativeAmountTransfer = filtered.find(
      (tx) => tx.transaction!.amount < 0,
    );
    expect(negativeAmountTransfer).toBeUndefined();
  });

  it('should correctly calculate failedCount for recurring transfers', () => {
    const { filtered } = filteredTransfers(mockTransactions, historyStart);
    const recurringTransfer = filtered.find(
      (tx) => tx.recurringTransfer?.id === '1',
    );
    expect(recurringTransfer?.failedCount).toBe(1);
  });

  it('should find missing months for recurring transfers', () => {
    const { filtered } = filteredTransfers(mockTransactions, historyStart);
    const recurringTransfer = filtered.find(
      (tx) => tx.recurringTransfer?.id === '1',
    );
    expect(
      recurringTransfer?.missingMonths?.map((month) => month.toISODate()),
    ).toEqual(['2023-11-15']);
  });

  describe('stopped recurring transfers', () => {
    // Started in September, ran September and November, then stopped.
    const makeStoppedTransactions = (recurringEnd: string | null) =>
      makeRecurringTransactions({
        id: '3',
        recurringStart: '2023-09-15',
        recurringEnd,
        active: false,
        dates: ['2023-09-15', '2023-11-15'],
      });

    it('should not count months after the last transaction as missing when stopped with no end date', () => {
      const { filtered } = filteredTransfers(
        makeStoppedTransactions(null),
        historyStart,
      );
      const stoppedTransfer = filtered.find(
        (tx) => tx.recurringTransfer?.id === '3',
      );
      expect(
        stoppedTransfer?.missingMonths?.map((month) => month.toISODate()),
      ).toEqual(['2023-10-15']);
      expect(stoppedTransfer?.failedCount).toBe(1);
    });

    it('should not count months after the last transaction as missing when stopped before a future end date', () => {
      const { filtered } = filteredTransfers(
        makeStoppedTransactions('2024-06-15'),
        historyStart,
      );
      const stoppedTransfer = filtered.find(
        (tx) => tx.recurringTransfer?.id === '3',
      );
      expect(
        stoppedTransfer?.missingMonths?.map((month) => month.toISODate()),
      ).toEqual(['2023-10-15']);
      expect(stoppedTransfer?.failedCount).toBe(1);
    });

    it('should scan through the end date for inactive transfers that ended naturally', () => {
      const { filtered } = filteredTransfers(
        makeStoppedTransactions('2023-12-15'),
        historyStart,
      );
      const endedTransfer = filtered.find(
        (tx) => tx.recurringTransfer?.id === '3',
      );
      expect(
        endedTransfer?.missingMonths?.map((month) => month.toISODate()),
      ).toEqual(['2023-10-15', '2023-12-15']);
      expect(endedTransfer?.failedCount).toBe(2);
    });

    it('should scan through the end date when a stopped transfer ends today', () => {
      const { filtered } = filteredTransfers(
        makeStoppedTransactions('2024-01-15'),
        historyStart,
      );
      const endedTransfer = filtered.find(
        (tx) => tx.recurringTransfer?.id === '3',
      );
      expect(
        endedTransfer?.missingMonths?.map((month) => month.toISODate()),
      ).toEqual(['2023-10-15', '2023-12-15', '2024-01-15']);
      expect(endedTransfer?.failedCount).toBe(3);
    });
  });

  describe('history window', () => {
    // The page only requests about the last year of transactions, so a long-running recurring
    // transfer has no rows before the window even when every month ran successfully.
    const makeLongRunningTransactions = (
      dates: string[],
      recurringStart = '2022-06-15',
    ) => makeRecurringTransactions({ id: '4', recurringStart, dates });

    it('should not count months before the history window as missing, and flag the history as truncated', () => {
      const { filtered } = filteredTransfers(
        makeLongRunningTransactions([
          '2023-01-15',
          '2023-02-15',
          '2023-03-15',
          '2023-04-15',
          '2023-05-15',
          '2023-06-15',
          '2023-07-15',
          '2023-08-15',
          '2023-09-15',
          '2023-10-15',
          '2023-11-15',
          '2023-12-15',
          '2024-01-15',
        ]),
        historyStart,
      );
      const longRunning = filtered.find(
        (tx) => tx.recurringTransfer?.id === '4',
      );
      expect(longRunning?.missingMonths).toEqual([]);
      expect(longRunning?.failedCount).toBe(0);
      expect(longRunning?.historyTruncated).toBe(true);
    });

    it('should still flag a missed month inside the history window', () => {
      const { filtered } = filteredTransfers(
        makeLongRunningTransactions([
          '2023-01-15',
          '2023-02-15',
          '2023-03-15',
          '2023-04-15',
          '2023-05-15',
          '2023-06-15',
          '2023-07-15',
          '2023-08-15',
          '2023-09-15',
          '2023-10-15',
          '2023-12-15',
          '2024-01-15',
        ]),
        historyStart,
      );
      const longRunning = filtered.find(
        (tx) => tx.recurringTransfer?.id === '4',
      );
      expect(
        longRunning?.missingMonths?.map((month) => month.toISODate()),
      ).toEqual(['2023-11-15']);
      expect(longRunning?.failedCount).toBe(1);
    });

    it('should keep the recurring day of month when the first scanned month is missing', () => {
      const { filtered } = filteredTransfers(
        makeLongRunningTransactions(
          [
            '2023-02-20',
            '2023-03-20',
            '2023-04-20',
            '2023-05-20',
            '2023-06-20',
            '2023-07-20',
            '2023-08-20',
            '2023-09-20',
            '2023-10-20',
            '2023-11-20',
            '2023-12-20',
            '2024-01-20',
          ],
          '2022-06-20',
        ),
        historyStart,
      );
      const longRunning = filtered.find(
        (tx) => tx.recurringTransfer?.id === '4',
      );
      expect(
        longRunning?.missingMonths?.map((month) => month.toISODate()),
      ).toEqual(['2023-01-20']);
    });

    it('should scan from recurringStart, and not flag the history as truncated, when it is inside the window', () => {
      const { filtered } = filteredTransfers(
        makeLongRunningTransactions(['2023-10-15', '2024-01-15'], '2023-09-15'),
        historyStart,
      );
      const longRunning = filtered.find(
        (tx) => tx.recurringTransfer?.id === '4',
      );
      expect(
        longRunning?.missingMonths?.map((month) => month.toISODate()),
      ).toEqual(['2023-09-15', '2023-11-15', '2023-12-15']);
      expect(longRunning?.historyTruncated).toBe(false);
    });
  });
});
