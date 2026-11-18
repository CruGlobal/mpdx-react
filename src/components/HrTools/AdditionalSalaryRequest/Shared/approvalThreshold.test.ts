import { approvalThreshold } from './approvalThreshold';

const own = {
  currentSalaryCap: 60000,
  combinedCap: 120000,
  grossAnnualSalary: 40000,
  ytdAsrAmount: 5000,
};

describe('approvalThreshold', () => {
  it('is the room under the cap for a single person', () => {
    expect(approvalThreshold(own, null)).toEqual({
      amount: 15000,
      reason: 'ownCap',
    });
  });

  it('never goes below zero for a person over their cap', () => {
    expect(
      approvalThreshold({ ...own, grossAnnualSalary: 70000 }, null),
    ).toEqual({ amount: 0, reason: 'ownCap' });
  });

  it('is the room under their own cap when the combined cap has more room', () => {
    const spouse = {
      currentSalaryCap: 60000,
      grossAnnualSalary: 30000,
      ytdAsrAmount: 0,
    };

    expect(approvalThreshold(own, spouse)).toEqual({
      amount: 15000,
      reason: 'ownCap',
    });
  });

  it('is the room under the combined cap when that is smaller', () => {
    const spouse = {
      currentSalaryCap: 60000,
      grossAnnualSalary: 55000,
      ytdAsrAmount: 0,
    };

    expect(approvalThreshold({ ...own, combinedCap: 110000 }, spouse)).toEqual({
      amount: 10000,
      reason: 'combinedCap',
    });
  });

  it('is zero for any amount when the spouse is already over their cap', () => {
    const spouse = {
      currentSalaryCap: 60000,
      grossAnnualSalary: 58000,
      ytdAsrAmount: 5000,
    };

    expect(approvalThreshold(own, spouse)).toEqual({
      amount: 0,
      reason: 'spouseOverCap',
    });
  });

  it('is null without a cap', () => {
    expect(
      approvalThreshold({ ...own, currentSalaryCap: null }, null),
    ).toBeNull();
    expect(approvalThreshold(undefined, null)).toBeNull();
  });
});
