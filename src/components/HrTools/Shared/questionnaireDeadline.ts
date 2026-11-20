import { DateTime } from 'luxon';

/** The MPD Goals team sets and reads NSO questionnaire deadlines in Eastern time. */
const DEADLINE_ZONE = 'America/New_York';

/** A deadline in Eastern time, e.g. "Jan 20, 2027, 5:00 PM EST", whatever the viewer's zone. */
export const deadlineFormat = (deadline: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: DEADLINE_ZONE,
  }).format(DateTime.fromISO(deadline).toJSDate());

/** The date/time pickers work in the browser zone, so they show the Eastern wall-clock time. */
export const deadlineToPickerValue = (
  deadline: string | null,
): DateTime | null =>
  deadline
    ? DateTime.fromISO(deadline, { zone: DEADLINE_ZONE }).setZone('local', {
        keepLocalTime: true,
      })
    : null;

/** Reads the picked wall-clock time as Eastern time and returns the UTC instant to save. */
export const pickerValueToDeadline = (value: DateTime): string | null =>
  value.setZone(DEADLINE_ZONE, { keepLocalTime: true }).toUTC().toISO();
