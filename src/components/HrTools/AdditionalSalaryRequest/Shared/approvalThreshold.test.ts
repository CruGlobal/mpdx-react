import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';
import { approvalThreshold } from './approvalThreshold';

const own = {
  currentSalaryCap: 60000,
  combinedCap: 120000,
  remainingAllowableSalary: 15000,
  grossAnnualSalary: 40000,
  ytdAsrAmount: 5000,
};
const spouse = {
  currentSalaryCap: 60000,
  grossAnnualSalary: 30000,
  ytdAsrAmount: 0,
};

describe('approvalThreshold', () => {
  it('is the remaining allowable salary for a single person', () => {
    expect(approvalThreshold(own, null)).toEqual({
      amount: 15000,
      reason: ProgressiveApprovalTierReasonEnum.OverUserCap,
    });
  });

  it('counts an earlier request the remaining allowable salary includes', () => {
    expect(
      approvalThreshold({ ...own, remainingAllowableSalary: 10000 }, null),
    ).toEqual({
      amount: 10000,
      reason: ProgressiveApprovalTierReasonEnum.OverUserCap,
    });
  });

  it('is zero for a person at or over their cap', () => {
    expect(
      approvalThreshold(
        { ...own, grossAnnualSalary: 70000, remainingAllowableSalary: 0 },
        null,
      ),
    ).toEqual({
      amount: 0,
      reason: ProgressiveApprovalTierReasonEnum.OverUserCap,
    });
  });

  it('rounds down to the cent so the amount shown never needs approval', () => {
    expect(
      approvalThreshold({ ...own, remainingAllowableSalary: 100.005 }, null)
        ?.amount,
    ).toBe(100);
  });

  it('is the remaining allowable salary when the combined cap has more room', () => {
    expect(approvalThreshold(own, spouse)).toEqual({
      amount: 15000,
      reason: ProgressiveApprovalTierReasonEnum.OverUserCap,
    });
  });

  it('keeps the remaining allowable salary when the combined room is equal', () => {
    expect(
      approvalThreshold({ ...own, combinedCap: 90000 }, spouse)?.reason,
    ).toBe(ProgressiveApprovalTierReasonEnum.OverUserCap);
  });

  it('is the room under the combined cap when that is smaller', () => {
    expect(
      approvalThreshold(
        { ...own, combinedCap: 110000 },
        { ...spouse, grossAnnualSalary: 55000 },
      ),
    ).toEqual({
      amount: 10000,
      reason: ProgressiveApprovalTierReasonEnum.OverCombinedCap,
    });
  });

  it('counts an earlier request toward the combined cap', () => {
    expect(
      approvalThreshold(
        { ...own, combinedCap: 110000, remainingAllowableSalary: 12000 },
        { ...spouse, grossAnnualSalary: 55000 },
      ),
    ).toEqual({
      amount: 7000,
      reason: ProgressiveApprovalTierReasonEnum.OverCombinedCap,
    });
  });

  it('skips the combined check without a combined cap', () => {
    expect(
      approvalThreshold(
        { ...own, combinedCap: null },
        { ...spouse, grossAnnualSalary: 55000 },
      )?.reason,
    ).toBe(ProgressiveApprovalTierReasonEnum.OverUserCap);
  });

  it('is zero for any amount when the spouse is already over their cap', () => {
    expect(
      approvalThreshold(own, {
        ...spouse,
        grossAnnualSalary: 58000,
        ytdAsrAmount: 5000,
      }),
    ).toEqual({
      amount: 0,
      reason: ProgressiveApprovalTierReasonEnum.OverSpouseCap,
    });
  });

  it('does not treat a spouse exactly at their cap as over it', () => {
    expect(
      approvalThreshold(own, { ...spouse, grossAnnualSalary: 60000 })?.reason,
    ).not.toBe(ProgressiveApprovalTierReasonEnum.OverSpouseCap);
  });

  it('skips the spouse check when the spouse has no cap', () => {
    expect(
      approvalThreshold(own, {
        ...spouse,
        currentSalaryCap: null,
        grossAnnualSalary: 90000,
      })?.reason,
    ).not.toBe(ProgressiveApprovalTierReasonEnum.OverSpouseCap);
  });

  it('is null without a cap', () => {
    expect(
      approvalThreshold(
        { ...own, currentSalaryCap: null, remainingAllowableSalary: null },
        null,
      ),
    ).toBeNull();
    expect(approvalThreshold(undefined, null)).toBeNull();
  });
});
