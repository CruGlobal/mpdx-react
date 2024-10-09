import { calculateMonthlyCommitmentGoal, formatStartDate } from './helpers';

describe('formatStartDate', () => {
  it('formats the date with the month abbreviation and 2-digit year', () => {
    expect(formatStartDate('2020-01-01', 'en-US')).toBe('Jan 20');
  });

  it('returns an empty string when the date is undefined', () => {
    expect(formatStartDate(undefined, 'en-US')).toBe('');
  });
});

describe('calculateMonthlyCommitmentGoal', () => {
  it('returns null when all info is missing', () => {
    expect(calculateMonthlyCommitmentGoal({})).toBeNull();
  });

  it('returns null when goal is missing', () => {
    expect(
      calculateMonthlyCommitmentGoal({
        activeMpdStartAt: '2020-01-01',
        activeMpdFinishAt: '2020-12-31',
      }),
    ).toBeNull();
  });

  it('returns goal when only goal is present', () => {
    expect(
      calculateMonthlyCommitmentGoal({
        activeMpdMonthlyGoal: 1000,
      }),
    ).toBe(1000);
  });

  it('returns goal when start and end dates are equal', () => {
    expect(
      calculateMonthlyCommitmentGoal({
        activeMpdStartAt: '2020-01-01',
        activeMpdFinishAt: '2020-01-01',
        activeMpdMonthlyGoal: 1000,
      }),
    ).toBe(1000);
  });

  it('returns goal divided by number of months between start and end dates', () => {
    expect(
      calculateMonthlyCommitmentGoal({
        activeMpdStartAt: '2020-05-10',
        activeMpdFinishAt: '2020-08-20',
        activeMpdMonthlyGoal: 1200,
      }),
    ).toBe(400);
  });
});
