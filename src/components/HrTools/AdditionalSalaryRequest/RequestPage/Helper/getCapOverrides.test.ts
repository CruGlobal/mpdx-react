import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';
import { getCapOverrides } from './getCapOverrides';

const t = ((key: string) => key) as unknown as Parameters<
  typeof getCapOverrides
>[1];

describe('getCapOverrides', () => {
  it('returns undefined title/content when no approval needed', () => {
    const result = getCapOverrides(
      {
        splitAsr: false,
        reason: null,
      },
      t,
    );
    expect(result.title).toBeUndefined();
    expect(result.content).toBeUndefined();
  });

  it('returns split-asr messaging when splitAsr is true', () => {
    const result = getCapOverrides(
      {
        splitAsr: true,
        reason: null,
      },
      t,
    );
    expect(result.title).toMatch(/exceeds your remaining allowable salary/);
  });

  it('returns Progressive Approvals messaging when over user cap', () => {
    const result = getCapOverrides(
      {
        splitAsr: false,
        reason: ProgressiveApprovalTierReasonEnum.OverUserCap,
      },
      t,
    );
    expect(result.title).toMatch(/requires additional approval/);
    expect(result.content).toMatch(/exceed your Maximum Allowable Salary/);
  });

  it('returns combined-cap messaging when over combined cap', () => {
    const result = getCapOverrides(
      {
        splitAsr: false,
        reason: ProgressiveApprovalTierReasonEnum.OverCombinedCap,
      },
      t,
    );
    expect(result.title).toMatch(/requires additional approval/);
    expect(result.content).toMatch(
      /combined Total Requested Salary to exceed your combined Maximum Allowable Salary/,
    );
  });

  it('returns board-approval messaging with board cap exception', () => {
    const result = getCapOverrides(
      {
        splitAsr: false,
        reason: ProgressiveApprovalTierReasonEnum.BoardCapException,
      },
      t,
    );
    expect(result.title).toMatch(/Board approval/);
    expect(result.content).toMatch(
      /You have a Board approved Maximum Allowable Salary/,
    );
    expect(result.content).toMatch(/Additional Salary Request exceeds/);
  });
});
