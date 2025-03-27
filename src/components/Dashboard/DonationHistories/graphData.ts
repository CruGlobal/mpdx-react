import { DateTime } from 'luxon';
import { getHealthIndicatorInfo } from 'src/lib/healthIndicator';
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
  const pledged = data?.accountList?.totalPledges;
  const { healthIndicatorData, reportsDonationHistories } = data ?? {};
  const currentMonth = DateTime.now().startOf('month').toISODate();

  const currencies: CurrencyBar[] = [];
  const periods = reportsDonationHistories?.periods?.map((period) => {
    // Look up the health indicator period that most closely matches the current period, without
    // going over. This handles potentially missing periods because health indicator data is not
    // guaranteed to be available for every month. Because health indicator periods are sorted
    // in ascending order, if e.g. March has no health indicator data, February will be used instead.
    const hiPeriod = healthIndicatorData?.findLast(
      (item) => item.indicationPeriodBegin <= period.startDate,
    );

    const { machineCalculatedGoal, preferencesGoal } = getHealthIndicatorInfo(
      data?.accountList,
      hiPeriod,
    );

    const periodGoal =
      // In the current month, give the goal from preferences the highest precedence
      (period.startDate === currentMonth ? preferencesGoal : null) ??
      // Fall back to the staff-entered goal if the preferences goal is unavailable or it is not the current month
      hiPeriod?.staffEnteredGoal ??
      // Finally, fall back to the machine-calculated goal as a last resort
      machineCalculatedGoal;

    const periodData: Period = {
      currencies: {},
      startDate: DateTime.fromISO(period.startDate)
        .toJSDate()
        .toLocaleDateString(locale, { month: 'short', year: '2-digit' }),
      total: period.convertedTotal,
      goal: periodGoal ?? null,
      period: DateTime.fromISO(period.startDate),
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
