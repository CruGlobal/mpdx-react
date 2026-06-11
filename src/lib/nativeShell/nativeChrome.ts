import theme from 'src/theme';
import { isAndroidShell, isNativeShell } from './nativeShell';

/**
 * Native chrome control for the Capacitor shell (capacitor-shell.md §9).
 *
 * Both functions are no-ops on the web and load their Capacitor plugins via
 * dynamic `import()` so the web bundle never downloads plugin code (master
 * plan §3.4 R1). The integration point calls them from `_app` once after
 * hydration.
 */

/**
 * Hides the native splash screen. `launchAutoHide: false` in
 * capacitor.config.ts keeps the splash up until the remote webview has
 * hydrated; calling this at first meaningful paint avoids the white flash
 * between the native splash and the remote app load.
 */
export const hideSplashScreen = async (): Promise<void> => {
  if (!isNativeShell()) {
    return;
  }
  const { SplashScreen } = await import(
    /* webpackChunkName: "CapacitorSplashScreen" */ '@capacitor/splash-screen'
  );
  await SplashScreen.hide();
};

/**
 * Matches the native status bar to the app's chrome: light text over the
 * Primary-layout app bar color (theme token, not a hardcoded hex), and
 * `overlaysWebView: false` so the webview starts below the status bar — the
 * simplest safe-area story (capacitor-shell.md §9).
 *
 * `setBackgroundColor` / `setOverlaysWebView` are Android-only in
 * @capacitor/status-bar and reject on iOS, so they are gated; on iOS the
 * status bar always overlays and the safe-area padding on fixed chrome
 * (src/components/Shared/SafeArea) covers the inset instead.
 */
export const applyStatusBarStyle = async (): Promise<void> => {
  if (!isNativeShell()) {
    return;
  }
  const { StatusBar, Style } = await import(
    /* webpackChunkName: "CapacitorStatusBar" */ '@capacitor/status-bar'
  );
  // Style.Dark = light text for dark backgrounds (the mpdxGrayDark app bar)
  await StatusBar.setStyle({ style: Style.Dark });
  if (isAndroidShell()) {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({
      color: theme.palette.mpdxGrayDark.main,
    });
  }
};
