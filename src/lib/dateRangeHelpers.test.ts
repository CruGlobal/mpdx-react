import { DateTime, Settings } from 'luxon';
import { getTwelveMonthReportDateRange } from './dateRangeHelpers';

describe('getTwelveMonthReportDateRange', () => {
  it('should return startDate and endDate as ISO strings', () => {
    const twelveMonthReportDateRange = getTwelveMonthReportDateRange();
    expect(typeof twelveMonthReportDateRange).toBe('string');
    expect(twelveMonthReportDateRange).toMatch(
      /^\d{4}-\d{2}-\d{2}\.\.\.\d{4}-\d{2}-\d{2}$/,
    );
  });

  it('should return a startDate 12 months before the current month and endDate as last day of previous month', () => {
    const now = DateTime.local();
    const expectedStart = now
      .minus({ months: 12 })
      .startOf('month')
      .toISODate();
    const expectedEnd = now.minus({ months: 1 }).endOf('month').toISODate();
    expect(getTwelveMonthReportDateRange()).toBe(
      `${expectedStart}...${expectedEnd}`,
    );
  });

  it('should return correct dates on the first day of the month', () => {
    Settings.now = () => new Date(2025, 5, 1).valueOf();
    const twelveMonthReportDateRange = getTwelveMonthReportDateRange();
    const [startDate, endDate] = twelveMonthReportDateRange.split('...');
    expect(startDate).toBe('2024-06-01');
    expect(endDate).toBe('2025-05-31');
  });

  it('should return correct dates in the middle of the month', () => {
    Settings.now = () => new Date(2025, 5, 15).valueOf();
    const twelveMonthReportDateRange = getTwelveMonthReportDateRange();
    const [startDate, endDate] = twelveMonthReportDateRange.split('...');
    expect(startDate).toBe('2024-06-01');
    expect(endDate).toBe('2025-05-31');
  });

  it('should return correct dates at the end of the month', () => {
    Settings.now = () => new Date(2025, 5, 30).valueOf();
    const twelveMonthReportDateRange = getTwelveMonthReportDateRange();
    const [startDate, endDate] = twelveMonthReportDateRange.split('...');
    expect(startDate).toBe('2024-06-01');
    expect(endDate).toBe('2025-05-31');
  });
});
