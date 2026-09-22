import { renderHook } from '@testing-library/react-hooks';
import { useSession } from 'next-auth/react';
import { mockSession } from '__tests__/util/mockSession';
import { useAssistantVisibility } from './useAssistantVisibility';

describe('useAssistantVisibility', () => {
  beforeEach(() => {
    process.env.DEVELOPMENT_ENV = 'true';
    process.env.DISABLE_ASSISTANT = 'false';
    mockSession({ developer: true, impersonating: false });
  });

  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
    process.env.DISABLE_ASSISTANT = 'false';
  });

  it('is visible for a developer in a development env', () => {
    const { result } = renderHook(() => useAssistantVisibility());

    expect(result.current).toBe(true);
  });

  it('is hidden when DISABLE_ASSISTANT is on', () => {
    process.env.DISABLE_ASSISTANT = 'true';

    const { result } = renderHook(() => useAssistantVisibility());

    expect(result.current).toBe(false);
  });

  it('is hidden when impersonating', () => {
    mockSession({ developer: true, impersonating: true });

    const { result } = renderHook(() => useAssistantVisibility());

    expect(result.current).toBe(false);
  });

  it('is hidden for a non-developer', () => {
    mockSession({ developer: false });

    const { result } = renderHook(() => useAssistantVisibility());

    expect(result.current).toBe(false);
  });

  it('is hidden when there is no session', () => {
    (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: () => Promise.resolve(null),
    });

    const { result } = renderHook(() => useAssistantVisibility());

    expect(result.current).toBe(false);
  });

  it('is hidden for a developer outside a development env', () => {
    process.env.DEVELOPMENT_ENV = 'false';

    const { result } = renderHook(() => useAssistantVisibility());

    expect(result.current).toBe(false);
  });
});
