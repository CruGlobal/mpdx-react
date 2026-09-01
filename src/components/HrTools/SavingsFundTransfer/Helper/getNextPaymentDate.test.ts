import { DateTime, Settings } from 'luxon';
import { ScheduleEnum, StatusEnum, Transfers } from '../mockData';
import { getNextPaymentDate } from './getNextPaymentDate';

// Like TransfersPage, keep the API's zone; the setup pins the clock to 2020-01-01.
const apiDate = (iso: string) => DateTime.fromISO(iso, { setZone: true });

const recurring: Transfers = {
  id: '1',
  schedule: ScheduleEnum.Monthly,
  status: StatusEnum.Ongoing,
  transferDate: apiDate('2019-10-15T00:00:00+00:00'),
  endDate: null,
};

describe('getNextPaymentDate', () => {
  it('returns null for one-time transfers', () => {
    expect(
      getNextPaymentDate({
        ...recurring,
        schedule: ScheduleEnum.OneTime,
        status: StatusEnum.Complete,
      }),
    ).toBeNull();
  });

  it('returns null when the transfer has no start date', () => {
    expect(getNextPaymentDate({ ...recurring, transferDate: undefined })).toBe(
      null,
    );
  });

  it('returns the next monthly occurrence after today', () => {
    expect(getNextPaymentDate(recurring)?.toISODate()).toBe('2020-01-15');
  });

  it('returns today when a payment falls on today', () => {
    expect(
      getNextPaymentDate({
        ...recurring,
        transferDate: apiDate('2019-10-01T00:00:00+00:00'),
      })?.toISODate(),
    ).toBe('2020-01-01');
  });

  it('ignores the time of day on the start date', () => {
    expect(
      getNextPaymentDate({
        ...recurring,
        transferDate: apiDate('2019-10-01T23:59:00+00:00'),
      })?.toISODate(),
    ).toBe('2020-01-01');
  });

  it('clamps to the last day of shorter months', () => {
    Settings.now = () => new Date(2020, 1, 1).valueOf();

    expect(
      getNextPaymentDate({
        ...recurring,
        transferDate: apiDate('2019-08-31T00:00:00+00:00'),
      })?.toISODate(),
    ).toBe('2020-02-29');
  });

  it('returns null when the next occurrence is past the end date', () => {
    expect(
      getNextPaymentDate({
        ...recurring,
        endDate: DateTime.local(2020, 1, 10),
      }),
    ).toBeNull();
  });

  it('returns the next occurrence when it falls on the end date', () => {
    expect(
      getNextPaymentDate({
        ...recurring,
        endDate: DateTime.local(2020, 1, 15),
      })?.toISODate(),
    ).toBe('2020-01-15');
  });

  it('returns null for ended transfers', () => {
    expect(
      getNextPaymentDate({ ...recurring, status: StatusEnum.Ended }),
    ).toBeNull();
  });

  it('returns null for stopped transfers', () => {
    expect(
      getNextPaymentDate({ ...recurring, status: StatusEnum.Stopped }),
    ).toBeNull();
  });

  it('returns null when the transfer has not started yet', () => {
    expect(
      getNextPaymentDate({
        ...recurring,
        status: StatusEnum.Pending,
        transferDate: apiDate('2020-03-15T00:00:00+00:00'),
      }),
    ).toBeNull();
  });

  it('returns null when the start date is invalid', () => {
    expect(
      getNextPaymentDate({
        ...recurring,
        transferDate: DateTime.invalid('malformed SAA date'),
      }),
    ).toBeNull();
  });

  it('returns null for a stopped schedule even when the status says pending', () => {
    expect(
      getNextPaymentDate({
        ...recurring,
        status: StatusEnum.Pending,
        active: false,
      }),
    ).toBeNull();
  });

  describe('when the viewer is west of the API timezone', () => {
    // The suite runs under TZ=UTC, but every real viewer of this report is west of it.
    beforeEach(() => {
      Settings.defaultZone = 'America/New_York';
    });

    afterEach(() => {
      Settings.defaultZone = 'UTC';
    });

    it('reports a payment landing today rather than next month', () => {
      const now = DateTime.fromObject(
        { year: 2020, month: 1, day: 15, hour: 20 },
        { zone: 'America/New_York' },
      ).toMillis();
      Settings.now = () => now;

      expect(getNextPaymentDate(recurring)?.toISODate()).toBe('2020-01-15');
    });

    it('does not suppress the final payment before its end date', () => {
      const now = DateTime.fromObject(
        { year: 2020, month: 1, day: 2, hour: 9 },
        { zone: 'America/New_York' },
      ).toMillis();
      Settings.now = () => now;

      expect(
        getNextPaymentDate({
          ...recurring,
          endDate: apiDate('2020-01-15T00:00:00+00:00'),
        })?.toISODate(),
      ).toBe('2020-01-15');
    });
  });
});
