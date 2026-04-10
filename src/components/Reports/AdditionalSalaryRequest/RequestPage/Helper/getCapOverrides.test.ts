import { getCapOverrides } from './getCapOverrides';

const t = ((key: string) => key) as unknown as Parameters<
  typeof getCapOverrides
>[4];

describe('getCapOverrides', () => {
  it('returns undefined title/content when not exceeding cap', () => {
    const result = getCapOverrides(false, false, false, false, t);
    expect(result.title).toBeUndefined();
    expect(result.content).toBeUndefined();
  });

  it('returns split-asr messaging when splitAsr is true', () => {
    const result = getCapOverrides(true, false, false, false, t);
    expect(result.title).toMatch(/exceeds your remaining allowable salary/);
  });

  it('returns Progressive Approvals messaging when exceeds cap without board exception', () => {
    const result = getCapOverrides(false, false, true, false, t);
    expect(result.title).toMatch(/requires additional approval/);
    expect(result.content).toMatch(/exceed your Maximum Allowable Salary/);
  });

  it('returns board-approval messaging when exceeds cap with board exception', () => {
    const result = getCapOverrides(false, false, true, true, t);
    expect(result.title).toMatch(/Board approval/);
    expect(result.content).toMatch(
      /You have a Board approved Maximum Allowable Salary/,
    );
    expect(result.content).toMatch(/Additional Salary Request exceeds/);
  });

  it('board exception takes precedence over additionalApproval branch', () => {
    const result = getCapOverrides(false, true, false, true, t);
    expect(result.content).toMatch(
      /You have a Board approved Maximum Allowable Salary/,
    );
  });

  it('board exception does not apply when user is not exceeding cap', () => {
    const result = getCapOverrides(false, false, false, true, t);
    expect(result.title).toBeUndefined();
    expect(result.content).toBeUndefined();
  });
});
