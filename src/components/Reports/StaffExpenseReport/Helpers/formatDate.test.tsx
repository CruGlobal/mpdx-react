import { DateTime } from 'luxon';
import { DateRange } from './StaffReportEnum';
import {
  dateRangeToString,
  formatDate,
  getFormattedDateString,
} from './formatDate';

/* The default now date is not helpful for these particular tests
 * (for example, Year to Date would return January 1, 2020 - January 1, 2020),
 * so it is mocked to a different date.
 */
jest
  .spyOn(DateTime, 'now')
  .mockImplementation(() => DateTime.fromISO('2020-06-18') as DateTime<true>);

describe('formatDate', () => {
  it('formats a DateTime object to a localized string', () => {
    const date = DateTime.fromISO('2023-06-15');
    const locale = 'en-US';
    expect(formatDate(date, locale)).toBe('June 15, 2023');
  });

  it('formats a DateTime object to a different locale', () => {
    const date = DateTime.fromISO('2023-06-15');
    const locale = 'de-DE';
    expect(formatDate(date, locale)).toBe('15. Juni 2023');
  });
});

describe('getFormattedDateString', () => {
  it('returns a formatted date range string', () => {
    const start = DateTime.fromISO('2023-01-01');
    const end = DateTime.fromISO('2023-01-31');
    const locale = 'en-US';
    expect(getFormattedDateString(start, end, locale)).toBe(
      'January 1, 2023 - January 31, 2023',
    );
  });

  it('returns a formatted date range string in another locale', () => {
    const start = DateTime.fromISO('2023-01-01');
    const end = DateTime.fromISO('2023-01-31');
    const locale = 'fr-FR';
    expect(getFormattedDateString(start, end, locale)).toBe(
      '1 janvier 2023 - 31 janvier 2023',
    );
  });

  it('returns week to date range string', () => {
    const locale = 'en-US';
    expect(dateRangeToString(DateRange.WeekToDate, locale)).toEqual([
      'June 15, 2020 - June 18, 2020',
    ]);
  });

  it('returns month to date range string', () => {
    const locale = 'en-US';
    expect(dateRangeToString(DateRange.MonthToDate, locale)).toEqual([
      'June 1, 2020 - June 18, 2020',
    ]);
  });

  it('returns year to date range string', () => {
    const locale = 'en-US';
    expect(dateRangeToString(DateRange.YearToDate, locale)).toEqual([
      'January 1, 2020 - June 18, 2020',
    ]);
  });

  it('returns week to date range string in different locale', () => {
    const locale = 'de-DE';
    expect(dateRangeToString(DateRange.WeekToDate, locale)).toEqual([
      '15. Juni 2020 - 18. Juni 2020',
    ]);
  });

  it('returns month to date range string in different locale', () => {
    const locale = 'fr-FR';
    expect(dateRangeToString(DateRange.MonthToDate, locale)).toEqual([
      '1 juin 2020 - 18 juin 2020',
    ]);
  });
});
