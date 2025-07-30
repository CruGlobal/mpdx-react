import { DateTime, DateTimeFormatOptions } from 'luxon';
import { DateRange } from './StaffReportEnum';

export const formatHelper: DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export const formatDate = (date: DateTime, locale: string) => {
  return date.toJSDate().toLocaleDateString(locale, formatHelper);
};

export const dateRangeToString = (dateRange: DateRange, locale: string) => {
  const now = DateTime.now();
  return {
    [DateRange.WeekToDate]: [
      getFormattedDateString(now.minus({ weeks: 1 }), now, locale),
    ],
    [DateRange.MonthToDate]: [
      getFormattedDateString(now.minus({ months: 1 }), now, locale),
    ],
    [DateRange.YearToDate]: [
      getFormattedDateString(now.minus({ years: 1 }), now, locale),
    ],
  }[dateRange];
};

export const getFormattedDateString = (
  startDate: DateTime,
  endDate: DateTime,
  locale: string,
) => {
  const formattedStart = formatDate(startDate, locale);
  const formattedEnd = formatDate(endDate, locale);
  const dateString = `${formattedStart} - ${formattedEnd}`;
  return dateString;
};
