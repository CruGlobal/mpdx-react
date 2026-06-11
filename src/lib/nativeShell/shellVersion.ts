/**
 * Shell version handshake (docs/pwa-design/capacitor-shell.md §8).
 *
 * The Capacitor shell appends `MPDXShell/<semver>` to the webview user agent
 * (see `appendUserAgent` in capacitor.config.ts). Because web deploys land in
 * every installed shell instantly, the web side will eventually require
 * native plugin surface that old binaries do not have. This module parses the
 * UA token and compares it against the minimum shell version this web build
 * supports.
 */

/**
 * The minimum shell binary version this web deploy supports.
 *
 * Owned by the frontend repo and changed only via reviewed PR: bump it in the
 * same PR that starts requiring a new native capability (e.g. a new plugin
 * API). Shells older than this render `UpgradeRequiredScreen`. Keep in sync
 * with the `shellVersion` constant in capacitor.config.ts when cutting shell
 * releases.
 */
export const MIN_SUPPORTED_SHELL_VERSION = '0.1.0';

// The token is appended verbatim by Capacitor's appendUserAgent; require a
// full major.minor.patch triple so a malformed shell build fails closed.
const SHELL_UA_PATTERN = /MPDXShell\/(\d+\.\d+\.\d+)/;

/**
 * Extracts the shell semver from a user agent string, or returns `null` when
 * the `MPDXShell/<semver>` token is absent or malformed.
 */
export const parseShellVersion = (userAgent: string): string | null => {
  const match = SHELL_UA_PATTERN.exec(userAgent);
  return match ? match[1] : null;
};

/**
 * Numeric semver comparison. Returns a negative number when `a < b`, zero
 * when equal, and a positive number when `a > b`. Missing segments are
 * treated as 0.
 */
export const compareShellVersions = (a: string, b: string): number => {
  const segmentsA = a.split('.').map(Number);
  const segmentsB = b.split('.').map(Number);
  for (let i = 0; i < Math.max(segmentsA.length, segmentsB.length); i++) {
    const difference = (segmentsA[i] ?? 0) - (segmentsB[i] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
};

/**
 * Whether a parsed shell version satisfies `MIN_SUPPORTED_SHELL_VERSION`.
 * `null` (token missing or unparseable) is unsupported: a shell that does not
 * identify itself predates the handshake and must upgrade.
 */
export const isShellVersionSupported = (version: string | null): boolean =>
  version !== null &&
  compareShellVersions(version, MIN_SUPPORTED_SHELL_VERSION) >= 0;
