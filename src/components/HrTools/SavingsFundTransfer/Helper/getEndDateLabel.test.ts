import { DateTime } from 'luxon';
import { ScheduleEnum, StatusEnum, Transfers } from '../mockData';
import { getEndDateLabel } from './getEndDateLabel';

const locale = 'en-US';

const recurring: Transfers = {
  id: '1',
  schedule: ScheduleEnum.Monthly,
  status: StatusEnum.Ongoing,
  transferDate: DateTime.local(2019, 10, 15),
  endDate: null,
};

describe('getEndDateLabel', () => {
  it('formats an end date when the schedule has one', () => {
    expect(
      getEndDateLabel(
        { ...recurring, endDate: DateTime.local(2020, 12, 15) },
        locale,
        'Indefinite',
      ),
    ).toBe('Dec 15, 2020');
  });

  it('marks a running schedule with no end date as indefinite', () => {
    expect(getEndDateLabel(recurring, locale, 'Indefinite')).toBe('Indefinite');
  });

  it('returns nothing for a one-time transfer', () => {
    expect(
      getEndDateLabel(
        { ...recurring, schedule: ScheduleEnum.OneTime },
        locale,
        'Indefinite',
      ),
    ).toBe('');
  });

  it.each([
    ['an ended schedule', { status: StatusEnum.Ended }],
    ['a stopped schedule', { status: StatusEnum.Stopped }],
    ['a cancelled schedule', { active: false }],
  ])('returns nothing for %s with no end date', (_label, overrides) => {
    expect(
      getEndDateLabel({ ...recurring, ...overrides }, locale, 'Indefinite'),
    ).toBe('');
  });

  it('ignores an invalid end date rather than formatting it', () => {
    expect(
      getEndDateLabel(
        { ...recurring, endDate: DateTime.fromISO('not-a-date') },
        locale,
        'Indefinite',
      ),
    ).toBe('Indefinite');
  });
});
