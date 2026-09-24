import { renderHook } from '@testing-library/react-hooks';
import { mockSession } from '__tests__/util/mockSession';
import {
  ImpersonationArea,
  ImpersonatorRole,
} from 'src/lib/impersonationAccess';
import { useImpersonatorRole } from './useImpersonatorRole';

describe('useImpersonatorRole', () => {
  afterEach(() => {
    // mockSession uses mockReturnValue, which clearMocks does not reset
    mockSession({});
  });

  it('never blocks when not impersonating', () => {
    mockSession({ impersonating: false, impersonatorRole: undefined });

    const { result } = renderHook(() => useImpersonatorRole());

    expect(result.current.impersonating).toBe(false);
    expect(result.current.impersonatorRole).toBeUndefined();
    Object.values(ImpersonationArea).forEach((area) => {
      expect(result.current.blocked(area)).toBe(false);
    });
  });

  it('exposes the impersonator role and consults the access table', () => {
    mockSession({
      impersonating: true,
      impersonatorRole: ImpersonatorRole.MpdLeader,
    });

    const { result } = renderHook(() => useImpersonatorRole());

    expect(result.current.impersonating).toBe(true);
    expect(result.current.impersonatorRole).toBe(ImpersonatorRole.MpdLeader);
    expect(result.current.blocked(ImpersonationArea.Contacts)).toBe(true);
    expect(result.current.blocked(ImpersonationArea.NsGoalCalculator)).toBe(
      false,
    );
  });

  it('blocks everything for an impersonator with no known role', () => {
    mockSession({ impersonating: true, impersonatorRole: undefined });

    const { result } = renderHook(() => useImpersonatorRole());

    Object.values(ImpersonationArea).forEach((area) => {
      expect(result.current.blocked(area)).toBe(true);
    });
  });

  it('blocks nothing for a developer impersonator', () => {
    mockSession({
      impersonating: true,
      impersonatorRole: ImpersonatorRole.Developer,
    });

    const { result } = renderHook(() => useImpersonatorRole());

    Object.values(ImpersonationArea).forEach((area) => {
      expect(result.current.blocked(area)).toBe(false);
    });
  });
});
