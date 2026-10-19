import { DateTime, Settings } from 'luxon';
import {
  RecurringTransferFailure,
  Transactions,
} from 'src/components/HrTools/SavingsFundTransfer/mockData';
import { SavingsFundTransferFailureReasonCode } from 'src/graphql/types.generated';
import { filteredTransfers } from './filterTransfers';

// Earlier than every fixture below, so history is never truncated unless a test wants it to.
const historyStart = DateTime.fromISO('2023-01-01');

const novemberFailure: RecurringTransferFailure = {
  occurrence: DateTime.fromISO('2023-11-15'),
  reasonCode: SavingsFundTransferFailureReasonCode.InsufficientFunds,
};

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
      failures: [novemberFailure],
    },
    baseAmount: 20,
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
      failures: [novemberFailure],
    },
    baseAmount: 20,
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
      failures: [novemberFailure],
    },
    baseAmount: 20,
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
      failures: [],
    },
    baseAmount: 10,
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
  },
];

// One positive $20 transaction per date, all tied to the same recurring transfer.
const makeRecurringTransactions = ({
  id,
  recurringStart,
  recurringEnd = null,
  active = true,
  dates,
  failures = [],
}: {
  id: string;
  recurringStart: string;
  recurringEnd?: string | null;
  active?: boolean;
  dates: string[];
  failures?: RecurringTransferFailure[];
}): Transactions[] => {
  const recurringTransfer = {
    id,
    amount: 20,
    recurringStart: DateTime.fromISO(recurringStart),
    recurringEnd: recurringEnd ? DateTime.fromISO(recurringEnd) : null,
    active,
    failures,
  };
  const transfer = {
    sourceFundTypeName: 'Primary',
    destinationFundTypeName: 'Savings',
  };
  if (!dates.length) {
    return [
      {
        transaction: null,
        subCategory: null,
        transfer,
        recurringTransfer,
        baseAmount: 20,
      },
    ];
  }
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
    transfer,
    recurringTransfer,
    baseAmount: 20,
  }));
};

const makeFailure = (
  occurrence: string,
  reasonCode: SavingsFundTransferFailureReasonCode = SavingsFundTransferFailureReasonCode.InsufficientFunds,
): RecurringTransferFailure => ({
  occurrence: DateTime.fromISO(occurrence),
  reasonCode,
});

describe('filteredTransfers', () => {
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
    expect(recurringTransfer?.summarizedTransfers?.size).toBe(3);
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
      (tx) => (tx.transaction?.amount ?? 0) < 0,
    );
    expect(negativeAmountTransfer).toBeUndefined();
  });

  it('should not infer failures from months with no transaction', () => {
    const { filtered } = filteredTransfers(
      makeRecurringTransactions({
        id: '3',
        recurringStart: '2023-09-15',
        dates: ['2023-09-15', '2024-01-15'],
      }),
      historyStart,
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].recurringTransfer?.failures).toHaveLength(0);
  });

  it('should count December and February failures around a successful January', () => {
    Settings.now = () => Date.parse('2025-03-20');
    const { filtered } = filteredTransfers(
      makeRecurringTransactions({
        id: '7',
        recurringStart: '2024-11-15',
        dates: ['2024-11-15', '2025-01-15', '2025-03-15'],
        failures: [
          makeFailure('2024-12-15'),
          makeFailure(
            '2025-02-15',
            SavingsFundTransferFailureReasonCode.NotAttempted,
          ),
        ],
      }),
      historyStart,
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].transaction?.amount).toBe(60);
    expect(filtered[0].recurringTransfer?.failures).toHaveLength(2);
    expect(
      filtered[0].recurringTransfer?.failures.map((failure) =>
        failure.occurrence.toISODate(),
      ),
    ).toEqual(['2024-12-15', '2025-02-15']);
  });

  describe('recurring transfer that never succeeded', () => {
    const neverSucceeded = makeRecurringTransactions({
      id: '8',
      recurringStart: '2023-11-15',
      dates: [],
      failures: [makeFailure('2023-11-15'), makeFailure('2023-12-15')],
    });

    it('should stay in upcoming while ongoing and also go to history', () => {
      const { filtered, upcoming } = filteredTransfers(
        neverSucceeded,
        historyStart,
      );
      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].recurringTransfer?.id).toBe('8');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].transaction).toBeNull();
      expect(filtered[0].recurringTransfer?.failures).toHaveLength(2);
      expect(filtered[0].summarizedTransfers?.size).toBe(0);
    });

    it('should only go to history once stopped', () => {
      const { filtered, upcoming } = filteredTransfers(
        makeRecurringTransactions({
          id: '8',
          recurringStart: '2023-11-15',
          active: false,
          dates: [],
          failures: [makeFailure('2023-11-15')],
        }),
        historyStart,
      );
      expect(upcoming).toHaveLength(0);
      expect(filtered).toHaveLength(1);
    });

    it('should not duplicate the upcoming row SAA also sends for the same recurring transfer', () => {
      const { upcoming } = filteredTransfers(
        [
          ...neverSucceeded,
          ...makeRecurringTransactions({
            id: '8',
            recurringStart: '2023-11-15',
            dates: [],
          }),
        ],
        historyStart,
      );
      expect(upcoming).toHaveLength(1);
    });

    it('should merge into the same row as transactions for the same recurring transfer', () => {
      const withLaterSuccess = [
        ...neverSucceeded,
        ...makeRecurringTransactions({
          id: '8',
          recurringStart: '2023-11-15',
          dates: ['2024-01-15'],
          failures: neverSucceeded[0].recurringTransfer!.failures,
        }),
      ];
      const { filtered } = filteredTransfers(withLaterSuccess, historyStart);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].transaction?.amount).toBe(20);
      expect(filtered[0].summarizedTransfers?.size).toBe(1);
      expect(filtered[0].recurringTransfer?.failures).toHaveLength(2);
    });
  });

  it('should keep a recurring transfer with no transaction and no failures in upcoming', () => {
    const { filtered, upcoming } = filteredTransfers(
      makeRecurringTransactions({
        id: '9',
        recurringStart: '2024-02-15',
        dates: [],
      }),
      historyStart,
    );
    expect(filtered).toHaveLength(0);
    expect(upcoming).toHaveLength(1);
  });

  describe('history window', () => {
    it('should flag the history as truncated when the recurring transfer started before the window', () => {
      const { filtered } = filteredTransfers(
        makeRecurringTransactions({
          id: '4',
          recurringStart: '2022-06-15',
          dates: ['2023-01-15'],
        }),
        historyStart,
      );
      expect(filtered[0].historyTruncated).toBe(true);
    });

    it('should not flag the history as truncated when the recurring transfer started inside the window', () => {
      const { filtered } = filteredTransfers(
        makeRecurringTransactions({
          id: '4',
          recurringStart: '2023-09-15',
          dates: ['2023-10-15'],
        }),
        historyStart,
      );
      expect(filtered[0].historyTruncated).toBe(false);
    });
  });
});
