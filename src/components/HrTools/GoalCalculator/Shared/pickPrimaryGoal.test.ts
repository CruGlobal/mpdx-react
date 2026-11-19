import { pickPrimaryGoal } from './pickPrimaryGoal';

const goal = (id: string, overrides = {}) => ({
  id,
  primary: false,
  readOnly: false,
  ...overrides,
});

describe('pickPrimaryGoal', () => {
  it('picks the primary goal even when another goal is newer', () => {
    expect(
      pickPrimaryGoal([goal('newest'), goal('primary', { primary: true })])?.id,
    ).toBe('primary');
  });

  it('picks the first goal when none is primary', () => {
    expect(pickPrimaryGoal([goal('newest'), goal('older')])?.id).toBe('newest');
  });

  it('skips read-only goals', () => {
    expect(
      pickPrimaryGoal([
        goal('converted', { primary: true, readOnly: true }),
        goal('editable'),
      ])?.id,
    ).toBe('editable');
  });

  it('returns undefined without editable goals', () => {
    expect(pickPrimaryGoal([goal('converted', { readOnly: true })])).toBe(
      undefined,
    );
    expect(pickPrimaryGoal(undefined)).toBe(undefined);
  });
});
