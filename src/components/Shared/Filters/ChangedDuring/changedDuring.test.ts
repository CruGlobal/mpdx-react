import { DateTime, Settings } from 'luxon';
import i18n from 'src/lib/i18n';
import {
  ContactFilterChangedDuringEnum,
  formatAddressChangedFilter,
  fromDateRangeInput,
  getChangedDuringOption,
  getChangedDuringRange,
  toDateRangeInput,
} from './changedDuring';

describe('getChangedDuringRange', () => {
  const nowMillis = Settings.now;
  beforeEach(() => {
    Settings.now = () => new Date(2026, 9, 14, 15).valueOf();
  });
  afterEach(() => {
    Settings.now = nowMillis;
  });

  it.each([
    [ContactFilterChangedDuringEnum.Last3Months, '2026-07-14'],
    [ContactFilterChangedDuringEnum.Last6Months, '2026-04-14'],
    [ContactFilterChangedDuringEnum.Last12Months, '2025-10-14'],
  ])('turns %s into a range ending today', (changedDuring, startDate) => {
    const range = getChangedDuringRange(changedDuring, null);

    expect(range?.startDate?.toISODate()).toBe(startDate);
    expect(range?.endDate?.toISODate()).toBe('2026-10-14');
  });

  it('uses the custom range for Custom', () => {
    const customRange = {
      startDate: DateTime.local(2026, 1, 1),
      endDate: null,
    };

    expect(
      getChangedDuringRange(ContactFilterChangedDuringEnum.Custom, customRange),
    ).toBe(customRange);
  });

  it('returns no range when nothing is chosen', () => {
    expect(getChangedDuringRange(null, null)).toBeNull();
  });
});

describe('toDateRangeInput and fromDateRangeInput', () => {
  it('converts a range to the filter input and back', () => {
    const range = {
      startDate: DateTime.local(2026, 1, 1),
      endDate: DateTime.local(2026, 2, 1),
    };

    expect(toDateRangeInput(range)).toEqual({
      min: '2026-01-01',
      max: '2026-02-01',
    });
    expect(
      fromDateRangeInput({ min: '2026-01-01', max: '2026-02-01' }),
    ).toEqual(range);
  });

  it('keeps an open end empty', () => {
    expect(
      toDateRangeInput({
        startDate: DateTime.local(2026, 1, 1),
        endDate: null,
      }),
    ).toEqual({ min: '2026-01-01', max: undefined });
    expect(fromDateRangeInput({ max: '2026-02-01' })).toEqual({
      startDate: null,
      endDate: DateTime.local(2026, 2, 1),
    });
  });
});

describe('getChangedDuringOption', () => {
  const nowMillis = Settings.now;
  beforeEach(() => {
    Settings.now = () => new Date(2026, 9, 14, 15).valueOf();
  });
  afterEach(() => {
    Settings.now = nowMillis;
  });

  it('returns nothing when there is no range', () => {
    expect(getChangedDuringOption(undefined)).toBeNull();
  });

  it('recognizes a preset range', () => {
    expect(
      getChangedDuringOption({ min: '2026-07-14', max: '2026-10-14' }),
    ).toBe(ContactFilterChangedDuringEnum.Last3Months);
  });

  it.each([
    [{ min: '2026-01-01', max: '2026-02-01' }],
    [{ min: '2026-07-14' }],
  ])('treats any other range as custom', (range) => {
    expect(getChangedDuringOption(range)).toBe(
      ContactFilterChangedDuringEnum.Custom,
    );
  });
});

describe('formatAddressChangedFilter', () => {
  const nowMillis = Settings.now;
  beforeEach(() => {
    Settings.now = () => new Date(2026, 9, 14, 15).valueOf();
  });
  afterEach(() => {
    Settings.now = nowMillis;
  });

  it.each([
    [
      { min: '2025-10-14', max: '2026-10-14' },
      'Address changed in the last 12 months',
    ],
    [
      { min: '2026-01-01', max: '2026-02-01' },
      'Address changed between Jan 1, 2026 and Feb 1, 2026',
    ],
    [{ min: '2026-01-01' }, 'Address changed since Jan 1, 2026'],
    [{ max: '2026-02-01' }, 'Address changed through Feb 1, 2026'],
  ])('describes %o as "%s"', (range, description) => {
    expect(formatAddressChangedFilter(range, i18n.t, 'en-US')).toBe(
      description,
    );
  });
});
