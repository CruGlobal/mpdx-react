import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { AccountList, Maybe } from 'src/graphql/types.generated';
import { useMonthlyCommitmentSingleMonthQuery } from './MonthlyCommitment.generated';

type MpdInfo = Pick<AccountList, 'activeMpdStartAt' | 'activeMpdFinishAt'>;

interface MonthlyCommitmentAverageResult {
  loading: boolean;
  average: number | null;
}

/*
 * Calculate the monthly commitment average for an account list. It represents the amount of net
 * monthly commitments that the account list has gained per month. For example, if the account list
 * went from $5000/month committed to $6000/month in 4 months of active MPD, the monthly commitment
 * average would be $250/month.
 */
export const useMonthlyCommitmentAverage = (
  accountListId: string,
  mpdInfo: Maybe<MpdInfo>,
): MonthlyCommitmentAverageResult => {
  // Calculate the first month that the user was on active MPD
  const startMonth = useMemo(() => {
    if (!mpdInfo?.activeMpdStartAt) {
      return null;
    }

    const startAt = DateTime.fromISO(mpdInfo.activeMpdStartAt);
    if (startAt > DateTime.now()) {
      // If the start at date is in the future, don't load commitment data for the start at date
      return null;
    }
    return startAt.endOf('month');
  }, [mpdInfo]);

  // Calculate the last month that the user was on active MPD
  const finishMonth = useMemo(() => {
    if (!mpdInfo?.activeMpdFinishAt) {
      return null;
    }

    const finishAt = DateTime.fromISO(mpdInfo.activeMpdFinishAt);
    // If the finish at date is in the future, clamp it to the end of the current month
    return DateTime.min(finishAt, DateTime.now()).endOf('month');
  }, [mpdInfo]);

  // Skip these queries until mpdInfo is available and also if the start date or finish date is not set
  const skip = !startMonth || !finishMonth;
  const { data: startMonthCommitment, loading: startMonthLoading } =
    useMonthlyCommitmentSingleMonthQuery({
      variables: {
        accountListId,
        month: startMonth?.toISODate() ?? '',
      },
      skip,
    });
  const { data: finishMonthCommitment, loading: finishMonthLoading } =
    useMonthlyCommitmentSingleMonthQuery({
      variables: {
        accountListId,
        month: finishMonth?.toISODate() ?? '',
      },
      skip,
    });

  const monthlyCommitmentAverage = useMemo(() => {
    if (
      !mpdInfo ||
      !startMonth ||
      !finishMonth ||
      !startMonthCommitment ||
      !finishMonthCommitment
    ) {
      // The queries are skipped or loading
      return null;
    }

    const months = Math.floor(finishMonth.diff(startMonth, 'months').months);
    if (months === 0) {
      return 0;
    }

    const startTotal =
      (startMonthCommitment.reportPledgeHistories?.[0]?.pledged ?? 0) +
      (startMonthCommitment.reportPledgeHistories?.[0]?.received ?? 0);
    const finishTotal =
      (finishMonthCommitment.reportPledgeHistories?.[0]?.pledged ?? 0) +
      (finishMonthCommitment.reportPledgeHistories?.[0]?.received ?? 0);
    return (finishTotal - startTotal) / months;
  }, [mpdInfo, startMonthCommitment, finishMonthCommitment]);

  return {
    loading: !mpdInfo || startMonthLoading || finishMonthLoading,
    average: monthlyCommitmentAverage,
  };
};
