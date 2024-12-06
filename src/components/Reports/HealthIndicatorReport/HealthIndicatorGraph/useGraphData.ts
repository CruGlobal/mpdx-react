import { DateTime } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import { isNotNullish } from 'src/lib/typeGuards';
import { useHealthIndicatorGraphQuery } from './HealthIndicatorGraph.generated';

export interface Period {
  month: string;
  consistencyHi: number | null | undefined;
  consistencyHiScaled: number | null | undefined;
  depthHi: number | null | undefined;
  depthHiScaled: number | null | undefined;
  ownershipHi: number | null | undefined;
  ownershipHiScaled: number | null | undefined;
  successHi: number | null | undefined;
  successHiScaled: number | null | undefined;
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
            (total, overallHi, _index, months) =>
              total + overallHi / months.length,
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
      consistencyHi: month.consistencyHi,
      depthHi: month.depthHi,
      ownershipHi: month.ownershipHi,
      successHi: month.successHi,
      consistencyHiScaled: scale(month.consistencyHi),
      depthHiScaled: scale(month.depthHi),
      ownershipHiScaled: scale(month.ownershipHi, 3),
      successHiScaled: scale(month.successHi, 2),
    })) ?? null;

  return {
    loading,
    average,
    periods,
  };
};
