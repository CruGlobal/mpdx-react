import { DateTime } from 'luxon';
import { dateFormatMonthOnly } from 'src/lib/intlFormat';
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
