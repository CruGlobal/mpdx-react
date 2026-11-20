import { DateTime } from 'luxon';
import {
  MonthlySummaryAverages,
  MonthlySummaryChartData,
} from 'src/components/Reports/MPGAIncomeExpensesReport/Charts/MonthlySummaryChart/MonthlySummaryChart';
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

// Months with no amount (not synced) are left out so they don't drag the
// average down. A reported $0 counts.
const average = (values: Array<number | null | undefined>) => {
  const amounts = values.filter(
    (value): value is number => value !== null && value !== undefined,
  );
  if (amounts.length === 0) {
    return undefined;
  }
  return amounts.reduce((sum, value) => sum + value, 0) / amounts.length;
};

const isEmpty = (month: MonthAmounts) =>
  !month.contributions && !month.expenses;

// The API's last row is the current month, still in progress, so it is left
// out too, the same as the Dashboard's donation average. The API sends the
// months before someone joined as $0, so empty months before their first
// activity are left out as well. `months` is how many months are averaged.
export const monthlyAverages = (
  months: MonthAmounts[],
): MonthlySummaryAverages & { months: number } => {
  const finishedMonths = months.slice(0, -1);
  const firstActive = finishedMonths.findIndex((month) => !isEmpty(month));
  const pastMonths = firstActive < 0 ? [] : finishedMonths.slice(firstActive);
  return {
    income: average(pastMonths.map((month) => month.contributions)),
    expenses: average(pastMonths.map((month) => month.expenses)),
    months: pastMonths.length,
  };
};
