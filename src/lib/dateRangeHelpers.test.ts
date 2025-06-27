import { Settings } from 'luxon';
import { getTwelveMonthReportDateRange } from './dateRangeHelpers';

describe('getTwelveMonthReportDateRange', () => {
  it('should return correct dates on the first day of the month', () => {
    Settings.now = () => new Date(2025, 5, 1).valueOf();
    expect(getTwelveMonthReportDateRange()).toBe('2024-06-01...2025-05-31');
  });

  it('should return correct dates in the middle of the month', () => {
    Settings.now = () => new Date(2025, 5, 15).valueOf();
    expect(getTwelveMonthReportDateRange()).toBe('2024-06-01...2025-05-31');
  });

  it('should return correct dates at the end of the month', () => {
    Settings.now = () => new Date(2025, 5, 30).valueOf();
    expect(getTwelveMonthReportDateRange()).toBe('2024-06-01...2025-05-31');
  });
});
