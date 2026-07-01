import { renderHook } from '@testing-library/react';
import { Funds } from 'src/components/Reports/MPGAIncomeExpensesReport/Helper/MPGAReportEnum';
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

const months = (...totals: number[]) =>
  totals.map((total, index) => ({
    month: `2024-${String(index + 1).padStart(2, '0')}-01`,
    total,
  }));

const mockData: Funds[] = [
  {
    fundType: 'Primary',
    total: 17960,
    categories: [
      {
        category: StaffExpenseCategoryEnum.Salary,
        total: 15200,
        averagePerMonth: 1266.67,
        breakdownByMonth: months(
          200,
          0,
          600,
          800,
          1000,
          1200,
          1400,
          1600,
          1800,
          2000,
          2200,
          2400,
        ),
        subcategories: [
          {
            subCategory: StaffExpensesSubCategoryEnum.TaxState,
            total: 7400,
            averagePerMonth: 616.67,
            breakdownByMonth: months(
              100,
              -200,
              300,
              400,
              500,
              600,
              700,
              800,
              900,
              1000,
              1100,
              1200,
            ),
          },
          {
            subCategory: StaffExpensesSubCategoryEnum.RegularPay,
            total: 7800,
            averagePerMonth: 650,
            breakdownByMonth: months(
              100,
              200,
              300,
              400,
              500,
              600,
              700,
              800,
              900,
              1000,
              1100,
              1200,
            ),
          },
        ],
      },
      {
        category: StaffExpenseCategoryEnum.HealthcareReimbursement,
        total: 2760,
        averagePerMonth: 230,
        breakdownByMonth: months(
          0,
          0,
          300,
          400,
          500,
          0,
          700,
          -40,
          900,
          0,
          0,
          0,
        ),
        subcategories: [],
      },
    ],
  },
];

describe('useFilteredFunds', () => {
  it('should filter funds correctly', () => {
    const { result } = renderHook(() =>
      useFilteredFunds(mockData, selectedCategories, t),
    );

    expect(result.current).toEqual({
      incomeData: [
        {
          id: 'Primary-SALARY-income',
          description: 'Salary',
          monthly: [
            200, 200, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400,
          ],
          average: 1283.33,
          total: 15400,
        },
        {
          id: 'Primary-HEALTHCARE_REIMBURSEMENT',
          description: 'Healthcare Reimbursement',
          monthly: [0, 0, 300, 400, 500, 0, 700, 0, 900, 0, 0, 0],
          average: 2800 / 12,
          total: 2800,
        },
      ],
      expenseData: [
        {
          id: 'Primary-SALARY-expense',
          description: 'Salary',
          monthly: [0, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          average: 16.67,
          total: 200,
        },
        {
          id: 'Primary-HEALTHCARE_REIMBURSEMENT',
          description: 'Healthcare Reimbursement',
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
        fundType: 'Primary',
        total: 300,
        categories: [
          {
            category: StaffExpenseCategoryEnum.Benefits,
            total: 300,
            averagePerMonth: 150,
            breakdownByMonth: months(100, -50),
            subcategories: [
              {
                subCategory: StaffExpensesSubCategoryEnum.WorkersCompensation,
                total: 200,
                averagePerMonth: 100,
                breakdownByMonth: months(100, 100),
              },
              {
                subCategory: StaffExpensesSubCategoryEnum.ProgramBased,
                total: -100,
                averagePerMonth: -50,
                breakdownByMonth: months(0, -100),
              },
            ],
          },
        ],
      },
    ];

    it('breaks an unchecked category into one row per subcategory with distinct ids', () => {
      const { result } = renderHook(() =>
        useFilteredFunds(subcategoryFund, [], t),
      );

      expect(result.current.incomeData.map((row) => row.id)).toEqual([
        `Primary-${StaffExpenseCategoryEnum.Benefits}-${StaffExpensesSubCategoryEnum.WorkersCompensation}`,
      ]);
      expect(result.current.expenseData.map((row) => row.id)).toEqual([
        `Primary-${StaffExpenseCategoryEnum.Benefits}-${StaffExpensesSubCategoryEnum.ProgramBased}`,
      ]);
    });

    it('treats null selectedCategories as all-selected, combining subcategories by sign', () => {
      const { result } = renderHook(() =>
        useFilteredFunds(subcategoryFund, null, t),
      );

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
            breakdownByMonth: months(-100, -200),
            subcategories: [
              {
                subCategory: StaffExpensesSubCategoryEnum.WorkersCompensation,
                total: -300,
                averagePerMonth: -150,
                breakdownByMonth: months(-100, -200),
              },
            ],
          },
        ],
      },
    ];

    const { result } = renderHook(() => useFilteredFunds(funds, null, t));

    expect(result.current.incomeData).toEqual([]);
    expect(result.current.expenseData.map((row) => row.id)).toEqual([
      `Primary-${StaffExpenseCategoryEnum.Benefits}-expense`,
    ]);
  });

  it('returns empty arrays for empty funds', () => {
    const { result } = renderHook(() => useFilteredFunds([], null, t));

    expect(result.current).toEqual({ incomeData: [], expenseData: [] });
  });
});
