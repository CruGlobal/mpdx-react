import { useMemo } from 'react';
import { useMPGAIncomeExpenses } from 'src/components/Reports/MPGAIncomeExpensesReport/MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';

export interface MonthlySummaryChartData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export const useMonthlySummaryChartData = (): MonthlySummaryChartData[] => {
  const {
    allData: { income: incomeData, expenses: expenseData },
    monthLabels: months,
  } = useMPGAIncomeExpenses();

  return useMemo(
    () =>
      months.map((month, index) => {
        const income = incomeData.reduce(
          (sum, item) => sum + (item.monthly[index] ?? 0),
          0,
        );
        const expenses = expenseData.reduce(
          (sum, item) => sum + Math.abs(item.monthly[index] ?? 0),
          0,
        );
        return {
          month,
          income,
          expenses,
          net: income - expenses,
        };
      }),
    [incomeData, expenseData, months],
  );
};
