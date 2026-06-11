import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Shell BINARY version, appended to the webview user agent as the
 * version-handshake transport (docs/pwa-design/capacitor-shell.md §8). The
 * web side enforces MIN_SUPPORTED_SHELL_VERSION from
 * src/lib/nativeShell/shellVersion.ts against this token; bump this constant
 * when cutting a new shell release.
 */
const shellVersion = '0.1.0';

const config: CapacitorConfig = {
  // PLACEHOLDER appId — see capacitor-shell.md §13 open questions 2/3 (Android
  // org.mpdx reuse depends on holding the legacy signing key; iOS bundle id
  // pending Apple account). The Android applicationId is overridden to
  // org.mpdx in android/app/build.gradle.
  appId: 'org.cru.mpdx',
  appName: 'MPDX',
  // error.html stub only; server.url overrides everything else (shell doc §1.2)
  webDir: 'capacitor-web',
  server: {
    // Stage host per capacitor-shell.md §1.1. NOTE: https://next.stage.mpdx.org
    // is the design doc's stage host; it does not appear in any repo env/config
    // file — verify it serves the Next.js stage app before the Gate 1 run.
    url:
      process.env.SHELL_TARGET === 'stage'
        ? 'https://next.stage.mpdx.org'
        : 'https://mpdx.org',
    errorPath: 'error.html',
    // allowNavigation: deliberately ABSENT (empty) — single-host rule
    // (capacitor-shell.md §1.1). Every webview navigation stays on the one app
    // host; all external URLs open in the system browser. Do NOT add entries.
  },
  ios: {
    // REQUIRED alongside WKAppBoundDomains in ios/App/App/Info.plist, or
    // bridge injection fails ("plugin not implemented") — shell doc §2.
    limitsNavigationsToAppBoundDomains: true,
  },
  // Version handshake (shell doc §8): SSR and client read MPDXShell/<semver>.
  appendUserAgent: `MPDXShell/${shellVersion}`,
};

// Capacitor CLI requires a default export from capacitor.config.ts; this is a
// deliberate exception to the repo's named-exports rule.
export default config;
