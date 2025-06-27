import { DateTime } from 'luxon';

export const getTwelveMonthReportDateRange = (): string => {
  const startDate = DateTime.now()
    .startOf('month')
    .minus({ months: 12 })
    .toISODate();
  const endDate = DateTime.now()
    .startOf('month')
    .minus({ months: 1 })
    .endOf('month')
    .toISODate();
  return `${startDate}...${endDate}`;
};
