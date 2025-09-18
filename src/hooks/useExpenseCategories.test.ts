import { renderHook } from '@testing-library/react';
import { mockData } from 'src/components/Reports/MPGAIncomeExpensesReport/mockData';
import { useExpenseCategories } from './useExpenseCategories';

describe('useExpenseCategories', () => {
  it('should categorize expenses correctly', () => {
    const { result } = renderHook(() =>
      useExpenseCategories(mockData.expenses),
    );

    expect(result.current.ministry).toHaveLength(1);
    expect(result.current.healthcare).toHaveLength(1);
    expect(result.current.assessment).toHaveLength(1);
    expect(result.current.other).toHaveLength(3);
  });
});
