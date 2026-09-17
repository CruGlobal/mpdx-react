import { renderHook } from '@testing-library/react';
import { TFunction } from 'i18next';
import {
  Categories,
  Funds,
} from 'src/components/Reports/MPGAIncomeExpensesReport/Helper/MPGAReportEnum';
import { HouseholdMember } from 'src/components/Reports/Shared/Helpers/household';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import { useFilteredFunds } from './useFilteredFunds';

// Interpolates like i18next so per-person labels read the way they will on screen.
const t = ((key: string, options?: Record<string, string>) =>
  options
    ? key.replace(/{{(\w+)}}/g, (_match, name: string) => options[name])
    : key) as TFunction;
const selectedCategories = [
  StaffExpenseCategoryEnum.Salary,
  StaffExpenseCategoryEnum.HealthcareReimbursement,
];

const renderUseFilteredFunds = (
  funds: Funds[],
  selected: string[] | null = null,
  household: HouseholdMember[] = [],
) => renderHook(() => useFilteredFunds(funds, selected, t, household));

const months = (totals: number[]) =>
  totals.map((total, index) => ({
    month: `2024-${String(index + 1).padStart(2, '0')}-01`,
    total,
  }));

const sum = (totals: number[]) => totals.reduce((acc, total) => acc + total, 0);

const subcategory = (
  subCategory: StaffExpensesSubCategoryEnum,
  totals: number[],
) => ({
  subCategory,
  total: sum(totals),
  averagePerMonth: sum(totals) / totals.length,
  breakdownByMonth: months(totals),
});

const categoryRollup = (
  category: StaffExpenseCategoryEnum,
  monthlyAmount: number,
): Categories => {
  const totals = new Array(12).fill(monthlyAmount);
  return {
    category,
    total: sum(totals),
    averagePerMonth: monthlyAmount,
    breakdownByMonth: months(totals),
    subcategories: [],
  };
};

const mockData: Funds[] = [
  {
    id: '1',
    fundType: 'Primary',
    total: 17960,
    categories: [
      {
        category: StaffExpenseCategoryEnum.HealthcareReimbursement,
        total: 2760,
        averagePerMonth: 230,
        breakdownByMonth: months([
          0, 0, 300, 400, 500, 0, 700, -40, 900, 0, 0, 0,
        ]),
        subcategories: [],
      },
      {
        category: StaffExpenseCategoryEnum.Salary,
        total: 15200,
        averagePerMonth: 1266.67,
        breakdownByMonth: months([
          200, 0, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400,
        ]),
        subcategories: [
          subcategory(
            StaffExpensesSubCategoryEnum.TaxState,
            [100, -200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200],
          ),
          subcategory(
            StaffExpensesSubCategoryEnum.RegularPay,
            [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200],
          ),
        ],
      },
    ],
  },
];

describe('useFilteredFunds', () => {
  it('should filter and sort funds correctly', () => {
    const { result } = renderUseFilteredFunds(mockData, selectedCategories);

    expect(result.current).toEqual({
      incomeData: [
        {
          id: '1-HEALTHCARE_REIMBURSEMENT',
          description: 'Healthcare Reimbursement',
          category: StaffExpenseCategoryEnum.HealthcareReimbursement,
          monthly: [0, 0, 300, 400, 500, 0, 700, 0, 900, 0, 0, 0],
          average: 2800 / 12,
          total: 2800,
        },
        {
          id: '1-SALARY-income',
          description: 'Salary',
          category: StaffExpenseCategoryEnum.Salary,
          monthly: [
            200, 200, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400,
          ],
          average: 1283.33,
          total: 15400,
          transactions: [],
        },
      ],
      expenseData: [
        {
          id: '1-SALARY-expense',
          description: 'Salary',
          category: StaffExpenseCategoryEnum.Salary,
          monthly: [0, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          average: 16.67,
          total: 200,
          transactions: [],
        },
        {
          id: '1-HEALTHCARE_REIMBURSEMENT',
          description: 'Healthcare Reimbursement',
          category: StaffExpenseCategoryEnum.HealthcareReimbursement,
          monthly: [0, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0, 0],
          average: 40 / 12,
          total: 40,
        },
      ],
    });
  });

  describe('subcategory handling', () => {
    const subcategoryFund: Funds[] = [
      {
        id: '1',
        fundType: 'Primary',
        total: 300,
        categories: [
          {
            category: StaffExpenseCategoryEnum.Benefits,
            total: 300,
            averagePerMonth: 150,
            breakdownByMonth: months([100, -50]),
            subcategories: [
              subcategory(
                StaffExpensesSubCategoryEnum.WorkersCompensation,
                [100, 100],
              ),
              subcategory(StaffExpensesSubCategoryEnum.ProgramBased, [0, -100]),
            ],
          },
        ],
      },
    ];

    it('breaks an unchecked category into one row per subcategory with distinct ids', () => {
      const { result } = renderUseFilteredFunds(subcategoryFund, []);

      expect(result.current.incomeData.map((row) => row.id)).toEqual([
        `1-${StaffExpenseCategoryEnum.Benefits}-${StaffExpensesSubCategoryEnum.WorkersCompensation}`,
      ]);
      expect(result.current.expenseData.map((row) => row.id)).toEqual([
        `1-${StaffExpenseCategoryEnum.Benefits}-${StaffExpensesSubCategoryEnum.ProgramBased}`,
      ]);
    });

    it('treats null selectedCategories as all-selected, combining subcategories by sign', () => {
      const { result } = renderUseFilteredFunds(subcategoryFund, null);

      expect(result.current.incomeData.map((row) => row.id)).toEqual([
        `1-${StaffExpenseCategoryEnum.Benefits}-income`,
      ]);
      expect(result.current.expenseData.map((row) => row.id)).toEqual([
        `1-${StaffExpenseCategoryEnum.Benefits}-expense`,
      ]);
    });
  });

  it('suppresses the all-zero income row for an expense-only category', () => {
    const funds: Funds[] = [
      {
        id: '1',
        fundType: 'Primary',
        total: -300,
        categories: [
          {
            category: StaffExpenseCategoryEnum.Benefits,
            total: -300,
            averagePerMonth: -150,
            breakdownByMonth: months([-100, -200]),
            subcategories: [
              subcategory(
                StaffExpensesSubCategoryEnum.WorkersCompensation,
                [-100, -200],
              ),
            ],
          },
        ],
      },
    ];

    const { result } = renderUseFilteredFunds(funds, null);

    expect(result.current.incomeData).toEqual([]);
    expect(result.current.expenseData.map((row) => row.id)).toEqual([
      `1-${StaffExpenseCategoryEnum.Benefits}-expense`,
    ]);
  });

  it('returns empty arrays for empty funds', () => {
    const { result } = renderUseFilteredFunds([], null);

    expect(result.current).toEqual({
      incomeData: [],
      expenseData: [],
    });
  });

  describe('category ordering', () => {
    it('orders income rows correctly', () => {
      const funds: Funds[] = [
        {
          id: '1',
          fundType: 'Primary',
          total: 6000,
          categories: [
            categoryRollup(StaffExpenseCategoryEnum.Other, 100),
            categoryRollup(StaffExpenseCategoryEnum.Salary, 100),
            categoryRollup(StaffExpenseCategoryEnum.Benefits, 100),
            categoryRollup(StaffExpenseCategoryEnum.Transfer, 100),
            categoryRollup(StaffExpenseCategoryEnum.Donation, 100),
          ],
        },
      ];

      const { result } = renderUseFilteredFunds(funds, null);

      expect(result.current.incomeData.map((row) => row.category)).toEqual([
        StaffExpenseCategoryEnum.Donation,
        StaffExpenseCategoryEnum.Transfer,
        StaffExpenseCategoryEnum.Salary,
        StaffExpenseCategoryEnum.Benefits,
        StaffExpenseCategoryEnum.Other,
      ]);
    });

    it('orders expense rows correctly', () => {
      const funds: Funds[] = [
        {
          id: '1',
          fundType: 'Primary',
          total: -4800,
          categories: [
            categoryRollup(StaffExpenseCategoryEnum.Other, -100),
            categoryRollup(StaffExpenseCategoryEnum.Donation, -100),
            categoryRollup(StaffExpenseCategoryEnum.Assessment, -100),
            categoryRollup(StaffExpenseCategoryEnum.Salary, -100),
          ],
        },
      ];

      const { result } = renderUseFilteredFunds(funds, null);

      expect(result.current.expenseData.map((row) => row.category)).toEqual([
        StaffExpenseCategoryEnum.Salary,
        StaffExpenseCategoryEnum.Assessment,
        StaffExpenseCategoryEnum.Donation,
        StaffExpenseCategoryEnum.Other,
      ]);
    });
  });

  describe('breakdown', () => {
    const selected = [StaffExpenseCategoryEnum.Benefits];

    const breakdownFund: Funds[] = [
      {
        id: '1',
        fundType: 'Primary',
        total: 70,
        categories: [
          {
            category: StaffExpenseCategoryEnum.Benefits,
            total: 70,
            averagePerMonth: 70,
            breakdownByMonth: months([70]),
            subcategories: [
              {
                subCategory: StaffExpensesSubCategoryEnum.ProgramBased,
                total: 70,
                averagePerMonth: 70,
                breakdownByMonth: [
                  {
                    month: '2024-01-01',
                    total: 130,
                    transactions: [
                      {
                        transactedAt: '2024-01-10T00:00:00Z',
                        description: 'Payroll',
                        amount: 100,
                      },
                      {
                        transactedAt: '2024-01-20T00:00:00Z',
                        description: null,
                        amount: 30,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    it('lists every transaction of a net-positive month under income', () => {
      const { result } = renderUseFilteredFunds(breakdownFund, selected);

      expect(result.current.incomeData[0].transactions).toEqual([
        {
          date: '2024-01-10T00:00:00Z',
          description: 'Payroll',
          category: StaffExpenseCategoryEnum.Benefits,
          subCategory: StaffExpensesSubCategoryEnum.ProgramBased,
          amount: 100,
        },
        {
          date: '2024-01-20T00:00:00Z',
          description: '',
          category: StaffExpenseCategoryEnum.Benefits,
          subCategory: StaffExpensesSubCategoryEnum.ProgramBased,
          amount: 30,
        },
      ]);
      expect(result.current.expenseData).toEqual([]);
    });

    it('sums the breakdown back to the combined row it explains', () => {
      const { result } = renderUseFilteredFunds(breakdownFund, selected);

      const entries = result.current.incomeData[0].transactions ?? [];

      expect(sum(entries.map((entry) => entry.amount))).toBe(
        result.current.incomeData[0].total,
      );
    });

    it('builds no breakdown for an unchecked category', () => {
      const { result } = renderUseFilteredFunds(breakdownFund, []);

      expect(result.current.incomeData).toHaveLength(1);
      expect(result.current.incomeData[0].transactions).toBeUndefined();
    });

    it('builds no breakdown for a category without subcategories', () => {
      const funds: Funds[] = [
        {
          id: '1',
          fundType: 'Primary',
          total: 1200,
          categories: [categoryRollup(StaffExpenseCategoryEnum.Donation, 100)],
        },
      ];

      const { result } = renderUseFilteredFunds(funds, null);

      expect(result.current.incomeData).toHaveLength(1);
      expect(result.current.incomeData[0].transactions).toBeUndefined();
    });
  });

  // The API resolves any category or subcategory code it doesn't declare to
  // UNKNOWN and does not expose the raw code, so several rows under the same
  // parent can share that enum value.
  describe('unknown categories and subcategories', () => {
    const unknownCategory = (amount: number): Categories => ({
      category: StaffExpenseCategoryEnum.Unknown,
      total: amount,
      averagePerMonth: amount,
      breakdownByMonth: months([amount]),
      subcategories: [
        {
          subCategory: StaffExpensesSubCategoryEnum.Unknown,
          total: amount,
          averagePerMonth: amount,
          breakdownByMonth: [
            {
              month: '2024-01-01',
              total: amount,
              transactions: [
                {
                  transactedAt: '2024-01-10T00:00:00Z',
                  description: 'unknown transaction',
                  amount,
                },
              ],
            },
          ],
        },
      ],
    });

    const twoUnknownCategories: Funds[] = [
      {
        id: '1',
        fundType: 'Primary',
        total: 155,
        categories: [unknownCategory(100), unknownCategory(55)],
      },
    ];

    const twoUnknownSubcategories: Funds[] = [
      {
        id: '1',
        fundType: 'Primary',
        total: 155,
        categories: [
          {
            category: StaffExpenseCategoryEnum.Salary,
            total: 155,
            averagePerMonth: 155,
            breakdownByMonth: months([155]),
            subcategories: [
              subcategory(StaffExpensesSubCategoryEnum.Unknown, [100]),
              subcategory(StaffExpensesSubCategoryEnum.Unknown, [55]),
            ],
          },
        ],
      },
    ];

    it('gives each unknown subcategory in one category its own row', () => {
      const { result } = renderUseFilteredFunds(twoUnknownSubcategories, []);

      expect(result.current.incomeData.map((row) => row.id)).toEqual([
        '1-SALARY-UNKNOWN-0',
        '1-SALARY-UNKNOWN-1',
      ]);
      expect(result.current.incomeData.map((row) => row.total)).toEqual([
        100, 55,
      ]);
    });

    it('gives each unknown category in one fund its own row', () => {
      const { result } = renderUseFilteredFunds(twoUnknownCategories, null);

      expect(result.current.incomeData.map((row) => row.id)).toEqual([
        '1-UNKNOWN-0-income',
        '1-UNKNOWN-1-income',
      ]);
      expect(result.current.incomeData.map((row) => row.total)).toEqual([
        100, 55,
      ]);
    });

    it('gives each unknown category with no subcategories its own row', () => {
      const funds: Funds[] = [
        {
          id: '1',
          fundType: 'Primary',
          total: 1860,
          categories: [
            categoryRollup(StaffExpenseCategoryEnum.Unknown, 100),
            categoryRollup(StaffExpenseCategoryEnum.Unknown, 55),
          ],
        },
      ];

      const { result } = renderUseFilteredFunds(funds, null);

      expect(result.current.incomeData.map((row) => row.id)).toEqual([
        '1-UNKNOWN-0',
        '1-UNKNOWN-1',
      ]);
    });

    it('gives each unknown category row its own transactions', () => {
      const { result } = renderUseFilteredFunds(twoUnknownCategories, null);

      expect(
        result.current.incomeData.map((row) => ({
          total: row.total,
          amounts: (row.transactions ?? []).map((entry) => entry.amount),
        })),
      ).toEqual([
        { total: 100, amounts: [100] },
        { total: 55, amounts: [55] },
      ]);
    });

    it('leaves existing categories alone', () => {
      const { result } = renderUseFilteredFunds(mockData, selectedCategories);

      expect(result.current.incomeData.map((row) => row.id)).toEqual([
        '1-HEALTHCARE_REIMBURSEMENT',
        '1-SALARY-income',
      ]);
    });
  });

  describe('salary per person', () => {
    const reader = { personNumber: '000000111', name: 'Alex' };
    const spouse = { personNumber: '000000222', name: 'Jordan' };

    const payroll = (
      amount: number,
      personNumber: string | null,
      transactedAt = '2024-01-15T00:00:00Z',
    ) => ({
      transactedAt,
      description: 'Payroll',
      amount,
      personNumber,
    });

    const salaryFund = (
      monthly: { total: number; transactions: ReturnType<typeof payroll>[] }[],
    ): Funds[] => [
      {
        id: '1',
        fundType: 'Primary',
        total: sum(monthly.map((month) => month.total)),
        categories: [
          {
            category: StaffExpenseCategoryEnum.Salary,
            total: sum(monthly.map((month) => month.total)),
            averagePerMonth: 0,
            breakdownByMonth: months(monthly.map((month) => month.total)),
            subcategories: [
              {
                subCategory: StaffExpensesSubCategoryEnum.RegularPay,
                total: sum(monthly.map((month) => month.total)),
                averagePerMonth: 0,
                breakdownByMonth: monthly.map((month, index) => ({
                  month: `2024-${String(index + 1).padStart(2, '0')}-01`,
                  ...month,
                })),
              },
            ],
          },
        ],
      },
    ];

    it("splits a couple's salary into one row per person, reader first", () => {
      const funds = salaryFund([
        {
          total: 300,
          transactions: [
            payroll(100, spouse.personNumber),
            payroll(200, reader.personNumber),
          ],
        },
        {
          total: 250,
          transactions: [
            payroll(150, reader.personNumber),
            payroll(100, spouse.personNumber),
          ],
        },
      ]);

      const { result } = renderUseFilteredFunds(funds, null, [reader, spouse]);

      expect(
        result.current.incomeData.map(
          ({ id, description, monthly, total }) => ({
            id,
            description,
            monthly,
            total,
          }),
        ),
      ).toEqual([
        {
          id: '1-SALARY-000000111-income',
          description: 'Salary (Alex)',
          monthly: [200, 150],
          total: 350,
        },
        {
          id: '1-SALARY-000000222-income',
          description: 'Salary (Jordan)',
          monthly: [100, 100],
          total: 200,
        },
      ]);
      expect(result.current.expenseData).toEqual([]);
    });

    it("lists only that person's transactions in each row's breakdown", () => {
      const funds = salaryFund([
        {
          total: 300,
          transactions: [
            payroll(100, spouse.personNumber),
            payroll(200, reader.personNumber),
          ],
        },
      ]);

      const { result } = renderUseFilteredFunds(funds, null, [reader, spouse]);

      expect(
        result.current.incomeData.map((row) =>
          (row.transactions ?? []).map((entry) => entry.amount),
        ),
      ).toEqual([[200], [100]]);
    });

    it('credits payroll SAA could not attribute to the reader', () => {
      const funds = salaryFund([
        {
          total: 300,
          transactions: [payroll(100, spouse.personNumber), payroll(200, null)],
        },
      ]);

      const { result } = renderUseFilteredFunds(funds, null, [reader, spouse]);

      expect(
        result.current.incomeData.map(({ description, monthly }) => ({
          description,
          monthly,
        })),
      ).toEqual([
        { description: 'Salary (Alex)', monthly: [200] },
        { description: 'Salary (Jordan)', monthly: [100] },
      ]);
    });

    it('treats a blank person number like a missing one', () => {
      const funds = salaryFund([
        {
          total: 300,
          transactions: [payroll(100, spouse.personNumber), payroll(200, '')],
        },
      ]);

      const { result } = renderUseFilteredFunds(funds, null, [reader, spouse]);

      expect(
        result.current.incomeData.map(({ description, monthly }) => ({
          description,
          monthly,
        })),
      ).toEqual([
        { description: 'Salary (Alex)', monthly: [200] },
        { description: 'Salary (Jordan)', monthly: [100] },
      ]);
    });

    it('sums each person from their own transactions when the month total disagrees', () => {
      const funds = salaryFund([
        {
          total: 300,
          transactions: [
            payroll(100, spouse.personNumber),
            payroll(150, reader.personNumber),
          ],
        },
      ]);

      const { result } = renderUseFilteredFunds(funds, null, [reader, spouse]);

      expect(result.current.incomeData.map((row) => row.monthly)).toEqual([
        [150],
        [100],
      ]);
    });

    it('shows no row for a person the month did not pay', () => {
      // The API's month total can round differently from its transactions. The reader was not
      // paid this month, so a rounding gap must not become a phantom row of theirs.
      const funds = salaryFund([
        { total: 299.99, transactions: [payroll(300, spouse.personNumber)] },
      ]);

      const { result } = renderUseFilteredFunds(funds, null, [reader, spouse]);

      expect(
        result.current.incomeData.map(({ description, monthly }) => ({
          description,
          monthly,
        })),
      ).toEqual([{ description: 'Salary (Jordan)', monthly: [300] }]);
      expect(result.current.expenseData).toEqual([]);
    });

    it('keeps a single staff member on one plain Salary row', () => {
      const funds = salaryFund([
        {
          total: 300,
          transactions: [payroll(100, reader.personNumber), payroll(200, null)],
        },
      ]);

      const { result } = renderUseFilteredFunds(funds, null, [reader, spouse]);

      expect(
        result.current.incomeData.map(({ id, description, monthly }) => ({
          id,
          description,
          monthly,
        })),
      ).toEqual([
        { id: '1-SALARY-income', description: 'Salary', monthly: [300] },
      ]);
    });

    it('reports the month total for a staff member nobody else shares payroll with', () => {
      // No second person in HCM or in the payroll, so the row reads exactly as it did before
      // splitting existed: the API's month total, not a sum of transactions.
      const funds = salaryFund([
        {
          total: 300,
          transactions: [payroll(150, reader.personNumber), payroll(100, null)],
        },
        { total: 200, transactions: [] },
      ]);

      const { result } = renderUseFilteredFunds(funds, null, [reader]);

      expect(
        result.current.incomeData.map(({ id, description, monthly }) => ({
          id,
          description,
          monthly,
        })),
      ).toEqual([
        { id: '1-SALARY-income', description: 'Salary', monthly: [300, 200] },
      ]);
    });

    it('labels a person HCM does not list as Spouse', () => {
      const funds = salaryFund([
        {
          total: 300,
          transactions: [
            payroll(100, '000000999'),
            payroll(200, reader.personNumber),
          ],
        },
      ]);

      const { result } = renderUseFilteredFunds(funds, null, [reader]);

      expect(result.current.incomeData.map((row) => row.description)).toEqual([
        'Salary (Alex)',
        'Salary (Spouse)',
      ]);
    });

    it('does not split salary without a household', () => {
      const funds = salaryFund([
        {
          total: 300,
          transactions: [
            payroll(100, spouse.personNumber),
            payroll(200, reader.personNumber),
          ],
        },
      ]);

      const { result } = renderUseFilteredFunds(funds, null, []);

      expect(
        result.current.incomeData.map(({ id, description }) => ({
          id,
          description,
        })),
      ).toEqual([{ id: '1-SALARY-income', description: 'Salary' }]);
    });

    it('leaves non-salary categories as one household row', () => {
      const funds: Funds[] = [
        {
          id: '1',
          fundType: 'Primary',
          total: -300,
          categories: [
            {
              category: StaffExpenseCategoryEnum.Benefits,
              total: -300,
              averagePerMonth: -300,
              breakdownByMonth: months([-300]),
              subcategories: [
                {
                  subCategory: StaffExpensesSubCategoryEnum.LifeInsurance,
                  total: -300,
                  averagePerMonth: -300,
                  breakdownByMonth: [
                    {
                      month: '2024-01-01',
                      total: -300,
                      transactions: [
                        payroll(-100, spouse.personNumber),
                        payroll(-200, reader.personNumber),
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const { result } = renderUseFilteredFunds(funds, null, [reader, spouse]);

      expect(result.current.expenseData.map((row) => row.description)).toEqual([
        'Benefits',
      ]);
    });
  });
});
