import { DateTime } from 'luxon';
import { getTwelveMonthReportDateRange } from './dateRangeHelpers';

describe('getTwelveMonthReportDateRange', () => {
  it('should return startDate and endDate as ISO strings', () => {
    const { startDate, endDate } = getTwelveMonthReportDateRange();
    expect(typeof startDate).toBe('string');
    expect(typeof endDate).toBe('string');
    expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return a startDate 12 months before the current month and endDate as last day of previous month', () => {
    const now = DateTime.local();
    const expectedStart = now
      .minus({ months: 12 })
      .startOf('month')
      .toISODate();
    const expectedEnd = now.minus({ months: 1 }).endOf('month').toISODate();
    const { startDate, endDate } = getTwelveMonthReportDateRange();
    expect(startDate).toBe(expectedStart);
    expect(endDate).toBe(expectedEnd);
  });
});
