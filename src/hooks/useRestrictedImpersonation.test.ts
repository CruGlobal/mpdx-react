import { renderHook } from '@testing-library/react';
import { mockSession } from '__tests__/util/mockSession';
import { useRestrictedImpersonation } from './useRestrictedImpersonation';

describe('useRestrictedImpersonation', () => {
  it('returns false when the session has no impersonation scope', () => {
    const { result } = renderHook(useRestrictedImpersonation);

    expect(result.current).toBe(false);
  });

  it('returns true when the session has an impersonation scope', () => {
    mockSession({ impersonationScope: 'mpd_supervisor' });

    const { result } = renderHook(useRestrictedImpersonation);

    expect(result.current).toBe(true);
  });
});
