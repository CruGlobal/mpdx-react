import { DateTime, Settings } from 'luxon';
import { Transactions } from 'src/components/Reports/SavingsFundTransfer/mockData';
import { filteredTransfers } from './filterTransfers';

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
];

describe('useFilteredTransfers', () => {
  beforeEach(() => {
    Settings.now = () => Date.parse('2024-01-15');
  });

  it('should return the correct number of transfers', () => {
    const { filtered, upcoming } = filteredTransfers(mockTransactions);
    expect(filtered).toHaveLength(2);
    expect(upcoming).toHaveLength(1);
  });

  it('should correctly add amounts for recurring transfers', () => {
    const { filtered } = filteredTransfers(mockTransactions);
    const recurringTransfer = filtered.find(
      (tx) => tx.recurringTransfer?.id === '1',
    );
    expect(recurringTransfer?.transaction?.amount).toBe(60);
  });

  it('should include one-time transfers', () => {
    const { filtered } = filteredTransfers(mockTransactions);
    const oneTimeTransfer = filtered.find(
      (tx) => tx.recurringTransfer === null,
    );
    expect(oneTimeTransfer).toBeDefined();
    expect(oneTimeTransfer?.transaction?.amount).toBe(2500);
  });

  it('should exclude transfers with zero or negative amounts', () => {
    const { filtered } = filteredTransfers(mockTransactions);
    const negativeAmountTransfer = filtered.find(
      (tx) => tx.transaction!.amount < 0,
    );
    expect(negativeAmountTransfer).toBeUndefined();
  });

  it('should correctly calculate failedCount for recurring transfers', () => {
    const { filtered } = filteredTransfers(mockTransactions);
    const recurringTransfer = filtered.find(
      (tx) => tx.recurringTransfer?.id === '1',
    );
    expect(recurringTransfer?.failedCount).toBe(1);
  });

  it('should find missing months for recurring transfers', () => {
    const { filtered } = filteredTransfers(mockTransactions);
    const recurringTransfer = filtered.find(
      (tx) => tx.recurringTransfer?.id === '1',
    );
    expect(
      recurringTransfer?.missingMonths?.map((month) => month.toISODate()),
    ).toEqual(['2023-11-15']);
  });
});
