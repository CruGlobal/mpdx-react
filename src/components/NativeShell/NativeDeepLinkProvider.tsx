import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import {
  allowedDeepLinkHosts,
  deepLinkFromUrl,
  routeFromPushData,
} from 'src/lib/nativeShell/deepLink';
import { isNativeShell } from 'src/lib/nativeShell/nativeShell';
import type { PluginListenerHandle } from '@capacitor/core';

const loadAppPlugin = async () =>
  (await import(/* webpackChunkName: "CapacitorApp" */ '@capacitor/app')).App;

const loadPushPlugin = async () =>
  (
    await import(
      /* webpackChunkName: "CapacitorPushNotifications" */ '@capacitor/push-notifications'
    )
  ).PushNotifications;

/**
 * Cold-start universal links are handled exactly once per app launch via
 * `App.getLaunchUrl()`. Module-level so the latch survives React 18
 * StrictMode double-effects and provider remounts (deep-links design §4.3).
 */
let handledLaunchUrl = false;

/** Test-only escape hatch for the module-level cold-start latch. */
export const resetLaunchUrlLatchForTesting = (): void => {
  handledLaunchUrl = false;
};

/**
 * Owns all tap/link routing in the native shell (deep-links design §4.3,
 * master plan §3.4 R3): warm-start universal links (`appUrlOpen`), cold-start
 * universal links (`App.getLaunchUrl()`), and push-notification taps
 * (`pushNotificationActionPerformed`). Renders nothing; mounted once in
 * `_app` so the push-tap listener registers early enough to catch the
 * cold-start replay.
 *
 * Navigation goes through the pure sanitizers in
 * `src/lib/nativeShell/deepLink.ts` — every routed path is same-origin by
 * construction. Navigation happens immediately regardless of auth state:
 * RouterGuard owns the login round-trip and lands the user back on the
 * deep-link target afterwards (deep-links design §4.4).
 */
export const NativeDeepLinkProvider: React.FC = () => {
  const router = useRouter();
  // The listeners live for the provider's lifetime ([] deps) but must read
  // the *current* asPath when deduping, so the latest router is kept in a ref.
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    if (!isNativeShell()) {
      return;
    }

    const navigate = (path: string, replace = false) => {
      const currentRouter = routerRef.current;
      if (path === currentRouter.asPath) {
        // Tapping the same notification twice shouldn't churn history
        return;
      }
      if (replace) {
        currentRouter.replace(path);
      } else {
        currentRouter.push(path);
      }
    };

    let disposed = false;
    const handles: PluginListenerHandle[] = [];
    const removeAll = () => handles.forEach((handle) => handle.remove());

    (async () => {
      const [App, PushNotifications] = await Promise.all([
        loadAppPlugin(),
        loadPushPlugin(),
      ]);

      // Warm start: universal link tapped while the app is running/backgrounded
      handles.push(
        await App.addListener('appUrlOpen', ({ url }) => {
          const path = deepLinkFromUrl(url, allowedDeepLinkHosts());
          if (path) {
            navigate(path);
          }
        }),
      );

      // Push tap — warm AND cold start: the plugin queues the launching tap
      // and replays it once a listener registers. Reads
      // `notification.data.deepLink` (master plan §3.4 R2). `data` is the
      // entire APNs userInfo / FCM data map — a superset that also carries
      // `aps`, the legacy `link` key, and FCM `google.*` bookkeeping —
      // `routeFromPushData` extracts only `deepLink` and ignores the rest.
      handles.push(
        await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          ({ actionId, notification }) => {
            if (actionId === 'tap') {
              navigate(routeFromPushData(notification.data));
            }
          },
        ),
      );

      if (disposed) {
        removeAll();
        return;
      }

      // Cold start via universal link: appUrlOpen may fire before this effect
      // runs; getLaunchUrl() is the reliable source. Handle exactly once.
      const launch = await App.getLaunchUrl();
      if (launch?.url && !handledLaunchUrl) {
        handledLaunchUrl = true;
        const path = deepLinkFromUrl(launch.url, allowedDeepLinkHosts());
        if (path) {
          // replace: don't trap Back on the splash route
          navigate(path, true);
        }
      }
    })().catch(() => {
      // Best-effort wiring: a failed plugin load leaves normal in-app
      // navigation untouched — deep links simply don't route this session.
    });

    return () => {
      disposed = true;
      removeAll();
    };
  }, []);

  return null;
};
