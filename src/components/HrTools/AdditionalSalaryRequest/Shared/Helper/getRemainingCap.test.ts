import { getRemainingCap } from './getRemainingCap';

describe('getRemainingCap', () => {
  it('subtracts gross salary and this year of ASRs from the cap', () => {
    expect(
      getRemainingCap({
        currentSalaryCap: 60000,
        grossAnnualSalary: 45000,
        ytdAsrAmount: 5000,
      }),
    ).toBe(10000);
  });

  it('returns 0 rather than a negative when already over the cap', () => {
    expect(
      getRemainingCap({
        currentSalaryCap: 40000,
        grossAnnualSalary: 45000,
        ytdAsrAmount: 5000,
      }),
    ).toBe(0);
  });

  it('treats missing and null fields as 0', () => {
    expect(getRemainingCap({})).toBe(0);
    expect(
      getRemainingCap({
        currentSalaryCap: 50000,
        grossAnnualSalary: null,
        ytdAsrAmount: null,
      }),
    ).toBe(50000);
  });
});
