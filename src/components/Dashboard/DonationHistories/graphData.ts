import { DateTime } from 'luxon';
import { monthYearFormat } from 'src/lib/intlFormat';
import { DonationHistoriesData } from './DonationHistories';

export interface CalculateGraphDataOptions {
  locale: string;
  data: DonationHistoriesData | undefined;
  currencyColors: string[];
}

export interface Period {
  currencies: Record<string, number>;
  startDate: string;
  total: number;
  goal: number | null;
  period: DateTime;
}

export interface CurrencyBar {
  name: string;
  fill: string;
}

export interface CalculateGraphDataResult {
  periods: Period[] | undefined;
  currencies: CurrencyBar[];
  empty: boolean;
  domainMax: number;
}

export const calculateGraphData = ({
  locale,
  data,
  currencyColors,
}: CalculateGraphDataOptions): CalculateGraphDataResult => {
  const {
    currency,
    monthlyGoal: goal,
    totalPledges: pledged,
  } = data?.accountList ?? {};
  const { healthIndicatorData, reportsDonationHistories } = data ?? {};
  const currentMonth = DateTime.now();

  const currencies: CurrencyBar[] = [];
  const periods = reportsDonationHistories?.periods?.map((period) => {
    const startDate = DateTime.fromISO(period.startDate);

    // Look up the latest health indicator period in or before the current report period, without
    // going over. This handles potentially missing periods because health indicator data is not
    // guaranteed to be available for every day. Because health indicator periods are sorted
    // in ascending order, if e.g. March has no health indicator data, February will be used
    // instead. If there are multiple health indicator periods in a report period, the latest one
    // will be selected.
    const hiPeriod = healthIndicatorData?.findLast(
      (item) => item.indicationPeriodBegin <= period.endDate,
    );
    // The machine calculated goal cannot be used if its currency differs from the user's currency
    const machineCalculatedGoal =
      currency && currency === hiPeriod?.machineCalculatedGoalCurrency
        ? hiPeriod.machineCalculatedGoal
        : null;

    const periodGoal =
      // In the current month, give the goal from preferences the highest precedence
      (startDate.hasSame(currentMonth, 'month') ? goal : null) ??
      // Fall back to the staff-entered goal if the preferences goal is unavailable or it is not the current month
      hiPeriod?.staffEnteredGoal ??
      // Finally, fall back to the machine-calculated goal as a last resort
      machineCalculatedGoal;

    const periodData: Period = {
      currencies: {},
      startDate: monthYearFormat(startDate, locale, false),
      total: period.convertedTotal,
      goal: periodGoal ?? null,
      period: startDate,
    };
    period.totals.forEach((total) => {
      if (!currencies.find((currency) => total.currency === currency.name)) {
        currencies.push({
          name: total.currency,
          fill: currencyColors[currencies.length % currencyColors.length],
        });
      }
      periodData.currencies[total.currency] = total.convertedAmount;
    });
    return periodData;
  });

  const empty =
    (periods ?? []).reduce((result, { total }) => result + total, 0) === 0;

  const domainMax = Math.max(
    ...(periods ?? [])?.flatMap((period) => [
      period.total,
      // Include the goal if it is present
      ...(period.goal === null ? [] : [period.goal]),
    ]),
    pledged ?? 0,
    reportsDonationHistories?.averageIgnoreCurrent ?? 0,
  );

  return { periods, currencies, empty, domainMax };
};
