import { formatStartDate } from './helpers';

describe('formatStartDate', () => {
  it('formats the date with the month abbreviation and 2-digit year', () => {
    expect(formatStartDate('2020-01-01', 'en-US')).toBe('Jan 20');
  });

  it('returns an empty string when the date is undefined', () => {
    expect(formatStartDate(undefined, 'en-US')).toBe('');
  });
});
