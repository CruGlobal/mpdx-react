import { DateTime } from 'luxon';
import { getDateRange } from './dateRanges';
import { RANGES } from './intents';

const now = DateTime.fromISO('2026-03-15T10:00:00');

const isoRange = (range: (typeof RANGES)[number]) => {
  const { min, max } = getDateRange(range, now);
  return [min.toISODate(), max.toISODate()];
};

describe('getDateRange', () => {
  it.each([
    ['last_30_days', '2026-02-13', '2026-03-15'],
    ['this_month', '2026-03-01', '2026-03-31'],
    ['last_month', '2026-02-01', '2026-02-28'],
    ['last_two_months', '2026-01-01', '2026-02-28'],
    ['last_three_months', '2025-12-01', '2026-02-28'],
    ['this_year', '2026-01-01', '2026-12-31'],
    ['last_year', '2025-01-01', '2025-12-31'],
  ] as const)('maps %s', (range, min, max) => {
    expect(isoRange(range)).toEqual([min, max]);
  });
});
