import { act, renderHook } from '@testing-library/react-hooks';
import { useIsOnline } from './useIsOnline';

const setOnline = (online: boolean) => {
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
};

const goOffline = () => {
  setOnline(false);
  act(() => {
    window.dispatchEvent(new Event('offline'));
  });
};

const goOnline = () => {
  setOnline(true);
  act(() => {
    window.dispatchEvent(new Event('online'));
  });
};

describe('useIsOnline', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true when the browser starts online', () => {
    setOnline(true);
    const { result } = renderHook(() => useIsOnline());

    expect(result.current).toBe(true);
  });

  it('returns false when the browser starts offline', () => {
    setOnline(false);
    const { result } = renderHook(() => useIsOnline());

    expect(result.current).toBe(false);
  });

  it('updates when the connection drops and comes back', () => {
    setOnline(true);
    const { result } = renderHook(() => useIsOnline());

    goOffline();
    expect(result.current).toBe(false);

    goOnline();
    expect(result.current).toBe(true);
  });

  it('stops listening after unmount', () => {
    setOnline(true);
    const removeEventListener = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useIsOnline());

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function),
    );
  });
});
