import { DateTime } from 'luxon';
import { AccountList } from 'src/graphql/types.generated';

export const formatStartDate = (
  startDate: string | null | undefined,
  locale: string,
): string => {
  if (!startDate) {
    return '';
  }

  return DateTime.fromISO(startDate).toJSDate().toLocaleDateString(locale, {
    month: 'short',
    year: '2-digit',
  });
};

/*
 * Calculate the monthly commitment goal for an account list. For example, if the account list is
 * trying to raise $1200 in 3 months, the monthly commitment goal would be $400/month.
 */
export const calculateMonthlyCommitmentGoal = (
  mpdInfo: Pick<
    AccountList,
    'activeMpdMonthlyGoal' | 'activeMpdStartAt' | 'activeMpdFinishAt'
  >,
): number | null => {
  const {
    activeMpdMonthlyGoal: goal,
    activeMpdStartAt: startDate,
    activeMpdFinishAt: endDate,
  } = mpdInfo;

  if (typeof goal !== 'number') {
    return null;
  }

  if (typeof startDate === 'string' && typeof endDate === 'string') {
    // Calculate the number of months that the user is on full-time MPD
    const activeMpdMonths = DateTime.fromISO(endDate)
      .startOf('month')
      .diff(DateTime.fromISO(startDate).startOf('month'), 'months').months;

    if (activeMpdMonths > 0) {
      return goal / activeMpdMonths;
    }
  }

  return goal;
};
