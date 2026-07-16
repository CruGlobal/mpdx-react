import { renderHook } from '@testing-library/react';
import {
  Categories,
  Funds,
} from 'src/components/Reports/MPGAIncomeExpensesReport/Helper/MPGAReportEnum';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import { useFilteredFunds } from './useFilteredFunds';

const t = jest.fn((key) => key);
const selectedCategories = [
  StaffExpenseCategoryEnum.Salary,
  StaffExpenseCategoryEnum.HealthcareReimbursement,
];

const renderUseFilteredFunds = (
  funds: Funds[],
  selected: string[] | null = null,
) => renderHook(() => useFilteredFunds(funds, selected, t));

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
          id: 'Primary-HEALTHCARE_REIMBURSEMENT',
          description: 'Healthcare Reimbursement',
          category: StaffExpenseCategoryEnum.HealthcareReimbursement,
          monthly: [0, 0, 300, 400, 500, 0, 700, 0, 900, 0, 0, 0],
          average: 2800 / 12,
          total: 2800,
        },
        {
          id: 'Primary-SALARY-income',
          description: 'Salary',
          category: StaffExpenseCategoryEnum.Salary,
          monthly: [
            200, 200, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400,
          ],
          average: 1283.33,
          total: 15400,
        },
      ],
      expenseData: [
        {
          id: 'Primary-SALARY-expense',
          description: 'Salary',
          category: StaffExpenseCategoryEnum.Salary,
          monthly: [0, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          average: 16.67,
          total: 200,
        },
        {
          id: 'Primary-HEALTHCARE_REIMBURSEMENT',
          description: 'Healthcare Reimbursement',
          category: StaffExpenseCategoryEnum.HealthcareReimbursement,
          monthly: [0, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0, 0],
          average: 40 / 12,
          total: 40,
        },
      ],
      incomeBreakdown: { [StaffExpenseCategoryEnum.Salary]: [] },
      expenseBreakdown: { [StaffExpenseCategoryEnum.Salary]: [] },
    });
  });

  describe('subcategory handling', () => {
    const subcategoryFund: Funds[] = [
      {
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
        `Primary-${StaffExpenseCategoryEnum.Benefits}-${StaffExpensesSubCategoryEnum.WorkersCompensation}`,
      ]);
      expect(result.current.expenseData.map((row) => row.id)).toEqual([
        `Primary-${StaffExpenseCategoryEnum.Benefits}-${StaffExpensesSubCategoryEnum.ProgramBased}`,
      ]);
    });

    it('treats null selectedCategories as all-selected, combining subcategories by sign', () => {
      const { result } = renderUseFilteredFunds(subcategoryFund, null);

      expect(result.current.incomeData.map((row) => row.id)).toEqual([
        `Primary-${StaffExpenseCategoryEnum.Benefits}-income`,
      ]);
      expect(result.current.expenseData.map((row) => row.id)).toEqual([
        `Primary-${StaffExpenseCategoryEnum.Benefits}-expense`,
      ]);
    });
  });

  it('suppresses the all-zero income row for an expense-only category', () => {
    const funds: Funds[] = [
      {
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
      `Primary-${StaffExpenseCategoryEnum.Benefits}-expense`,
    ]);
  });

  it('returns empty arrays for empty funds', () => {
    const { result } = renderUseFilteredFunds([], null);

    expect(result.current).toEqual({
      incomeData: [],
      expenseData: [],
      incomeBreakdown: {},
      expenseBreakdown: {},
    });
  });

  describe('category ordering', () => {
    it('orders income rows correctly', () => {
      const funds: Funds[] = [
        {
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

      expect(result.current.incomeBreakdown).toEqual({
        [StaffExpenseCategoryEnum.Benefits]: [
          {
            date: '2024-01-10T00:00:00Z',
            description: 'Payroll',
            category: StaffExpenseCategoryEnum.Benefits,
            subCategory: StaffExpensesSubCategoryEnum.ProgramBased,
            amount: 100,
          },
          {
            date: '2024-01-20T00:00:00Z',
            description: 'N/A',
            category: StaffExpenseCategoryEnum.Benefits,
            subCategory: StaffExpensesSubCategoryEnum.ProgramBased,
            amount: 30,
          },
        ],
      });
      expect(result.current.expenseBreakdown).toEqual({
        [StaffExpenseCategoryEnum.Benefits]: [],
      });
    });

    it('sums the breakdown back to the combined row it explains', () => {
      const { result } = renderUseFilteredFunds(breakdownFund, selected);

      const entries =
        result.current.incomeBreakdown[StaffExpenseCategoryEnum.Benefits] ?? [];

      expect(sum(entries.map((entry) => entry.amount))).toBe(
        result.current.incomeData[0].total,
      );
    });

    it('builds no breakdown for an unchecked category', () => {
      const { result } = renderUseFilteredFunds(breakdownFund, []);

      expect(result.current.incomeBreakdown).toEqual({});
      expect(result.current.expenseBreakdown).toEqual({});
    });

    it('builds no breakdown for a category without subcategories', () => {
      const funds: Funds[] = [
        {
          fundType: 'Primary',
          total: 1200,
          categories: [categoryRollup(StaffExpenseCategoryEnum.Donation, 100)],
        },
      ];

      const { result } = renderUseFilteredFunds(funds, null);

      expect(result.current.incomeData).toHaveLength(1);
      expect(result.current.incomeBreakdown).toEqual({});
      expect(result.current.expenseBreakdown).toEqual({});
    });
  });
});
