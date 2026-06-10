import { act, renderHook } from '@testing-library/react';
import { useIsOnline } from './useIsOnline';

describe('useIsOnline', () => {
  it('returns the initial navigator.onLine value', () => {
    const { result } = renderHook(() => useIsOnline());

    expect(result.current).toBe(true);
  });

  it('returns false after an offline event and true after an online event', () => {
    const { result } = renderHook(() => useIsOnline());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });

  it('removes event listeners on unmount', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useIsOnline());
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    removeSpy.mockRestore();
  });
});
