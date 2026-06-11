import { CSSObject } from '@mui/material/styles';

/**
 * Safe-area mixins for fixed-position chrome (capacitor-shell.md §9: prefer a
 * small styled wrapper over sprinkling raw `env()`).
 *
 * `viewport-fit=cover` is set in `_app.page.tsx`, so `env(safe-area-inset-*)`
 * resolves to the notch / status-bar / home-indicator insets when the app runs
 * fullscreen (iOS standalone PWA, iOS Capacitor shell — where the status bar
 * always overlays the webview) and to `0` in regular browsers and on Android
 * (`overlaysWebView: false`), making these mixins inert outside fullscreen
 * contexts.
 *
 * Safe-area audit (T27): the only always-mounted fixed chrome is the top app
 * bars (`Layouts/Primary/TopBar`, `Layouts/Basic/TopBar`) — there is no bottom
 * navigation. `AlertBanner` / `AnnouncementBanner` anchor below the app bar
 * and `SidePanelsLayout`'s right panel starts below the toolbar, so they
 * inherit the offset and need no insets of their own.
 */

/** Spread into a fixed top app bar so its content clears the top/side insets. */
// `as const satisfies CSSObject` (instead of a CSSObject annotation) keeps the
// literal types so the mixins also satisfy tss-react's stricter CSSObject.
export const topChromeSafeAreaPadding = {
  paddingTop: 'env(safe-area-inset-top)',
  paddingLeft: 'env(safe-area-inset-left)',
  paddingRight: 'env(safe-area-inset-right)',
} as const satisfies CSSObject;

/**
 * Spread into the in-flow offset/spacer div that compensates for a fixed app
 * bar (the `theme.mixins.toolbar` "Offset" pattern) so the page content drops
 * by the same inset the bar grew by. Uses padding + `content-box` (the
 * toolbar mixin sets `minHeight`, which would swallow border-box padding) to
 * avoid the margin-collapse risk of a `marginTop` spacer.
 */
export const topChromeSafeAreaOffset = {
  paddingTop: 'env(safe-area-inset-top)',
  boxSizing: 'content-box',
} as const satisfies CSSObject;
