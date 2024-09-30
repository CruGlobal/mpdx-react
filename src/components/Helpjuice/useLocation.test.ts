import { act, renderHook } from '@testing-library/react-hooks';
import { useLocation } from './useLocation';

describe('useLocation', () => {
  beforeEach(() => {
    location.href = 'https://example.com';
  });

  it('should return the current location.href initially', () => {
    const { result } = renderHook(useLocation);

    expect(result.current).toBe('https://example.com');
  });

  it('should update href when location.href changes due to popstate event', () => {
    const { result } = renderHook(useLocation);

    act(() => {
      location.href = 'https://example.com/page1';
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current).toBe('https://example.com/page1');
  });

  it('should update href when location.href changes due to hashchange event', () => {
    const { result } = renderHook(useLocation);

    act(() => {
      location.href = 'https://example.com#section';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current).toBe('https://example.com#section');
  });

  it('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(useLocation);

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'popstate',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'hashchange',
      expect.any(Function),
    );
  });
});
