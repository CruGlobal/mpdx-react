import { ErgonoMockShape } from 'graphql-ergonomock';
import { DateTime, Settings } from 'luxon';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  Fund,
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import { Filters } from '../../Shared/SettingsDialog/SettingsDialog';
import {
  ReportsStaffExpensesDocument,
  ReportsStaffExpensesQuery,
} from '../GetStaffExpense.generated';
import { DateRange, ReportType } from './StaffReportEnum';
import {
  filterTransactions,
  getAvailableCategories,
  getCombinableCategories,
  isGroupedTransaction,
} from './filterTransactions';

interface MockTransaction {
  amount: number;
  transactedAt: string;
}

interface MockGroup {
  category: StaffExpenseCategoryEnum;
  subCategory: StaffExpensesSubCategoryEnum;
  transactions: MockTransaction[];
}

const buildFund = (groups: MockGroup[]): Fund => {
  const categories = new Map<StaffExpenseCategoryEnum, MockGroup[]>();
  groups.forEach((group) => {
    categories.set(group.category, [
      ...(categories.get(group.category) ?? []),
      group,
    ]);
  });

  const categoryMocks: ErgonoMockShape[] = Array.from(
    categories,
    ([category, group]) => ({
      category,
      subcategories: group.map(({ subCategory, transactions }) => ({
        subCategory,
        breakdownByMonth: [
          {
            transactions: transactions.map(({ amount, transactedAt }) => ({
              amount,
              transactedAt,
            })),
          },
        ],
      })),
    }),
  );

  const { funds } = gqlMock<ReportsStaffExpensesQuery>(
    ReportsStaffExpensesDocument,
    {
      mocks: {
        reportsStaffExpenses: {
          funds: [{ fundType: 'Primary', categories: categoryMocks }],
        },
      },
    },
  ).reportsStaffExpenses;

  return funds[0];
};

const mockFund = buildFund([
  {
    category: StaffExpenseCategoryEnum.AdditionalSalary,
    subCategory: StaffExpensesSubCategoryEnum.AdditionalSalary,
    transactions: [
      {
        amount: 100,
        transactedAt: '2025-01-15T00:00:00Z',
      },
      {
        amount: -100,
        transactedAt: '2025-01-20T00:00:00Z',
      },
      {
        amount: -1000,
        transactedAt: '2025-01-24T00:00:00Z',
      },
    ],
  },
  {
    category: StaffExpenseCategoryEnum.Benefits,
    subCategory: StaffExpensesSubCategoryEnum.HealthWelfare,
    transactions: [
      {
        amount: -50,
        transactedAt: '2025-01-10T00:00:00Z',
      },
    ],
  },
]);

const baseFilters: Filters = {
  selectedDateRange: null,
  startDate: null,
  endDate: null,
  categories: null,
};

const baseParams = {
  fund: mockFund,
  targetTime: DateTime.fromISO('2025-01-15'),
  t: i18n.t,
  filters: baseFilters,
  tableType: ReportType.Expense,
};

const marchParams = {
  ...baseParams,
  targetTime: DateTime.fromISO('2025-03-15'),
};

describe('filterTransactions', () => {
  it('filters transactions for the target month by default', () => {
    const result = filterTransactions({
      ...baseParams,
      tableType: ReportType.Income,
    });

    expect(result).toHaveLength(1);
  });

  it('filters transactions by custom date range', () => {
    const result = filterTransactions({
      ...baseParams,
      targetTime: DateTime.fromISO('2024-06-15'),
      filters: {
        ...baseFilters,
        startDate: DateTime.fromISO('2025-01-01'),
        endDate: DateTime.fromISO('2025-02-03'),
      },
    });

    expect(result).toHaveLength(2);
  });

  it('returns empty array if no main categories', () => {
    const result = filterTransactions({
      ...baseParams,
      fund: { ...mockFund, categories: null },
      targetTime: DateTime.fromISO('2024-06-01'),
      filters: {
        ...baseFilters,
        startDate: DateTime.fromISO('2025-01-01'),
        endDate: DateTime.fromISO('2025-02-03'),
      },
    });

    expect(result).toEqual([]);
  });

  it('returns empty array if no transactions in range and custom date range not selected', () => {
    const result = filterTransactions({
      ...baseParams,
      targetTime: DateTime.fromISO('2023-01-01'),
    });

    expect(result).toEqual([]);
  });

  it('returns empty array if no transactions in range with custom date range', () => {
    const result = filterTransactions({
      ...baseParams,
      targetTime: DateTime.fromISO('2024-06-01'),
      filters: {
        ...baseFilters,
        selectedDateRange: DateRange.YearToDate,
        startDate: DateTime.fromISO('2025-04-01'),
        endDate: DateTime.fromISO('2025-06-03'),
      },
      tableType: ReportType.Income,
    });

    expect(result).toEqual([]);
  });

  it('collapses salary lines posted on the same date into one row', () => {
    const result = filterTransactions({
      ...marchParams,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Salary,
          subCategory: StaffExpensesSubCategoryEnum.RegularPay,
          transactions: [
            {
              amount: -2800,
              transactedAt: '2025-03-14T00:00:00Z',
            },
          ],
        },
        {
          category: StaffExpenseCategoryEnum.Salary,
          subCategory: StaffExpensesSubCategoryEnum.TaxFederal,
          transactions: [
            { amount: -310, transactedAt: '2025-03-14T00:00:00Z' },
          ],
        },
      ]),
    });

    const [salary] = result.filter(isGroupedTransaction);
    expect(result).toHaveLength(1);
    expect(salary.amount).toBe(-3110);
    expect(salary.groupedTransactions).toHaveLength(2);
    expect(salary.transactedAt).toBe('2025-03-14');
    expect(salary.displayCategory).toBe('Salary');
  });

  it('keeps salary posted on different dates in separate rows', () => {
    const result = filterTransactions({
      ...marchParams,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Salary,
          subCategory: StaffExpensesSubCategoryEnum.RegularPay,
          transactions: [
            {
              amount: -2800,
              transactedAt: '2025-03-14T00:00:00Z',
            },
            {
              amount: -2900,
              transactedAt: '2025-03-31T00:00:00Z',
            },
          ],
        },
      ]),
    });

    expect(result).toHaveLength(2);
    expect(result.map((row) => row.transactedAt)).toEqual([
      '2025-03-31',
      '2025-03-14',
    ]);
  });

  it('merges other assessment and staff assessment into one monthly row, leaving credit card fees separate', () => {
    const result = filterTransactions({
      ...marchParams,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Assessment,
          subCategory: StaffExpensesSubCategoryEnum.OtherAssessment,
          transactions: [
            {
              amount: -10,
              transactedAt: '2025-03-05T00:00:00Z',
            },
          ],
        },
        {
          category: StaffExpenseCategoryEnum.Assessment,
          subCategory: StaffExpensesSubCategoryEnum.StaffAssessment,
          transactions: [
            {
              amount: -20,
              transactedAt: '2025-03-18T00:00:00Z',
            },
          ],
        },
        {
          category: StaffExpenseCategoryEnum.Assessment,
          subCategory: StaffExpensesSubCategoryEnum.CreditCardFee,
          transactions: [{ amount: -5, transactedAt: '2025-03-09T00:00:00Z' }],
        },
      ]),
    });

    const grouped = result.filter(isGroupedTransaction);
    expect(result).toHaveLength(2);

    const assessments = grouped.find(
      (row) => row.displayCategory === 'Assessments',
    );
    expect(assessments?.amount).toBe(-30);
    expect(assessments?.groupedTransactions).toHaveLength(2);
    expect(assessments?.transactedAt).toBe('2025-03-01');

    const fees = grouped.find(
      (row) => row.displayCategory === 'Credit Card Fees',
    );
    expect(fees?.amount).toBe(-5);
    expect(fees?.groupedTransactions).toHaveLength(1);
  });

  it('itemizes transfers', () => {
    const result = filterTransactions({
      ...marchParams,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Transfer,
          subCategory: StaffExpensesSubCategoryEnum.Transfer,
          transactions: [
            {
              amount: -100,
              transactedAt: '2025-03-02T00:00:00Z',
            },
            {
              amount: -200,
              transactedAt: '2025-03-02T00:00:00Z',
            },
          ],
        },
      ]),
    });

    expect(result).toHaveLength(2);
    expect(result.every((row) => !isGroupedTransaction(row))).toBe(true);
  });

  it('itemizes bonuses alongside a salary rollup on the same date', () => {
    const result = filterTransactions({
      ...marchParams,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Salary,
          subCategory: StaffExpensesSubCategoryEnum.RegularPay,
          transactions: [
            {
              amount: -2800,
              transactedAt: '2025-03-14T00:00:00Z',
            },
          ],
        },
        {
          category: StaffExpenseCategoryEnum.Salary,
          subCategory: StaffExpensesSubCategoryEnum.Bonuses,
          transactions: [
            {
              amount: -1000,
              transactedAt: '2025-03-14T00:00:00Z',
            },
          ],
        },
      ]),
    });

    const [salary] = result.filter(isGroupedTransaction);
    const itemized = result.filter((row) => !isGroupedTransaction(row));

    expect(itemized.map((row) => row.amount)).toEqual([-1000]);
    expect(salary.amount).toBe(-2800);
  });

  it('splits positive and negative salary lines across the income and expense tables', () => {
    const fund = buildFund([
      {
        category: StaffExpenseCategoryEnum.Salary,
        subCategory: StaffExpensesSubCategoryEnum.RegularPay,
        transactions: [
          { amount: -2800, transactedAt: '2025-03-14T00:00:00Z' },
          {
            amount: 120,
            transactedAt: '2025-03-14T00:00:00Z',
          },
        ],
      },
    ]);

    const income = filterTransactions({
      ...marchParams,
      fund,
      tableType: ReportType.Income,
    });
    const expenses = filterTransactions({ ...marchParams, fund });

    const [incomeSalary] = income.filter(isGroupedTransaction);
    const [expenseSalary] = expenses.filter(isGroupedTransaction);

    expect(income).toHaveLength(1);
    expect(expenses).toHaveLength(1);
    expect(incomeSalary.amount).toBe(120);
    expect(expenseSalary.amount).toBe(-2800);
  });

  it('keeps monthly rollups in separate rows per month', () => {
    const result = filterTransactions({
      ...baseParams,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Donation,
          subCategory: StaffExpensesSubCategoryEnum.Donation,
          transactions: [
            {
              amount: -25,
              transactedAt: '2025-01-05T00:00:00Z',
            },
            {
              amount: -35,
              transactedAt: '2025-02-08T00:00:00Z',
            },
          ],
        },
      ]),
      filters: {
        ...baseFilters,
        startDate: DateTime.fromISO('2025-01-01'),
        endDate: DateTime.fromISO('2025-02-28'),
      },
    });

    expect(result).toHaveLength(2);
    expect(result.map((row) => row.transactedAt)).toEqual([
      '2025-02-01',
      '2025-01-01',
    ]);
    expect(result[0].displayCategory).toBe('Donations');
  });

  it('itemizes a category the reader unchecked', () => {
    const fund = buildFund([
      {
        category: StaffExpenseCategoryEnum.Donation,
        subCategory: StaffExpensesSubCategoryEnum.Donation,
        transactions: [
          {
            amount: -25,
            transactedAt: '2025-01-05T00:00:00Z',
          },
          {
            amount: -35,
            transactedAt: '2025-01-08T00:00:00Z',
          },
        ],
      },
    ]);

    const consolidated = filterTransactions({ ...baseParams, fund });
    expect(consolidated).toHaveLength(1);

    const itemizedResult = filterTransactions({
      ...baseParams,
      fund,
      filters: { ...baseFilters, categories: [] },
    });

    expect(itemizedResult).toHaveLength(2);
    expect(itemizedResult.every((row) => !isGroupedTransaction(row))).toBe(
      true,
    );
  });

  it('consolidates every category when the settings are untouched', () => {
    const result = filterTransactions({ ...baseParams });

    expect(result).toHaveLength(2);
    expect(result.every((row) => isGroupedTransaction(row))).toBe(true);
  });

  it('applies the standard grouping rules when filters are absent', () => {
    const result = filterTransactions({ ...baseParams, filters: undefined });

    expect(result.every((row) => isGroupedTransaction(row))).toBe(true);
  });

  it('maintains income/expense separation when grouping', () => {
    const filters = {
      ...baseFilters,
      categories: [StaffExpenseCategoryEnum.AdditionalSalary],
    };

    const incomeResult = filterTransactions({
      ...baseParams,
      filters,
      tableType: ReportType.Income,
    });
    const expenseResult = filterTransactions({ ...baseParams, filters });

    expect(incomeResult).toHaveLength(1);
    expect(expenseResult).toHaveLength(2);

    const [incomeGrouped] = incomeResult.filter(isGroupedTransaction);
    const [expenseGrouped] = expenseResult
      .filter(isGroupedTransaction)
      .filter(
        (row) => row.category === StaffExpenseCategoryEnum.AdditionalSalary,
      );

    expect(incomeGrouped.amount).toBeGreaterThan(0);
    expect(expenseGrouped.amount).toBeLessThan(0);
    expect(
      incomeGrouped.groupedTransactions.every(
        (transaction) => transaction.amount > 0,
      ),
    ).toBe(true);
    expect(
      expenseGrouped.groupedTransactions.every(
        (transaction) => transaction.amount < 0,
      ),
    ).toBe(true);
  });

  it('sorts rows of equal standing by date, newest first', () => {
    const result = filterTransactions({
      ...marchParams,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Transfer,
          subCategory: StaffExpensesSubCategoryEnum.Transfer,
          transactions: [
            { amount: -100, transactedAt: '2025-03-04T00:00:00Z' },
            { amount: -200, transactedAt: '2025-03-26T00:00:00Z' },
          ],
        },
      ]),
    });

    expect(result.map((row) => row.transactedAt)).toEqual([
      '2025-03-26',
      '2025-03-04',
    ]);
  });

  it('leads the expenses with assessments, credit card fees, and benefits', () => {
    const result = filterTransactions({
      ...marchParams,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Benefits,
          subCategory: StaffExpensesSubCategoryEnum.HealthWelfare,
          transactions: [{ amount: -50, transactedAt: '2025-03-14T00:00:00Z' }],
        },
        {
          category: StaffExpenseCategoryEnum.Transfer,
          subCategory: StaffExpensesSubCategoryEnum.Transfer,
          transactions: [
            { amount: -100, transactedAt: '2025-03-28T00:00:00Z' },
          ],
        },
        {
          category: StaffExpenseCategoryEnum.Assessment,
          subCategory: StaffExpensesSubCategoryEnum.CreditCardFee,
          transactions: [{ amount: -5, transactedAt: '2025-03-09T00:00:00Z' }],
        },
        {
          category: StaffExpenseCategoryEnum.Assessment,
          subCategory: StaffExpensesSubCategoryEnum.StaffAssessment,
          transactions: [{ amount: -20, transactedAt: '2025-03-05T00:00:00Z' }],
        },
      ]),
    });

    expect(result.map((row) => row.displayCategory)).toEqual([
      'Assessments',
      'Credit Card Fees',
      'Benefits',
      'Transfer',
    ]);
  });

  it('leads the income with donations', () => {
    const result = filterTransactions({
      ...marchParams,
      tableType: ReportType.Income,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Donation,
          subCategory: StaffExpensesSubCategoryEnum.NonCash,
          transactions: [{ amount: 40, transactedAt: '2025-03-20T00:00:00Z' }],
        },
        {
          category: StaffExpenseCategoryEnum.Donation,
          subCategory: StaffExpensesSubCategoryEnum.Donation,
          transactions: [{ amount: 100, transactedAt: '2025-03-05T00:00:00Z' }],
        },
      ]),
    });

    expect(result.map((row) => row.displayCategory)).toEqual([
      'Donations',
      'Donation - Non Cash',
    ]);
  });

  it('keeps every rollup above the itemized rows, whatever their dates', () => {
    const result = filterTransactions({
      ...marchParams,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Transfer,
          subCategory: StaffExpensesSubCategoryEnum.Transfer,
          transactions: [
            { amount: -100, transactedAt: '2025-03-31T00:00:00Z' },
          ],
        },
        {
          category: StaffExpenseCategoryEnum.StaffExpense,
          subCategory: StaffExpensesSubCategoryEnum.PaCard,
          transactions: [{ amount: -80, transactedAt: '2025-03-06T00:00:00Z' }],
        },
        {
          category: StaffExpenseCategoryEnum.Salary,
          subCategory: StaffExpensesSubCategoryEnum.TaxFederal,
          transactions: [
            { amount: -300, transactedAt: '2025-03-28T00:00:00Z' },
          ],
        },
      ]),
    });

    expect(result.map((row) => row.displayCategory)).toEqual([
      'Salary',
      'Healthcare Debit Card',
      'Transfer',
    ]);
  });

  it('keys each bucket by fund, bucket, and period', () => {
    const result = filterTransactions({ ...baseParams });

    expect(
      result
        .filter(isGroupedTransaction)
        .map((row) => row.bucketKey)
        .sort(),
    ).toEqual([
      'Primary|ADDITIONAL_SALARY|2025-01',
      'Primary|BENEFITS|2025-01-10',
    ]);
  });

  it('calculates correct total amount for grouped transactions', () => {
    const result = filterTransactions({ ...baseParams });

    const [grouped] = result
      .filter(isGroupedTransaction)
      .filter(
        (row) => row.category === StaffExpenseCategoryEnum.AdditionalSalary,
      );

    expect(grouped.amount).toBe(-1100);
    expect(grouped.groupedTransactions).toHaveLength(2);
  });

  it('files a monthly rollup on the first of its month', () => {
    const result = filterTransactions({ ...baseParams });

    const [grouped] = result
      .filter(isGroupedTransaction)
      .filter(
        (row) => row.category === StaffExpenseCategoryEnum.AdditionalSalary,
      );

    expect(grouped.transactedAt).toBe('2025-01-01');
  });

  it('itemizes every category when none are checked', () => {
    const result = filterTransactions({
      ...baseParams,
      filters: { ...baseFilters, categories: [] },
    });

    expect(result).toHaveLength(3);
    expect(result.every((row) => !isGroupedTransaction(row))).toBe(true);
  });

  it('does not let a shared bucket claim one member subcategory', () => {
    const result = filterTransactions({
      ...marchParams,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Salary,
          subCategory: StaffExpensesSubCategoryEnum.RegularPay,
          transactions: [
            { amount: -2800, transactedAt: '2025-03-14T00:00:00Z' },
          ],
        },
        {
          category: StaffExpenseCategoryEnum.Salary,
          subCategory: StaffExpensesSubCategoryEnum.TaxFederal,
          transactions: [
            { amount: -310, transactedAt: '2025-03-14T00:00:00Z' },
          ],
        },
      ]),
    });

    const [salary] = result.filter(isGroupedTransaction);
    expect(salary.category).toBe(StaffExpenseCategoryEnum.Salary);
    expect(salary.subcategory).toBeUndefined();
  });

  it('keeps the subcategory on a bucket that holds only one', () => {
    const result = filterTransactions({ ...baseParams });

    const [additionalSalary] = result
      .filter(isGroupedTransaction)
      .filter(
        (row) => row.category === StaffExpenseCategoryEnum.AdditionalSalary,
      );

    expect(additionalSalary.subcategory).toBe(
      StaffExpensesSubCategoryEnum.AdditionalSalary,
    );
  });

  it('joins category and subcategory only when their labels differ', () => {
    const result = filterTransactions({
      ...baseParams,
      filters: { ...baseFilters, categories: [] },
    });

    expect(result.map((row) => row.displayCategory)).toEqual([
      'Additional Salary',
      'Additional Salary',
      'Benefits - Health & Welfare',
    ]);
  });

  it('labels a benefits rollup with its category rather than its subcategory', () => {
    const result = filterTransactions({ ...baseParams });

    const benefits = result.find(
      (row) => row.category === StaffExpenseCategoryEnum.Benefits,
    );
    expect(benefits?.displayCategory).toBe('Benefits');
  });

  it('sets displayCategory to the subcategory label for a monthly rollup', () => {
    const result = filterTransactions({ ...baseParams });

    const additionalSalary = result.find(
      (row) => row.category === StaffExpenseCategoryEnum.AdditionalSalary,
    );
    expect(additionalSalary?.displayCategory).toBe('Additional Salary');
    expect(additionalSalary?.displayCategory).not.toContain(' - ');
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

  it('reports a category as combinable when its transactions roll up', () => {
    expect(
      getCombinableCategories([mockFund], null, DateTime.fromISO('2025-01-15')),
    ).toEqual([
      StaffExpenseCategoryEnum.AdditionalSalary,
      StaffExpenseCategoryEnum.Benefits,
    ]);
  });

  it('excludes a category whose transactions in range all itemize', () => {
    // Donation rolls up monthly, but non-cash gifts under it do not. The category is only
    // combinable when the data actually holds something combinable.
    const nonCashOnly = buildFund([
      {
        category: StaffExpenseCategoryEnum.Donation,
        subCategory: StaffExpensesSubCategoryEnum.NonCash,
        transactions: [{ amount: -25, transactedAt: '2025-01-05T00:00:00Z' }],
      },
    ]);
    const targetTime = DateTime.fromISO('2025-01-15');

    expect(getAvailableCategories([nonCashOnly], null, targetTime)).toEqual([
      StaffExpenseCategoryEnum.Donation,
    ]);
    expect(getCombinableCategories([nonCashOnly], null, targetTime)).toEqual(
      [],
    );
  });
});

describe('UTC timestamps in a behind-UTC timezone', () => {
  const originalZone = Settings.defaultZone;

  beforeEach(() => {
    Settings.defaultZone = 'America/Denver';
  });

  afterEach(() => {
    Settings.defaultZone = originalZone;
  });

  const firstOfMonthFund = buildFund([
    {
      category: StaffExpenseCategoryEnum.Benefits,
      subCategory: StaffExpensesSubCategoryEnum.HealthWelfare,
      transactions: [
        {
          amount: -50,
          transactedAt: '2025-02-01T00:00:00Z',
        },
      ],
    },
  ]);

  it('keeps a first-of-month transaction inside the default month filter', () => {
    const result = filterTransactions({
      ...baseParams,
      fund: firstOfMonthFund,
      targetTime: DateTime.fromISO('2025-02-15'),
      filters: null,
    });

    expect(result).toHaveLength(1);
    expect(result[0].transactedAt).toBe('2025-02-01');
  });

  it('keeps a first-of-month transaction inside a custom date range', () => {
    const result = filterTransactions({
      ...baseParams,
      fund: firstOfMonthFund,
      filters: {
        ...baseFilters,
        startDate: DateTime.fromISO('2025-02-01'),
        endDate: DateTime.fromISO('2025-02-28'),
      },
    });

    expect(result).toHaveLength(1);
  });

  it('buckets a first-of-month transaction into its own month', () => {
    const result = filterTransactions({
      ...baseParams,
      fund: buildFund([
        {
          category: StaffExpenseCategoryEnum.Donation,
          subCategory: StaffExpensesSubCategoryEnum.Donation,
          transactions: [
            {
              amount: -25,
              transactedAt: '2025-02-01T00:00:00Z',
            },
          ],
        },
      ]),
      targetTime: DateTime.fromISO('2025-02-15'),
      filters: null,
    });

    const [donations] = result.filter(isGroupedTransaction);
    expect(result).toHaveLength(1);
    expect(donations.bucketKey).toBe('Primary|DONATION|2025-02');
  });

  it('getAvailableCategories includes a category whose only transaction is on the 1st', () => {
    expect(
      getAvailableCategories(
        [firstOfMonthFund],
        null,
        DateTime.fromISO('2025-02-15'),
      ),
    ).toEqual([StaffExpenseCategoryEnum.Benefits]);
  });
});
