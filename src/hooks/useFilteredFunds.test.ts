import { renderHook } from '@testing-library/react';
import { Funds } from 'src/components/Reports/MPGAIncomeExpensesReport/Helper/MPGAReportEnum';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import { useFilteredFunds } from './useFilteredFunds';

const t = jest.fn((key) => key);
const selectedCategories = [
  StaffExpenseCategoryEnum.MinistryReimbursement,
  StaffExpenseCategoryEnum.HealthcareReimbursement,
];

const mockData: Funds[] = [
  {
    fundType: 'Primary',
    total: 17960,
    categories: [
      {
        category: StaffExpenseCategoryEnum.MinistryReimbursement,
        total: 15200,
        averagePerMonth: 1266.67,
        breakdownByMonth: [
          {
            month: '2024-01-01',
            total: 200,
          },
          {
            month: '2024-02-01',
            total: 0,
          },
          {
            month: '2024-03-01',
            total: 600,
          },
          {
            month: '2024-04-01',
            total: 800,
          },
          {
            month: '2024-05-01',
            total: 1000,
          },
          {
            month: '2024-06-01',
            total: 1200,
          },
          {
            month: '2024-07-01',
            total: 1400,
          },
          {
            month: '2024-08-01',
            total: 1600,
          },
          {
            month: '2024-09-01',
            total: 1800,
          },
          {
            month: '2024-10-01',
            total: 2000,
          },
          {
            month: '2024-11-01',
            total: 2200,
          },
          {
            month: '2024-12-01',
            total: 2400,
          },
        ],
        subcategories: [
          {
            subCategory: StaffExpensesSubCategoryEnum.MinistryReimbursement,
            total: 7400,
            averagePerMonth: 616.67,
            breakdownByMonth: [
              {
                month: '2024-01-01',
                total: 100,
              },
              {
                month: '2024-02-01',
                total: -200,
              },
              {
                month: '2024-03-01',
                total: 300,
              },
              {
                month: '2024-04-01',
                total: 400,
              },
              {
                month: '2024-05-01',
                total: 500,
              },
              {
                month: '2024-06-01',
                total: 600,
              },
              {
                month: '2024-07-01',
                total: 700,
              },
              {
                month: '2024-08-01',
                total: 800,
              },
              {
                month: '2024-09-01',
                total: 900,
              },
              {
                month: '2024-10-01',
                total: 1000,
              },
              {
                month: '2024-11-01',
                total: 1100,
              },
              {
                month: '2024-12-01',
                total: 1200,
              },
            ],
          },
          {
            subCategory: StaffExpensesSubCategoryEnum.MinistryReimbursement,
            total: 7800,
            averagePerMonth: 650,
            breakdownByMonth: [
              {
                month: '2024-01-01',
                total: 100,
              },
              {
                month: '2024-02-01',
                total: 200,
              },
              {
                month: '2024-03-01',
                total: 300,
              },
              {
                month: '2024-04-01',
                total: 400,
              },
              {
                month: '2024-05-01',
                total: 500,
              },
              {
                month: '2024-06-01',
                total: 600,
              },
              {
                month: '2024-07-01',
                total: 700,
              },
              {
                month: '2024-08-01',
                total: 800,
              },
              {
                month: '2024-09-01',
                total: 900,
              },
              {
                month: '2024-10-01',
                total: 1000,
              },
              {
                month: '2024-11-01',
                total: 1100,
              },
              {
                month: '2024-12-01',
                total: 1200,
              },
            ],
          },
        ],
      },
      {
        category: StaffExpenseCategoryEnum.HealthcareReimbursement,
        total: 2760,
        averagePerMonth: 230,
        breakdownByMonth: [
          {
            month: '2024-01-01',
            total: 0,
          },
          {
            month: '2024-02-01',
            total: 0,
          },
          {
            month: '2024-03-01',
            total: 300,
          },
          {
            month: '2024-04-01',
            total: 400,
          },
          {
            month: '2024-05-01',
            total: 500,
          },
          {
            month: '2024-06-01',
            total: 0,
          },
          {
            month: '2024-07-01',
            total: 700,
          },
          {
            month: '2024-08-01',
            total: -40,
          },
          {
            month: '2024-09-01',
            total: 900,
          },
          {
            month: '2024-10-01',
            total: 0,
          },
          {
            month: '2024-11-01',
            total: 0,
          },
          {
            month: '2024-12-01',
            total: 0,
          },
        ],
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
          id: 'Primary-MINISTRY_REIMBURSEMENT-income',
          description: 'Ministry Reimbursement',
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
          id: 'Primary-MINISTRY_REIMBURSEMENT-expense',
          description: 'Ministry Reimbursement',
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
});
