import { renderHook } from '@testing-library/react-hooks';
import { useSession } from 'next-auth/react';
import { mockSession } from '__tests__/util/mockSession';
import { useAssistantToken } from './useAssistantToken';

describe('useAssistantToken', () => {
  it('returns the api token from the session', () => {
    mockSession({ apiToken: 'token-123' });

    const { result } = renderHook(() => useAssistantToken());

    expect(result.current).toBe('token-123');
  });

  it('returns null without a session', () => {
    (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: () => Promise.resolve(null),
    });

    const { result } = renderHook(() => useAssistantToken());

    expect(result.current).toBeNull();
  });
});
