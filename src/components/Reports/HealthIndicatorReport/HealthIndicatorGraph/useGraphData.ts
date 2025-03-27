import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import {
  HealthIndicatorGraphQuery,
  useHealthIndicatorGraphQuery,
} from './HealthIndicatorGraph.generated';

export interface Period {
  month: string;
  consistency: number | null | undefined;
  consistencyScaled: number | null | undefined;
  depth: number | null | undefined;
  depthScaled: number | null | undefined;
  ownership: number | null | undefined;
  ownershipScaled: number | null | undefined;
  success: number | null | undefined;
  successScaled: number | null | undefined;
}

interface UseGraphDataResult {
  loading: boolean;
  average: number | null;
  periods: Period[] | null;
}

// Scale a health indicator value by its weight in the overall calculation
const scale = (value: number | null, weight = 1): number | null => {
  return value === null ? null : (value * weight) / 7;
};

// Round a health indicator value if it is set
const round = (value: number | null): number | null => {
  return value === null ? null : Math.round(value);
};

/**
 * Calculate the weighted average value of a particular field in an array of items, ignoring
 * missing values.
 *
 * @param items An array of records with a property {@link field} that is `number | null | undefined`
 * @param field The field in {@link items} to be averaged
 * @param weights An array of each item's weight. It must have the same length as {@link items}.
 * @returns `null` if no records had the field, or the average otherwise
 */
export const weightedAverage = <
  Item extends { [_ in Field]?: number | null | undefined },
  Field extends keyof Item,
>(
  items: Array<Item>,
  field: Field,
  weights: number[],
): number | null => {
  const { total, denominator } = items.reduce(
    ({ total, denominator }, item, index) => {
      const value = item[field];
      if (typeof value !== 'number') {
        // Ignore missing values
        return { total, denominator };
      }

      const weight = weights[index];
      return {
        total: total + value * weight,
        denominator: denominator + weight,
      };
    },
    { total: 0, denominator: 0 },
  );

  return denominator === 0 ? null : total / denominator;
};

/**
 * Calculate the unique months represented in the health indicator periods.
 */
export const uniqueMonths = (
  data: HealthIndicatorGraphQuery | undefined,
): Set<string> => {
  return new Set(
    data?.healthIndicatorData.map((period) =>
      // Extract the year and month from the ISO timestamp
      period.indicationPeriodBegin.slice(0, 7),
    ),
  );
};

/**
 * If there are missing periods, we need to extrapolate the existing periods to fill in the missing
 * ones. When there are missing periods, the periods around them will need to span multiple days
 * instead of just a single day. This code calculates how many days each period spans.
 *
 * For example:
 * - In a month without missing periods, this will be an array of 1s, i.e. [1, 1, 1, 1, 1, ...].
 * - In January with periods for the 5th, 15th, and 25th, this will be [10, 10, 1] because the
 *   first period spans from January 5-14, the second spans from January 15-24, and the third
 *   only covers January 25.
 *
 * `calculatePeriodSpans` also accepts `periodStart` and `periodEnd` that control how and whether
 * the first and last periods are extrapolated backwards and forwards, respectively.
 *
 * For example:
 * - If `periodStart` is January 1 and the periods are the 5th, 15th, and 25th, the first period's
 *   span will be 14 because it spans from January 1-14.
 * - If `periodEnd` is January 31 and the periods are the 5th, 15th, and 25th, the last period's
 *   span will be 7 because it spans from January 25-31.
 *
 * See the test cases for more examples of the expected outputs of various inputs.
 */
export const calculatePeriodSpans = (
  periods: HealthIndicatorGraphQuery['healthIndicatorData'],
  periodStart: DateTime | null,
  periodEnd: DateTime | null,
): number[] => {
  return periods.map((period, index, periods) => {
    // The first period may have a custom start date
    const start =
      index === 0 && periodStart
        ? periodStart
        : DateTime.fromISO(period.indicationPeriodBegin);
    // The last period may have a custom end date, otherwise this period ends at the start of the next one
    const end =
      index === periods.length - 1
        ? (periodEnd ?? start).plus({ days: 1 })
        : DateTime.fromISO(periods[index + 1].indicationPeriodBegin);
    // Calculate how many days the period spans
    return Math.floor(end.diff(start, 'days').days);
  });
};

export const useGraphData = (accountListId: string): UseGraphDataResult => {
  const locale = useLocale();

  const { data, loading } = useHealthIndicatorGraphQuery({
    variables: {
      accountListId,
    },
  });

  const averageOverallHi = useMemo(() => {
    if (!data) {
      return null;
    }

    const periodSpans = calculatePeriodSpans(
      data.healthIndicatorData,
      null,
      null,
    );
    return weightedAverage(data.healthIndicatorData, 'overallHi', periodSpans);
  }, [data]);

  const periods = useMemo(() => {
    if (!data) {
      return null;
    }

    return Array.from(uniqueMonths(data).values()).map(
      (isoMonth, monthIndex, months) => {
        const periods = data.healthIndicatorData.filter((period) =>
          period.indicationPeriodBegin.startsWith(isoMonth),
        );

        // The oldest month starts with its first period, but all others start on the first of the month
        const periodStart =
          monthIndex === 0 && periods.length
            ? null
            : DateTime.fromISO(periods[0].indicationPeriodBegin).startOf(
                'month',
              );
        // The newest month ends with its last period, but all others end on the end of the month
        const periodEnd =
          monthIndex === months.length - 1 && periods.length
            ? null
            : DateTime.fromISO(periods[0].indicationPeriodBegin)
                .endOf('month')
                .startOf('day');
        const periodSpans = calculatePeriodSpans(
          periods,
          periodStart,
          periodEnd,
        );

        const consistency = weightedAverage(
          periods,
          'consistencyHi',
          periodSpans,
        );
        const depth = weightedAverage(periods, 'depthHi', periodSpans);
        const ownership = weightedAverage(periods, 'ownershipHi', periodSpans);
        const success = weightedAverage(periods, 'successHi', periodSpans);

        return {
          month: monthYearFormat(DateTime.fromISO(isoMonth), locale),
          consistency: round(consistency),
          depth: round(depth),
          ownership: round(ownership),
          success: round(success),
          consistencyScaled: round(scale(consistency)),
          depthScaled: round(scale(depth)),
          ownershipScaled: round(scale(ownership, 3)),
          successScaled: round(scale(success, 2)),
        };
      },
    );
  }, [data]);

  return {
    loading,
    average: round(averageOverallHi),
    periods,
  };
};
