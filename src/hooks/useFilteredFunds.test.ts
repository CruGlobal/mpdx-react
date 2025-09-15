import { renderHook } from '@testing-library/react';
import { ReportsStaffExpensesQuery } from 'src/components/Reports/MPGAIncomeExpensesReport/ReportsStaffExpenses.generated';
import { useFilteredFunds } from './useFilteredFunds';

const mockData: ReportsStaffExpensesQuery = {
  reportsStaffExpenses: {
    funds: [
      {
        categories: [
          {
            category: 'Example Category 1',
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
            subcategories: [
              {
                subCategory: 'Example Subcategory',
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
            category: 'Example Category 2',
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
        fundType: 'Primary',
        total: 10560,
      },
    ],
  },
};

describe('useFilteredFunds', () => {
  it('should filter funds correctly', () => {
    const { result } = renderHook(() => useFilteredFunds(mockData));

    expect(result.current).toEqual({
      incomeData: [
        {
          id: 'Primary-Example Category 1-Example Subcategory',
          description: 'Example Category 1 - Example Subcategory',
          monthly: [
            100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200,
          ],
          average: 650,
          total: 7800,
        },
        {
          id: 'Primary-Example Category 2',
          description: 'Example Category 2',
          monthly: [0, 0, 300, 400, 500, 0, 700, 0, 900, 0, 0, 0],
          average: 2800 / 12,
          total: 2800,
        },
      ],
      expenseData: [
        {
          id: 'Primary-Example Category 2',
          description: 'Example Category 2',
          monthly: [0, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0, 0],
          average: 40 / 12,
          total: 40,
        },
      ],
    });
  });
});
