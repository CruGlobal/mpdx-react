import { DateTime } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import { isNotNullish } from 'src/lib/typeGuards';
import { useHealthIndicatorGraphQuery } from './HealthIndicatorGraph.generated';

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
const scale = (
  value: number | null | undefined,
  weight = 1,
): number | null | undefined => {
  return typeof value === 'number' ? (value * weight) / 7 : value;
};

export const useGraphData = (accountListId: string): UseGraphDataResult => {
  const locale = useLocale();

  const { data, loading } = useHealthIndicatorGraphQuery({
    variables: {
      accountListId,
    },
  });

  const average = data
    ? Math.round(
        data.healthIndicatorData
          .map((month) => month.overallHi)
          .filter(isNotNullish)
          .reduce(
            (total, overall, _index, months) => total + overall / months.length,
            0,
          ),
      )
    : null;

  const periods =
    data?.healthIndicatorData.map((month) => ({
      month: monthYearFormat(
        DateTime.fromISO(month.indicationPeriodBegin),
        locale,
      ),
      consistency: month.consistencyHi,
      depth: month.depthHi,
      ownership: month.ownershipHi,
      success: month.successHi,
      consistencyScaled: scale(month.consistencyHi),
      depthScaled: scale(month.depthHi),
      ownershipScaled: scale(month.ownershipHi, 3),
      successScaled: scale(month.successHi, 2),
    })) ?? null;

  return {
    loading,
    average,
    periods,
  };
};
