import { DateTime, DateTimeFormatOptions } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import { DateRange } from './StaffReportEnum';

export const formatHelper: DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export const formatDate = (date: DateTime) => {
  return date.toJSDate().toLocaleDateString(useLocale(), formatHelper);
};

export const dateRangeToString = (dateRange: DateRange) => {
  const now = DateTime.now();
  return {
    [DateRange.WeekToDate]: [
      getFormattedDateString(now.minus({ weeks: 1 }), now),
    ],
    [DateRange.MonthToDate]: [
      getFormattedDateString(now.minus({ months: 1 }), now),
    ],
    [DateRange.YearToDate]: [
      getFormattedDateString(now.minus({ years: 1 }), now),
    ],
  }[dateRange];
};

export const getFormattedDateString = (
  startDate: DateTime,
  endDate: DateTime,
) => {
  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);
  const dateString = `${formattedStart} - ${formattedEnd}`;
  return dateString;
};
