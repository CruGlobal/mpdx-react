import {
  MPD_LEADER_SCOPE,
  isRestrictedImpersonation,
} from './restrictedImpersonation';

describe('isRestrictedImpersonation', () => {
  it('returns true when the session has an impersonation scope', () => {
    expect(
      isRestrictedImpersonation({ impersonationScope: MPD_LEADER_SCOPE }),
    ).toBe(true);
  });

  it('returns false when the session has no impersonation scope', () => {
    expect(isRestrictedImpersonation({})).toBe(false);
    expect(isRestrictedImpersonation({ impersonationScope: undefined })).toBe(
      false,
    );
  });
});
