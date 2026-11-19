import { DateTime } from 'luxon';
import { MonthlySummaryChartData } from 'src/components/Reports/MPGAIncomeExpensesReport/Charts/MonthlySummaryChart/MonthlySummaryChart';
import { MonthlySummaryAverages } from 'src/components/Reports/MPGAIncomeExpensesReport/Charts/MonthlySummaryChart/averageReferenceLines';
import { monthYearFormat } from 'src/lib/intlFormat';
import { MonthlyPayrollSummaryQuery } from './MonthlyPayrollSummary.generated';

type MonthAmounts = Partial<
  Pick<
    MonthlyPayrollSummaryQuery['monthlyPayrollSummary'][number],
    'month' | 'contributions' | 'expenses' | 'net'
  >
>;

export const toChartData = (
  months: MonthAmounts[],
  locale: string,
): MonthlySummaryChartData[] =>
  months.map((summary) => {
    const date = DateTime.fromISO(summary.month ?? '');
    return {
      month: date.isValid ? monthYearFormat(date.month, date.year, locale) : '',
      income: summary.contributions ?? 0,
      expenses: summary.expenses ?? 0,
      net: summary.net ?? 0,
    };
  });

// Months with no amount (before they joined, or not synced) are left out so
// they don't drag the average down. A reported $0 counts.
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
