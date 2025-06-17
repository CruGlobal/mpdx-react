import { DateTime } from 'luxon';

export const getTwelveMonthReportDateRange = (): {
  startDate: string;
  endDate: string;
} => {
  const startDate = DateTime.now()
    .startOf('month')
    .minus({ months: 12 })
    .toISODate();
  const endDate = DateTime.now()
    .startOf('month')
    .minus({ days: 1 })
    .endOf('day')
    .toISODate();
  return { startDate, endDate };
};
