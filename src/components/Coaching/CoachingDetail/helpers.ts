import { DateTime } from 'luxon';
import { dateFormatMonthOnly } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { CoachingPeriodEnum } from './CoachingDetail';

export const getLastNewsletter = (
  electronicDate: string | null | undefined,
  physicalDate: string | null | undefined,
): string | null => {
  if (electronicDate && physicalDate) {
    return electronicDate > physicalDate ? electronicDate : physicalDate;
  } else if (electronicDate) {
    return electronicDate;
  } else if (physicalDate) {
    return physicalDate;
  } else {
    return null;
  }
};

// Calculate the color of a result based on how close it is to the goal
export const getResultColor = (amount: number, goal: number): string => {
  if (amount >= goal) {
    return theme.palette.statusSuccess.main;
  } else if (amount >= goal * 0.8) {
    return theme.palette.statusWarning.main;
  } else {
    return theme.palette.statusDanger.main;
  }
};

export const getMonthOrWeekDateRange = (
  locale: string,
  period: CoachingPeriodEnum,
  startDate: string,
  endDate: string,
): string | null => {
  return (
    startDate &&
    endDate &&
    (period === CoachingPeriodEnum.Weekly
      ? new Intl.DateTimeFormat(locale, {
          month: 'short',
          day: 'numeric',
        }).formatRange(
          DateTime.fromISO(startDate).toJSDate(),
          DateTime.fromISO(endDate).toJSDate(),
        )
      : startDate
      ? dateFormatMonthOnly(DateTime.fromISO(startDate), locale)
      : null)
  );
};
