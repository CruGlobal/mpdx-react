import { DateTime } from 'luxon';

// Number of months to add to `start` so the monthly occurrence lands on or after `floor`.
//
// Add the result to `start` in one step rather than walking month by month: Luxon clamps an
// end-of-month day in shorter months (Jan 31 + 1 month = Feb 28), and stepping on from the
// clamped date would put every later occurrence on the 28th.
export function monthsUntilOccurrenceOnOrAfter(
  start: DateTime,
  floor: DateTime,
): number {
  if (start >= floor) {
    return 0;
  }

  const wholeMonths = Math.floor(floor.diff(start, 'months').months);
  return start.plus({ months: wholeMonths }) >= floor
    ? wholeMonths
    : wholeMonths + 1;
}
