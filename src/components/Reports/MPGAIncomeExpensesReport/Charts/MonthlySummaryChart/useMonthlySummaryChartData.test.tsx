import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react';
import {
  ContextType,
  MPGAIncomeExpensesContext,
} from 'src/components/Reports/MPGAIncomeExpensesReport/MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import {
  AllData,
  DataFields,
} from 'src/components/Reports/MPGAIncomeExpensesReport/mockData';
import { useMonthlySummaryChartData } from './useMonthlySummaryChartData';

const monthLabels = ['Apr 2024', 'May 2024'];

const dataField = (monthly: number[]): DataFields => ({
  id: 'id',
  description: 'description',
  monthly,
  average: 0,
  total: 0,
});

const renderUseMonthlySummaryChartData = (
  allData: AllData,
  labels: string[] = monthLabels,
) =>
  renderHook(() => useMonthlySummaryChartData(), {
    wrapper: ({ children }: { children: ReactElement }) => (
      <MPGAIncomeExpensesContext.Provider
        value={{ allData, monthLabels: labels } as unknown as ContextType}
      >
        {children}
      </MPGAIncomeExpensesContext.Provider>
    ),
  });

describe('useMonthlySummaryChartData', () => {
  it('sums income, sums the absolute value of expenses, and computes net per month', () => {
    const { result } = renderUseMonthlySummaryChartData({
      income: [dataField([1000, 2000])],
      expenses: [dataField([-400, -600]), dataField([-100, -100])],
    });

    expect(result.current).toEqual([
      { month: 'Apr 2024', income: 1000, expenses: 500, net: 500 },
      { month: 'May 2024', income: 2000, expenses: 700, net: 1300 },
    ]);
  });

  it('treats a missing monthly entry as 0', () => {
    const { result } = renderUseMonthlySummaryChartData({
      income: [dataField([1000])],
      expenses: [dataField([-400, -600])],
    });

    expect(result.current).toEqual([
      { month: 'Apr 2024', income: 1000, expenses: 400, net: 600 },
      { month: 'May 2024', income: 0, expenses: 600, net: -600 },
    ]);
  });

  it('returns an empty array when there are no months', () => {
    const { result } = renderUseMonthlySummaryChartData(
      { income: [], expenses: [] },
      [],
    );

    expect(result.current).toEqual([]);
  });
});
