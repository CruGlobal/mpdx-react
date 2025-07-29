import { DateTime } from 'luxon';
import { Fund } from 'src/graphql/types.generated';
import { filterTransactions } from './filterTransactions';

/* Tests for category filtering need to be written still */

describe('filterTransactions', () => {
  const mockFund: Fund = {
    fundType: 'Primary',
    total: -500,
    categories: [
      {
        category: 'Contributions',
        total: -300,
        averagePerMonth: -100,
        subcategories: [
          {
            subCategory: 'Salary',
            total: -200,
            averagePerMonth: -50,
            breakdownByMonth: [
              {
                month: '2025-01-01',
                total: -100,
                __typename: 'BreakdownByMonth',
              },
              {
                month: '2025-02-01',
                total: -100,
                __typename: 'BreakdownByMonth',
              },
            ],
          },
          {
            subCategory: 'Benefits',
            total: -100,
            averagePerMonth: -50,
            breakdownByMonth: [
              {
                month: '2025-01-01',
                total: -50,
                __typename: 'BreakdownByMonth',
              },
              {
                month: '2025-02-01',
                total: -50,
                __typename: 'BreakdownByMonth',
              },
            ],
          },
        ],
        breakdownByMonth: [
          { month: '2025-01-01', total: -150, __typename: 'BreakdownByMonth' },
          { month: '2025-02-01', total: -150, __typename: 'BreakdownByMonth' },
        ],
      },
    ],
  } as Fund;

  it('filters transactions for the target month by default', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
    let result = filterTransactions(mockFund, targetTime, {
      selectedDateRange: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    expect(result).toHaveLength(2);

    result = filterTransactions(mockFund, targetTime);
    expect(result).toHaveLength(2);
  });

  it('filters transactions by custom date range', () => {
    const targetTime = DateTime.fromISO('2024-06-15');
    const result = filterTransactions(mockFund, targetTime, {
      selectedDateRange: undefined,
      startDate: DateTime.fromISO('2025-01-01'),
      endDate: DateTime.fromISO('2025-02-03'),
    });
    expect(result).toHaveLength(4);
  });

  it('returns empty array if no main categories', () => {
    const emptyFund = { ...mockFund, categories: undefined };
    const targetTime = DateTime.fromISO('2024-06-01');
    const result = filterTransactions(emptyFund, targetTime);
    expect(result).toEqual([]);
  });

  it('returns empty array if no transactions in range and custom date range not selected', () => {
    const targetTime = DateTime.fromISO('2023-01-01');
    const result = filterTransactions(mockFund, targetTime);
    expect(result).toEqual([]);
  });

  it('returns empty array if no transactions in range with custom date range', () => {
    const targetTime = DateTime.fromISO('2024-06-01');
    const result = filterTransactions(mockFund, targetTime, {
      selectedDateRange: undefined,
      startDate: DateTime.fromISO('2025-04-01'),
      endDate: DateTime.fromISO('2025-06-03'),
    });
    expect(result).toEqual([]);
  });
});
