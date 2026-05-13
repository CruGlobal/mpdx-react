import { getCapOverrides } from './getCapOverrides';

const t = ((key: string) => key) as unknown as Parameters<
  typeof getCapOverrides
>[1];

describe('getCapOverrides', () => {
  it('returns undefined title/content when no approval needed', () => {
    const result = getCapOverrides(
      {
        splitAsr: false,
        additionalApproval: false,
        hasBoardCapException: false,
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
        additionalApproval: false,
        hasBoardCapException: false,
      },
      t,
    );
    expect(result.title).toMatch(/exceeds your remaining allowable salary/);
  });

  it('returns Progressive Approvals messaging when additionalApproval without board exception', () => {
    const result = getCapOverrides(
      {
        splitAsr: false,
        additionalApproval: true,
        hasBoardCapException: false,
      },
      t,
    );
    expect(result.title).toMatch(/requires additional approval/);
    expect(result.content).toMatch(/exceed your Maximum Allowable Salary/);
  });

  it('returns board-approval messaging when approval required with board exception', () => {
    const result = getCapOverrides(
      {
        splitAsr: false,
        additionalApproval: true,
        hasBoardCapException: true,
      },
      t,
    );
    expect(result.title).toMatch(/Board approval/);
    expect(result.content).toMatch(
      /You have a Board approved Maximum Allowable Salary/,
    );
    expect(result.content).toMatch(/Additional Salary Request exceeds/);
  });

  it('board exception does not apply when no approval required', () => {
    const result = getCapOverrides(
      {
        splitAsr: false,
        additionalApproval: false,
        hasBoardCapException: true,
      },
      t,
    );
    expect(result.title).toBeUndefined();
    expect(result.content).toBeUndefined();
  });
});
