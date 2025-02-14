import { DateTime } from 'luxon';
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
  const currentMonth = DateTime.now().startOf('month').toISODate();

  const currencies: CurrencyBar[] = [];
  const periods = reportsDonationHistories?.periods?.map((period) => {
    const hiPeriod = healthIndicatorData?.find(
      (item) => item.indicationPeriodBegin === period.startDate,
    );
    // The machine calculated goal cannot be used if its currency differs from the user's currency
    const machineCalculatedGoal =
      currency && currency === hiPeriod?.machineCalculatedGoalCurrency
        ? hiPeriod.machineCalculatedGoal
        : null;

    // Use the goal from preferences for the current month
    // For all other months, use the snapshot of the goal preference from the health indicator data
    // Regardless of the goal source, if it is missing, default to the machine calculated goal
    const periodGoal =
      (period.startDate === currentMonth ? goal : hiPeriod?.staffEnteredGoal) ??
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
