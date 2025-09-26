import { DateTime } from 'luxon';
import { Transactions } from '../mockData';
import { getStatusLabel } from './getStatus';

const fixed: DateTime = DateTime.utc(2023, 12, 15);
jest.spyOn(DateTime, 'now').mockReturnValue(fixed);

const mockData: Transactions[] = [
  {
    id: '1',
    amount: 100,
    description: 'One-time transfer',
    transactedAt: DateTime.fromISO('2023-10-01'),
    subCategory: { id: '1', name: 'General' },
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer: {
      id: null,
      recurringStart: null,
      recurringEnd: null,
      active: null,
    },
    failedStatus: false,
    failedCount: 0,
    baseAmount: 100,
  },
  {
    id: '2',
    amount: 200,
    description: 'Recurring transfer',
    transactedAt: DateTime.fromISO('2023-10-01'),
    subCategory: { id: '1', name: 'General' },
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer: {
      id: '1',
      recurringStart: DateTime.fromISO('2022-10-01'),
      recurringEnd: DateTime.fromISO('2023-01-01'),
      active: true,
    },
    failedStatus: false,
    failedCount: 0,
    baseAmount: 200,
  },
  {
    id: '3',
    amount: 300,
    description: 'Ended recurring transfer',
    transactedAt: DateTime.fromISO('2022-10-01'),
    subCategory: { id: '1', name: 'General' },
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer: {
      id: '2',
      recurringStart: DateTime.fromISO('2022-01-01'),
      recurringEnd: null,
      active: true,
    },
    failedStatus: false,
    failedCount: 0,
    baseAmount: 300,
  },
  {
    id: '4',
    amount: 400,
    description: 'Ongoing recurring transfer',
    transactedAt: DateTime.fromISO('2023-11-01'),
    subCategory: { id: '1', name: 'General' },
    transfer: {
      sourceFundTypeName: 'Primary',
      destinationFundTypeName: 'Savings',
    },
    recurringTransfer: {
      id: '3',
      recurringStart: DateTime.fromISO('2023-11-01'),
      recurringEnd: DateTime.fromISO('2024-12-31'),
      active: true,
    },
    failedStatus: false,
    failedCount: 0,
    baseAmount: 400,
  },
];

describe('createTable', () => {
  it('should return complete status if no recurring transfer id', () => {
    const transfer = mockData[0];
    expect(transfer.recurringTransfer?.id).toBeNull();
    expect(getStatusLabel(transfer)).toBe('complete');
  });

  it('should return ongoing status if end date is null', () => {
    const status = mockData[2];
    expect(status.recurringTransfer?.recurringEnd).toBeNull();
    expect(getStatusLabel(status)).toBe('ongoing');
  });

  it('should return ended status if end date is in the past', () => {
    const status = mockData[1];
    expect(getStatusLabel(status)).toBe('ended');
  });

  it('should return ongoing status if end date is in the future', () => {
    const status = mockData[3];
    expect(getStatusLabel(status)).toBe('ongoing');
  });
});
