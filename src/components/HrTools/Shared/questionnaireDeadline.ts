import { DateTime } from 'luxon';
import { dateTimeFormat } from 'src/lib/intlFormat';

/** The MPD Goals team sets and reads NSO questionnaire deadlines in Eastern time. */
const DEADLINE_ZONE = 'America/New_York';

/** A deadline in Eastern time, e.g. "Jan 20, 2027, 5:00 PM EST", whatever the viewer's zone. */
export const deadlineFormat = (deadline: string, locale: string): string =>
  dateTimeFormat(DateTime.fromISO(deadline), locale, DEADLINE_ZONE);

/** The date/time pickers work in Luxon's default zone, so they show the Eastern wall-clock time. */
export const deadlineToPickerValue = (
  deadline: string | null,
): DateTime | null =>
  deadline
    ? DateTime.fromISO(deadline, { zone: DEADLINE_ZONE }).setZone('default', {
        keepLocalTime: true,
      })
    : null;

/** Reads the picked wall-clock time as Eastern time and returns the UTC instant to save. */
export const pickerValueToDeadline = (value: DateTime): string | null =>
  value.setZone(DEADLINE_ZONE, { keepLocalTime: true }).toUTC().toISO();
