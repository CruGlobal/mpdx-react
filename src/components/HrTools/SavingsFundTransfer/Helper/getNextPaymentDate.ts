import { DateTime } from 'luxon';
import { ScheduleEnum, StatusEnum, Transfers } from '../mockData';
import { monthsUntilOccurrenceOnOrAfter } from './monthsUntilOccurrenceOnOrAfter';

// SAA does not report the next run, so derive it: monthly on the start day.
export function getNextPaymentDate(transfer: Transfers): DateTime | null {
  const { schedule, status, active, transferDate, endDate } = transfer;

  // An invalid DateTime is truthy, so `!transferDate` would not catch it.
  if (schedule !== ScheduleEnum.Monthly || !transferDate?.isValid) {
    return null;
  }

  // Upcoming rows hardcode a `Pending` status, so `active` is the only signal there.
  if (active === false) {
    return null;
  }

  if (status === StatusEnum.Ended || status === StatusEnum.Stopped) {
    return null;
  }

  // Row dates carry the API's zone, so re-anchor before comparing to local midnight.
  const today = DateTime.local().startOf('day');
  const toViewerDate = (date: DateTime) =>
    date.setZone(today.zone, { keepLocalTime: true }).startOf('day');

  const start = toViewerDate(transferDate);

  if (start >= today) {
    return null;
  }

  const next = start.plus({
    months: monthsUntilOccurrenceOnOrAfter(start, today),
  });

  if (endDate?.isValid && next > toViewerDate(endDate)) {
    return null;
  }

  return next;
}
