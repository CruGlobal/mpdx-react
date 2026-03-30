import { formatEffectiveDates } from './useEffectiveDateOptions';

const testDates = [
  { startDate: '2025-01-01', regularProcessDate: '2025-01-25' },
  { startDate: '2025-01-16', regularProcessDate: '2025-02-10' },
  { startDate: '2025-02-01', regularProcessDate: '2025-02-25' },
];

const locale = 'en-US';

const expectedOptions = [
  {
    value: '2025-01-01',
    label: 'Jan 25, 2025',
  },
  {
    value: '2025-01-16',
    label: 'Feb 10, 2025',
  },
  {
    value: '2025-02-01',
    label: 'Feb 25, 2025',
  },
];

describe('formatEffectiveDates', () => {
  it('returns empty array when effectiveDates is undefined', () => {
    expect(formatEffectiveDates(undefined, locale)).toEqual([]);
  });

  it('returns empty array when effectiveDates is empty', () => {
    expect(formatEffectiveDates([], locale)).toEqual([]);
  });

  it('formats dates correctly', () => {
    expect(formatEffectiveDates(testDates, locale)).toEqual(expectedOptions);
  });
});
