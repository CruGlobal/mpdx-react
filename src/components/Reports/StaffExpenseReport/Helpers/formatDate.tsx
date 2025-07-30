import { DateTime } from 'luxon';
import { DateRange } from './StaffReportEnum';

export const formatDate = (date: DateTime, locale: string) => {
  return date.toJSDate().toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const dateRangeToString = (dateRange: DateRange, locale: string) => {
  const now = DateTime.now();
  switch (dateRange) {
    case DateRange.WeekToDate:
      return getFormattedDateString(now.startOf('week'), now, locale);
    case DateRange.MonthToDate:
      return getFormattedDateString(now.startOf('month'), now, locale);
    case DateRange.YearToDate:
      return getFormattedDateString(now.startOf('year'), now, locale);
    default:
      return '';
  }
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
