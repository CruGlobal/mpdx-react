import { formatEffectiveDates } from './useEffectiveDateOptions';

const testDates = [
  '2025-01-10T00:00:00.000Z',
  '2025-02-07T00:00:00.000Z',
  '2025-03-21T00:00:00.000Z',
  '2025-12-25T00:00:00.000Z',
];

const expectedOptions = [
  {
    value: '2025-01-10T00:00:00.000Z',
    label: 'Jan 10, 2025',
  },
  {
    value: '2025-02-07T00:00:00.000Z',
    label: 'Feb 7, 2025',
  },
  {
    value: '2025-03-21T00:00:00.000Z',
    label: 'Mar 21, 2025',
  },
  {
    value: '2025-12-25T00:00:00.000Z',
    label: 'Dec 25, 2025',
  },
];

describe('formatEffectiveDates', () => {
  it('returns empty array when effectiveDates is undefined', () => {
    expect(formatEffectiveDates(undefined)).toEqual([]);
  });

  it('returns empty array when effectiveDates is empty', () => {
    expect(formatEffectiveDates([])).toEqual([]);
  });

  it('formats dates correctly', () => {
    expect(formatEffectiveDates(testDates)).toEqual(expectedOptions);
  });
});
