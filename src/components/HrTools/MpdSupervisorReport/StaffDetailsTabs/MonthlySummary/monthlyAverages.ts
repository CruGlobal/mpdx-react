import { MonthlySummaryAverages } from 'src/components/Reports/MPGAIncomeExpensesReport/Charts/MonthlySummaryChart/MonthlySummaryChart';

interface MonthAmounts {
  contributions?: number | null;
  expenses?: number | null;
}

// Months with no amount yet (the current month, months before they joined)
// are left out so they don't drag the average down. A reported $0 counts.
const average = (values: Array<number | null | undefined>) => {
  const amounts = values.filter(
    (value): value is number => value !== null && value !== undefined,
  );
  if (amounts.length === 0) {
    return undefined;
  }
  return amounts.reduce((sum, value) => sum + value, 0) / amounts.length;
};

export const monthlyAverages = (
  months: MonthAmounts[],
): MonthlySummaryAverages => ({
  income: average(months.map((month) => month.contributions)),
  expenses: average(months.map((month) => month.expenses)),
});
