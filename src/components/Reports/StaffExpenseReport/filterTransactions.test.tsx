import { DateTime } from 'luxon';
import {
  Fund,
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { DateRange } from './Helpers/StaffReportEnum';
import { filterTransactions } from './filterTransactions';

describe('filterTransactions', () => {
  const mockFund: Fund = {
    id: 'fund-1',
    fundType: 'Primary',
    balance: 1000,
    deficitLimit: 0,
    total: -500,
    categories: [
      {
        category: StaffExpenseCategoryEnum.AdditionalSalary,
        total: -300,
        averagePerMonth: -100,
        subcategories: [
          {
            subCategory: StaffExpensesSubCategoryEnum.AdditionalSalary,
            total: -200,
            averagePerMonth: -50,
            breakdownByMonth: [
              {
                month: '2025-02-01',
                total: -100,
                transactions: [
                  {
                    id: 'transaction-1',
                    amount: 100,
                    transactedAt: '2025-01-15',
                    description: 'January Additional Salary',
                  },
                  {
                    id: 'transaction-2',
                    amount: -100,
                    transactedAt: '2025-01-20',
                    description: 'Star Wars Costume',
                  },
                  {
                    id: 'transaction-3',
                    amount: -1000,
                    transactedAt: '2025-01-24',
                    description: 'January Additional Salary',
                  },
                ],
              },
            ],
          },
        ],
        breakdownByMonth: [{ month: '2025-01-01', total: -150 }],
      },
    ],
  };

  it('filters transactions for the target month by default', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
    const result = filterTransactions({
      fund: mockFund,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [],
      },
      targetTime,
    });
    expect(result).toHaveLength(3);
  });

  it('filters transactions by custom date range', () => {
    const targetTime = DateTime.fromISO('2024-06-15');
    const result = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: DateTime.fromISO('2025-01-01'),
        endDate: DateTime.fromISO('2025-02-03'),
        categories: [],
      },
    });
    expect(result).toHaveLength(3);
  });

  it('returns empty array if no main categories', () => {
    const emptyFund = { ...mockFund, categories: null };
    const targetTime = DateTime.fromISO('2024-06-01');
    const result = filterTransactions({
      fund: emptyFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: DateTime.fromISO('2025-01-01'),
        endDate: DateTime.fromISO('2025-02-03'),
        categories: [],
      },
    });
    expect(result).toEqual([]);
  });

  it('returns empty array if no transactions in range and custom date range not selected', () => {
    const targetTime = DateTime.fromISO('2023-01-01');
    const result = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [],
      },
    });
    expect(result).toEqual([]);
  });

  it('returns empty array if no transactions in range with custom date range', () => {
    const targetTime = DateTime.fromISO('2024-06-01');
    const result = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: DateRange.YearToDate,
        startDate: DateTime.fromISO('2025-04-01'),
        endDate: DateTime.fromISO('2025-06-03'),
        categories: [],
      },
    });
    expect(result).toEqual([]);
  });
});
