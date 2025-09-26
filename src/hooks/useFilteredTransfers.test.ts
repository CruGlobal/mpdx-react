import { renderHook } from '@testing-library/react';
import { DateTime } from 'luxon';
import { Transactions } from 'src/components/Reports/SavingsFundTransfer/mockData';
import { useFilteredTransfers } from './useFilteredTransfers';

const mockToday = DateTime.fromISO('2024-01-15');

const mockTransactions: Transactions[] = [
  {
    id: '1',
    amount: 2500,
    description: null,
    transactedAt: DateTime.fromISO('2023-09-26'),
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
    failedStatus: false,
    failedCount: 0,
  },
  {
    id: '2',
    amount: 20,
    description: null,
    transactedAt: DateTime.fromISO('2023-09-15'),
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
      recurringStart: DateTime.fromISO('2023-09-15'),
      recurringEnd: DateTime.fromISO('2023-12-15'),
      active: true,
    },
    baseAmount: 20,
    failedStatus: false,
    failedCount: 0,
  },
  {
    id: '3',
    amount: 20,
    description: null,
    transactedAt: DateTime.fromISO('2023-10-15'),
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
      recurringStart: DateTime.fromISO('2023-09-15'),
      recurringEnd: DateTime.fromISO('2023-12-15'),
      active: true,
    },
    baseAmount: 20,
    failedStatus: false,
    failedCount: 0,
  },
  {
    id: '4',
    amount: -10,
    description: null,
    transactedAt: DateTime.fromISO('2023-11-29'),
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
    failedStatus: false,
    failedCount: 0,
  },
  {
    id: '5',
    amount: 20,
    description: null,
    transactedAt: DateTime.fromISO('2023-12-15'),
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
      recurringStart: DateTime.fromISO('2023-09-15'),
      recurringEnd: DateTime.fromISO('2023-12-15'),
      active: true,
    },
    baseAmount: 20,
    failedStatus: false,
    failedCount: 0,
  },
];

describe('useFilteredTransfers', () => {
  it('should return the correct number of filtered transfers', () => {
    const { result } = renderHook(() =>
      useFilteredTransfers(mockTransactions, mockToday),
    );
    expect(result.current).toHaveLength(3);
  });

  it('should correctly add amounts for recurring transfers', () => {
    const { result } = renderHook(() => useFilteredTransfers(mockTransactions));
    const recurringTransfer = result.current.find(
      (tx) => tx.recurringTransfer?.id === '1',
    );
    expect(recurringTransfer).toBeDefined();
    expect(recurringTransfer?.amount).toBe(60);
  });

  it('should include one-time transfers', () => {
    const { result } = renderHook(() =>
      useFilteredTransfers(mockTransactions, mockToday),
    );
    const oneTimeTransfer = result.current.find(
      (tx) => tx.recurringTransfer === null,
    );
    expect(oneTimeTransfer).toBeDefined();
    expect(oneTimeTransfer?.amount).toBe(2500);
  });

  it('should exclude transfers with zero or negative amounts', () => {
    const { result } = renderHook(() =>
      useFilteredTransfers(mockTransactions, mockToday),
    );
    const negativeAmountTransfer = result.current.find((tx) => tx.amount < 0);
    expect(negativeAmountTransfer).toBeUndefined();
  });

  it('should correctly calculate failedCount for recurring transfers', () => {
    const { result } = renderHook(() =>
      useFilteredTransfers(mockTransactions, mockToday),
    );
    const recurringTransfer = result.current.find(
      (tx) => tx.recurringTransfer?.id === '1',
    );
    expect(recurringTransfer).toBeDefined();
    expect(recurringTransfer?.failedCount).toBe(1);
  });
});
