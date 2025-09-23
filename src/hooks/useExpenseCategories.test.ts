import { renderHook } from '@testing-library/react';
import { mockData } from 'src/components/Reports/MPGAIncomeExpensesReport/mockData';
import { useExpenseCategories } from './useExpenseCategories';

describe('useExpenseCategories', () => {
  it('should categorize expenses correctly', () => {
    const { result } = renderHook(() =>
      useExpenseCategories(mockData.expenses),
    );

    expect(result.current.ministryTotal).toBe(2124);
    expect(result.current.healthcareTotal).toBe(1933);
    expect(result.current.assessmentTotal).toBe(26);
    expect(result.current.otherTotal).toBe(14486);
    expect(result.current.expensesTotal).toBe(18569);
  });

  it('should update categories when data changes', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useExpenseCategories(data),
      { initialProps: { data: mockData.expenses } },
    );

    const newData = [
      ...mockData.expenses,
      {
        id: '7',
        description: 'ministry reimbursement',
        monthly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12],
        average: 1,
        total: 12,
      },
    ];

    rerender({ data: newData });

    expect(result.current.ministryTotal).toBe(2136);
    expect(result.current.healthcareTotal).toBe(1933);
    expect(result.current.assessmentTotal).toBe(26);
    expect(result.current.otherTotal).toBe(14486);
    expect(result.current.expensesTotal).toBe(18581);
  });
});
