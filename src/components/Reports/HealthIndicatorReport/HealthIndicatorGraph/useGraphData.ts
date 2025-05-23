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

// Round a health indicator value if it is set
const round = (value: number | null): number | null => {
  return value === null ? null : Math.round(value);
};

/**
 * Calculate the weighted average value of a particular field in an array of items, treating missing
 * values as 0.
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
      const value = item[field] ?? 0;
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
 * See the test cases for more examples of the expected outputs of various inputs.
 */
export const calculatePeriodSpans = (
  periods: HealthIndicatorGraphQuery['healthIndicatorData'],
): number[] => {
  return periods.map((period, index) => {
    // The last period always has a span of 1
    if (index === periods.length - 1) {
      return 1;
    }

    const start = DateTime.fromISO(period.indicationPeriodBegin);
    // Periods end at the start of the next period
    const end = DateTime.fromISO(periods[index + 1].indicationPeriodBegin);
    // Calculate how many days the period spans
    return end.diff(start, 'days').days;
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

    const periodSpans = calculatePeriodSpans(data.healthIndicatorData);
    return weightedAverage(data.healthIndicatorData, 'overallHi', periodSpans);
  }, [data]);

  const periods = useMemo(() => {
    if (!data) {
      return null;
    }

    return Array.from(uniqueMonths(data).values()).map((isoMonth) => {
      const periods = data.healthIndicatorData.filter((period) =>
        period.indicationPeriodBegin.startsWith(isoMonth),
      );

      const periodSpans = calculatePeriodSpans(periods);
      // Convert 0s to null
      const consistency =
        weightedAverage(periods, 'consistencyHi', periodSpans) || null;
      const depth = weightedAverage(periods, 'depthHi', periodSpans) || null;
      const ownership =
        weightedAverage(periods, 'ownershipHi', periodSpans) || null;
      const success =
        weightedAverage(periods, 'successHi', periodSpans) || null;

      // Determine the weighted average denominator
      const CONSISTENCY_WEIGHT = 1;
      const DEPTH_WEIGHT = 1;
      const OWNERSHIP_WEIGHT = 3;
      const SUCCESS_WEIGHT = 2;
      const totalWeights =
        (consistency === null ? 0 : CONSISTENCY_WEIGHT) +
        (depth === null ? 0 : DEPTH_WEIGHT) +
        (ownership === null ? 0 : OWNERSHIP_WEIGHT) +
        (success === null ? 0 : SUCCESS_WEIGHT);
      return {
        month: monthYearFormat(DateTime.fromISO(isoMonth), locale),
        consistency: round(consistency),
        depth: round(depth),
        ownership: round(ownership),
        success: round(success),
        // Scale the health indicator values by their weight in the overall calculation, ignoring missing values
        consistencyScaled:
          consistency === null
            ? null
            : Math.round((consistency * CONSISTENCY_WEIGHT) / totalWeights),
        depthScaled:
          depth === null
            ? null
            : Math.round((depth * DEPTH_WEIGHT) / totalWeights),
        ownershipScaled:
          ownership === null
            ? null
            : Math.round((ownership * OWNERSHIP_WEIGHT) / totalWeights),
        successScaled:
          success === null
            ? null
            : Math.round((success * SUCCESS_WEIGHT) / totalWeights),
      };
    });
  }, [data]);

  return {
    loading,
    average: round(averageOverallHi),
    periods,
  };
};
