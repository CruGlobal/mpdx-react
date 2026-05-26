import { DateTime, Settings } from 'luxon';
import { getStaffExpenseMonthRange } from './getMonthRange';

const baseTime = DateTime.fromISO('2020-01-15');

describe('getStaffExpenseMonthRange', () => {
  beforeEach(() => {
    Settings.now = () => Date.parse('2026-05-26');
  });

  afterEach(() => {
    Settings.now = () => Date.now();
  });

  it('falls back to baseTime month when filters is null', () => {
    expect(getStaffExpenseMonthRange(null, baseTime)).toEqual({
      startMonth: '2020-01-01',
      endMonth: '2020-01-31',
    });
  });

  it('falls back to baseTime month when filters is undefined', () => {
    expect(getStaffExpenseMonthRange(undefined, baseTime)).toEqual({
      startMonth: '2020-01-01',
      endMonth: '2020-01-31',
    });
  });

  it('falls back to baseTime month when both dates are null', () => {
    expect(
      getStaffExpenseMonthRange({ startDate: null, endDate: null }, baseTime),
    ).toEqual({
      startMonth: '2020-01-01',
      endMonth: '2020-01-31',
    });
  });

  it('uses startDate and endDate months when both are present', () => {
    const filters = {
      startDate: DateTime.fromISO('2025-03-10'),
      endDate: DateTime.fromISO('2025-05-20'),
    };
    expect(getStaffExpenseMonthRange(filters, baseTime)).toEqual({
      startMonth: '2025-03-01',
      endMonth: '2025-05-31',
    });
  });

  it('defaults endMonth to end of current month when only startDate is present', () => {
    const filters = {
      startDate: DateTime.fromISO('2025-03-10'),
      endDate: null,
    };
    expect(getStaffExpenseMonthRange(filters, baseTime)).toEqual({
      startMonth: '2025-03-01',
      endMonth: '2026-05-31',
    });
  });

  it('uses endDate month for both startMonth and endMonth when only endDate is present', () => {
    const filters = {
      startDate: null,
      endDate: DateTime.fromISO('2025-05-20'),
    };
    expect(getStaffExpenseMonthRange(filters, baseTime)).toEqual({
      startMonth: '2025-05-01',
      endMonth: '2025-05-31',
    });
  });
});
