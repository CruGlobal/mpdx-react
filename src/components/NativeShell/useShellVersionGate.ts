import { useMemo } from 'react';
import { isNativeShell } from 'src/lib/nativeShell/nativeShell';
import {
  isShellVersionSupported,
  parseShellVersion,
} from 'src/lib/nativeShell/shellVersion';

interface ShellVersionGate {
  /**
   * True when the app is running inside a Capacitor shell older than
   * `MIN_SUPPORTED_SHELL_VERSION` (or one that predates the UA handshake
   * entirely). The integrator should render `UpgradeRequiredScreen` instead
   * of the app when this is true. Always false in the browser.
   */
  upgradeRequired: boolean;
}

/**
 * Shell version handshake gate (capacitor-shell.md §8). Mount once at the
 * `_app` level: when `upgradeRequired` is true, render
 * `UpgradeRequiredScreen` in place of the page tree.
 *
 * The shell binary version cannot change while the webview is running, so the
 * result is computed once per mount.
 */
export const useShellVersionGate = (): ShellVersionGate => {
  const upgradeRequired = useMemo(() => {
    // SSR never runs inside the shell webview's client bridge; the gate is a
    // client-side concern (the UA token is also visible to SSR, but
    // enforcement happens after hydration).
    if (typeof navigator === 'undefined' || !isNativeShell()) {
      return false;
    }
    return !isShellVersionSupported(parseShellVersion(navigator.userAgent));
  }, []);

  return { upgradeRequired };
};
