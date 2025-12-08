import { formatEffectiveDates } from './useEffectiveDateOptions';

const testDates = ['2025-01-10', '2025-02-07', '2025-03-21', '2025-12-25'];

const locale = 'en-US';

const expectedOptions = [
  {
    value: '2025-01-10',
    label: 'Jan 10, 2025',
  },
  {
    value: '2025-02-07',
    label: 'Feb 7, 2025',
  },
  {
    value: '2025-03-21',
    label: 'Mar 21, 2025',
  },
  {
    value: '2025-12-25',
    label: 'Dec 25, 2025',
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
