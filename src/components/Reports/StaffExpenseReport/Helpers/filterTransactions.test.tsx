import { DateTime } from 'luxon';
import {
  Fund,
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { DateRange, ReportType } from './StaffReportEnum';
import {
  GroupedTransaction,
  filterTransactions,
  getAvailableCategories,
} from './filterTransactions';

const mockFund: Fund = {
  id: 'fund-1',
  fundType: 'Primary',
  balance: 1000,
  deficitLimit: 0,
  total: -500,
  categories: [
    // Grouped category
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
    // Ungrouped category
    {
      category: StaffExpenseCategoryEnum.Benefits,
      total: -100,
      averagePerMonth: -50,
      subcategories: [
        {
          subCategory: StaffExpensesSubCategoryEnum.BenefitsOther,
          total: -100,
          averagePerMonth: -50,
          breakdownByMonth: [
            {
              month: '2025-02-01',
              total: -50,
              transactions: [
                {
                  id: 'transaction-4',
                  amount: -50,
                  transactedAt: '2025-01-10',
                  description: 'Benefits Payment',
                },
              ],
            },
          ],
        },
      ],
      breakdownByMonth: [{ month: '2025-01-01', total: -50 }],
    },
  ],
};

describe('filterTransactions', () => {
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
      tableType: ReportType.Income,
      targetTime,
    });
    // 1 income transaction, 3 expense transactions
    expect(result).toHaveLength(1);
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
      tableType: ReportType.Expense,
    });
    // 3 expense transactions, 1 income transaction
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
      tableType: ReportType.Expense,
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
      tableType: ReportType.Expense,
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
      tableType: ReportType.Income,
    });
    expect(result).toEqual([]);
  });

  it('groups transactions when category is selected in filters', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
    const result = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [StaffExpenseCategoryEnum.AdditionalSalary],
      },
      tableType: ReportType.Expense,
    });

    // One grouped, one ungrouped
    expect(result).toHaveLength(2);
    const grouped = result[0] as GroupedTransaction;
    expect(grouped.groupedTransactions).toHaveLength(2);

    const ungrouped = result[1];
    expect('groupedTransactions' in ungrouped).toBe(false);
    expect(ungrouped.category).toBe(StaffExpenseCategoryEnum.Benefits);
  });

  it('does not group transactions when category is not selected in filters', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
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
      tableType: ReportType.Expense,
    });

    // 3 expense transactions, 1 income transaction
    expect(result).toHaveLength(3);
    expect(result.every((r) => !('groupedTransactions' in r))).toBe(true);
  });

  it('maintains income/expense separation when grouping', () => {
    const targetTime = DateTime.fromISO('2025-01-15');

    const incomeResult = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [StaffExpenseCategoryEnum.AdditionalSalary],
      },
      tableType: ReportType.Income,
    });

    const expenseResult = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [StaffExpenseCategoryEnum.AdditionalSalary],
      },
      tableType: ReportType.Expense,
    });

    expect(incomeResult).toHaveLength(1);
    expect(expenseResult).toHaveLength(2);

    const incomeGrouped = incomeResult[0] as GroupedTransaction;
    const expenseGrouped = expenseResult[0] as GroupedTransaction;

    expect(incomeGrouped.amount).toBeGreaterThan(0);
    expect(expenseGrouped.amount).toBeLessThan(0);

    expect(incomeGrouped.groupedTransactions.every((t) => t.amount > 0)).toBe(
      true,
    );
    expect(expenseGrouped.groupedTransactions.every((t) => t.amount < 0)).toBe(
      true,
    );
  });

  it('places grouped transactions at the top of the result array', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
    const result = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [StaffExpenseCategoryEnum.AdditionalSalary],
      },
      tableType: ReportType.Expense,
    });

    // First item should be the grouped transaction
    expect('groupedTransactions' in result[0]).toBe(true);
    const grouped = result[0] as GroupedTransaction;
    expect(grouped.categoryName).toBe(
      StaffExpenseCategoryEnum.AdditionalSalary,
    );

    // Second item should be the ungrouped transaction
    expect('groupedTransactions' in result[1]).toBe(false);
    expect(result[1].category).toBe(StaffExpenseCategoryEnum.Benefits);
  });

  it('groups multiple categories when multiple are selected', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
    const result = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [
          StaffExpenseCategoryEnum.AdditionalSalary,
          StaffExpenseCategoryEnum.Benefits,
        ],
      },
      tableType: ReportType.Expense,
    });

    // Both categories should be grouped
    expect(result).toHaveLength(2);
    expect(result.every((r) => 'groupedTransactions' in r)).toBe(true);

    const grouped1 = result[0] as GroupedTransaction;
    const grouped2 = result[1] as GroupedTransaction;

    expect(grouped1.categoryName).toBe(
      StaffExpenseCategoryEnum.AdditionalSalary,
    );
    expect(grouped2.categoryName).toBe(StaffExpenseCategoryEnum.Benefits);
  });

  it('calculates correct total amount for grouped transactions', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
    const result = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [StaffExpenseCategoryEnum.AdditionalSalary],
      },
      tableType: ReportType.Expense,
    });

    const grouped = result[0] as GroupedTransaction;
    // Should sum: -100 + -1000 = -1100
    expect(grouped.amount).toBe(-1100);
    expect(grouped.groupedTransactions).toHaveLength(2);
  });

  it('uses earliest transaction date for grouped transaction', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
    const result = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [StaffExpenseCategoryEnum.AdditionalSalary],
      },
      tableType: ReportType.Expense,
    });

    const grouped = result[0] as GroupedTransaction;
    // Earliest transaction is transaction-3 at 2025-01-20
    expect(grouped.transactedAt).toBe('2025-01-20');
  });

  it('sets displayCategory to localized category name for grouped transactions', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
    const result = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [StaffExpenseCategoryEnum.AdditionalSalary],
      },
      tableType: ReportType.Expense,
    });

    const grouped = result[0] as GroupedTransaction;
    // displayCategory should be localized category, not category-subcategory
    expect(grouped.displayCategory).toBe('Additional Salary');
    expect(grouped.displayCategory).not.toContain(' - ');
  });

  it('handles empty result when no transactions match grouping criteria', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
    const result = filterTransactions({
      fund: mockFund,
      targetTime,
      t: i18n.t,
      filters: {
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [StaffExpenseCategoryEnum.Transfer],
      },
      tableType: ReportType.Expense,
    });

    // No Transfer transactions in the data, so we should only get ungrouped transactions
    // 3 expense transactions (transaction-2, transaction-3, transaction-4)
    expect(result).toHaveLength(3);
    expect(result.every((r) => !('groupedTransactions' in r))).toBe(true);
  });
});

describe('getAvailableCategories', () => {
  it('returns categories that have transactions in the date range', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
    const result = getAvailableCategories([mockFund], null, targetTime);

    expect(result).toHaveLength(2);
    expect(result).toContain(StaffExpenseCategoryEnum.AdditionalSalary);
  });

  it('handles empty funds array', () => {
    const targetTime = DateTime.fromISO('2025-01-15');
    const result = getAvailableCategories([], null, targetTime);

    expect(result).toEqual([]);
  });
});
