import { renderHook } from '@testing-library/react';
import { DateTime } from 'luxon';
import { Transactions } from 'src/components/Reports/SavingsFundTransfer/mockData';
import { useFilteredTransfers } from './useFilteredTransfers';

const mockTransactions: Transactions[] = [
  {
    id: '12345',
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
  },
  {
    id: '67890',
    amount: 1200,
    description: null,
    transactedAt: DateTime.fromISO('2023-09-30'),
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
      recurringStart: DateTime.fromISO('2023-09-30'),
      recurringEnd: DateTime.fromISO('2025-09-30'),
      active: true,
    },
  },
  {
    id: '64674',
    amount: 300,
    description: null,
    transactedAt: DateTime.fromISO('2023-10-30'),
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
      recurringStart: DateTime.fromISO('2023-09-30'),
      recurringEnd: DateTime.fromISO('2025-09-30'),
      active: true,
    },
  },
];

describe('useFilteredTransfers', () => {
  it('should return the correct number of filtered transfers', () => {
    const { result } = renderHook(() => useFilteredTransfers(mockTransactions));
    expect(result.current).toHaveLength(2);
  });

  it('should correctly add amounts for recurring transfers', () => {
    const { result } = renderHook(() => useFilteredTransfers(mockTransactions));
    const recurringTransfer = result.current.find(
      (tx) => tx.recurringTransfer?.id === '1',
    );
    expect(recurringTransfer).toBeDefined();
    expect(recurringTransfer?.amount).toBe(1500);
  });

  it('should include one-time transfers', () => {
    const { result } = renderHook(() => useFilteredTransfers(mockTransactions));
    const oneTimeTransfer = result.current.find(
      (tx) => tx.recurringTransfer === null,
    );
    expect(oneTimeTransfer).toBeDefined();
    expect(oneTimeTransfer?.amount).toBe(2500);
  });
});
