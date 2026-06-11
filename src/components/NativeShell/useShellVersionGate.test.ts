import { renderHook } from '@testing-library/react';
import { isNativeShell } from 'src/lib/nativeShell/nativeShell';
import { MIN_SUPPORTED_SHELL_VERSION } from 'src/lib/nativeShell/shellVersion';
import { useShellVersionGate } from './useShellVersionGate';

jest.mock('src/lib/nativeShell/nativeShell');

const isNativeShellMock = isNativeShell as jest.MockedFunction<
  typeof isNativeShell
>;

const browserUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';

const setUserAgent = (userAgent: string) =>
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent);

describe('useShellVersionGate', () => {
  it('does not require upgrade outside the native shell', () => {
    isNativeShellMock.mockReturnValue(false);
    setUserAgent(browserUserAgent);

    const { result } = renderHook(() => useShellVersionGate());

    expect(result.current.upgradeRequired).toBe(false);
  });

  it('does not require upgrade in the shell at exactly the minimum version', () => {
    isNativeShellMock.mockReturnValue(true);
    setUserAgent(`${browserUserAgent} MPDXShell/${MIN_SUPPORTED_SHELL_VERSION}`);

    const { result } = renderHook(() => useShellVersionGate());

    expect(result.current.upgradeRequired).toBe(false);
  });

  it('does not require upgrade in the shell above the minimum version', () => {
    const [major] = MIN_SUPPORTED_SHELL_VERSION.split('.').map(Number);
    isNativeShellMock.mockReturnValue(true);
    setUserAgent(`${browserUserAgent} MPDXShell/${major + 1}.0.0`);

    const { result } = renderHook(() => useShellVersionGate());

    expect(result.current.upgradeRequired).toBe(false);
  });

  it('requires upgrade in the shell below the minimum version', () => {
    isNativeShellMock.mockReturnValue(true);
    setUserAgent(`${browserUserAgent} MPDXShell/0.0.0`);

    const { result } = renderHook(() => useShellVersionGate());

    expect(result.current.upgradeRequired).toBe(true);
  });

  it('requires upgrade in the shell when the UA token is missing (pre-handshake shell)', () => {
    isNativeShellMock.mockReturnValue(true);
    setUserAgent(browserUserAgent);

    const { result } = renderHook(() => useShellVersionGate());

    expect(result.current.upgradeRequired).toBe(true);
  });
});
