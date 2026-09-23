import { DateTime } from 'luxon';
import { monthsUntilOccurrenceOnOrAfter } from './monthsUntilOccurrenceOnOrAfter';

const months = (start: string, floor: string) =>
  monthsUntilOccurrenceOnOrAfter(
    DateTime.fromISO(start),
    DateTime.fromISO(floor),
  );

const landing = (start: string, floor: string) =>
  DateTime.fromISO(start)
    .plus({ months: months(start, floor) })
    .toISODate();

describe('monthsUntilOccurrenceOnOrAfter', () => {
  it('returns 0 when the start equals the floor', () => {
    expect(months('2023-09-15', '2023-09-15')).toBe(0);
    expect(landing('2023-09-15', '2023-09-15')).toBe('2023-09-15');
  });

  it('returns 0 when the start is after the floor', () => {
    expect(months('2023-09-15', '2023-01-01')).toBe(0);
    expect(landing('2023-09-15', '2023-01-01')).toBe('2023-09-15');
  });

  it('returns 1 when the floor is one day after the start', () => {
    expect(months('2023-09-15', '2023-09-16')).toBe(1);
    expect(landing('2023-09-15', '2023-09-16')).toBe('2023-10-15');
  });

  it('returns 1 when the floor is exactly one month after the start', () => {
    expect(months('2023-09-15', '2023-10-15')).toBe(1);
    expect(landing('2023-09-15', '2023-10-15')).toBe('2023-10-15');
  });

  it('counts up to the first occurrence on or after a floor between occurrences', () => {
    expect(months('2022-06-15', '2023-01-01')).toBe(7);
    expect(landing('2022-06-15', '2023-01-01')).toBe('2023-01-15');
  });

  it('counts an occurrence that lands exactly on the floor', () => {
    expect(months('2022-06-15', '2023-01-15')).toBe(7);
    expect(landing('2022-06-15', '2023-01-15')).toBe('2023-01-15');
  });

  it('needs one more month when the floor is a day past an occurrence', () => {
    expect(months('2022-06-15', '2023-01-16')).toBe(8);
    expect(landing('2022-06-15', '2023-01-16')).toBe('2023-02-15');
  });

  it('lands on the clamped day when an end-of-month start hits a short month exactly', () => {
    expect(months('2024-01-31', '2024-02-29')).toBe(1);
    expect(landing('2024-01-31', '2024-02-29')).toBe('2024-02-29');
  });

  it('does not skip a month when the floor is before the clamped day', () => {
    expect(months('2024-01-31', '2024-02-15')).toBe(1);
    expect(landing('2024-01-31', '2024-02-15')).toBe('2024-02-29');
  });

  it('adds a month when the clamped occurrence falls short of the floor', () => {
    // Jan 31, 2024 + 13 months clamps to Feb 28, 2025, which is before Mar 1.
    expect(months('2024-01-31', '2025-03-01')).toBe(14);
    expect(landing('2024-01-31', '2025-03-01')).toBe('2025-03-31');
  });

  it('lands a leap-day start on its clamped anniversary', () => {
    expect(months('2024-02-29', '2025-02-28')).toBe(12);
    expect(landing('2024-02-29', '2025-02-28')).toBe('2025-02-28');
  });

  it('adds a month when a leap-day anniversary falls short of the floor', () => {
    expect(months('2024-02-29', '2025-03-01')).toBe(13);
    expect(landing('2024-02-29', '2025-03-01')).toBe('2025-03-29');
  });

  it('lands exactly on the floor across a ten-year span', () => {
    expect(months('2015-06-15', '2025-06-15')).toBe(120);
    expect(landing('2015-06-15', '2025-06-15')).toBe('2025-06-15');
  });

  it('treats a later time on the same day as after the start, so callers should normalize first', () => {
    const start = DateTime.fromISO('2023-09-15T00:00:00');
    const laterThatDay = DateTime.fromISO('2023-09-15T10:00:00');

    const unnormalized = monthsUntilOccurrenceOnOrAfter(start, laterThatDay);
    expect(unnormalized).toBe(1);
    expect(start.plus({ months: unnormalized }).toISODate()).toBe('2023-10-15');

    const normalized = monthsUntilOccurrenceOnOrAfter(
      start,
      laterThatDay.startOf('day'),
    );
    expect(normalized).toBe(0);
    expect(start.plus({ months: normalized }).toISODate()).toBe('2023-09-15');
  });

  it('expects callers to re-anchor a start from another zone before comparing', () => {
    // A date parsed with setZone keeps the API's offset, so its year and month fields can
    // disagree with a local floor near a month boundary. Re-anchoring keeps the wall-clock
    // date and puts both operands in one zone.
    const start = DateTime.fromISO('2023-09-15T00:00:00+04:00', {
      setZone: true,
    });
    const floor = DateTime.fromISO('2023-09-15T00:00:00Z', { setZone: true });

    const reanchored = start.setZone(floor.zone, { keepLocalTime: true });
    const months = monthsUntilOccurrenceOnOrAfter(reanchored, floor);
    expect(months).toBe(0);
    expect(reanchored.plus({ months }).toISODate()).toBe('2023-09-15');
  });

  it('is unaffected by a daylight saving change between the start and the floor', () => {
    const zone = 'America/New_York';
    const start = DateTime.fromISO('2024-01-15', { zone });
    const floor = DateTime.fromISO('2024-04-15', { zone });

    const onFloor = monthsUntilOccurrenceOnOrAfter(start, floor);
    expect(onFloor).toBe(3);
    expect(start.plus({ months: onFloor }).toISODate()).toBe('2024-04-15');

    const pastFloor = monthsUntilOccurrenceOnOrAfter(
      start,
      floor.plus({ days: 1 }),
    );
    expect(pastFloor).toBe(4);
    expect(start.plus({ months: pastFloor }).toISODate()).toBe('2024-05-15');
  });
});
