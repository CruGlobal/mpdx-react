import { createElement } from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { renderToString } from 'react-dom/server';
import { useIsStandalone } from './useIsStandalone';

const originalMatchMedia = window.matchMedia;

const mockMatchMedia = (matches: boolean) => {
  const mediaQueryList = {
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  window.matchMedia = jest.fn().mockReturnValue(mediaQueryList);
  return mediaQueryList;
};

describe('useIsStandalone', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Reflect.deleteProperty(navigator, 'standalone');
  });

  it('returns true when display-mode is standalone', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsStandalone());

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith(
      '(display-mode: standalone)',
    );
  });

  it('returns false in a browser tab', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsStandalone());

    expect(result.current).toBe(false);
  });

  it('returns true when iOS navigator.standalone is true', () => {
    mockMatchMedia(false);
    Object.defineProperty(navigator, 'standalone', {
      value: true,
      configurable: true,
    });
    const { result } = renderHook(() => useIsStandalone());

    expect(result.current).toBe(true);
  });

  it('updates when the display mode changes', () => {
    const mediaQueryList = mockMatchMedia(false);
    const { result } = renderHook(() => useIsStandalone());
    expect(result.current).toBe(false);

    mediaQueryList.matches = true;
    const [, onChange] = mediaQueryList.addEventListener.mock.calls.find(
      ([type]) => type === 'change',
    );
    act(() => {
      onChange();
    });

    expect(result.current).toBe(true);
  });

  it('returns false when rendered on the server', () => {
    window.matchMedia = jest.fn().mockImplementation(() => {
      throw new Error('matchMedia read during server rendering');
    });
    const Status = () =>
      createElement('span', null, useIsStandalone() ? 'installed' : 'tab');

    expect(renderToString(createElement(Status))).toBe('<span>tab</span>');
  });
});
