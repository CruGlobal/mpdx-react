import { DateTime } from 'luxon';

/**
 * The calendar day a transaction happened on, as YYYY-MM-DD.
 *
 * The API returns transactedAt as a UTC timestamp. Reading it in
 * the local zone shifts it into the neighboring day for timezones
 * behind UTC, which displayed transactions on the wrong day and
 * dropped ones on the 1st out of the month's filter entirely.
 *
 */
export const transformTransactionDate = (transactedAt: string): string =>
  DateTime.fromISO(transactedAt, { zone: 'utc' }).toISODate() ?? transactedAt;
