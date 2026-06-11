import React, { useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { useLocale } from 'src/hooks/useLocale';
import { isNativeShell } from 'src/lib/nativeShell/nativeShell';
import { startPushRegistration } from 'src/lib/nativeShell/pushRegistration';
import { isPushEnabled } from 'src/lib/nativeShell/pushStorage';

const loadPushPlugin = async () =>
  (
    await import(
      /* webpackChunkName: "CapacitorPushNotifications" */ '@capacitor/push-notifications'
    )
  ).PushNotifications;

/**
 * Launch-time push registration bootstrap (push-registration design §3.3).
 * Mounted once in `_app` inside the Apollo and UserPreference providers;
 * renders nothing. Registration lifecycle ONLY — notification-tap deep links
 * live in `NativeDeepLinkProvider` (master plan §3.4 R3).
 *
 * Invariants:
 * - **Never prompts on launch.** `checkPermissions()` is a read-only check
 *   and `register()` never prompts; `requestPermissions()` is only ever
 *   called from the settings opt-in card.
 * - **Silent.** Permission revoked in OS settings, a missing opt-in flag, or
 *   a failed re-registration are all no-ops — the next launch retries
 *   naturally.
 * - **Idempotent.** `startPushRegistration`'s `registration` listener makes
 *   exactly one upserting `RegisterUserDevice` POST per app launch (the
 *   backend upsert fixes device ownership and recreates server-deleted
 *   rows), then skips the network for repeat events within the session
 *   unless the token or locale changes.
 */
export const PushBootstrap: React.FC = () => {
  const client = useApolloClient();
  const locale = useLocale();

  useEffect(() => {
    if (!isNativeShell() || !isPushEnabled()) {
      return;
    }
    (async () => {
      const PushNotifications = await loadPushPlugin();
      // NON-prompting read of the OS permission state
      const { receive } = await PushNotifications.checkPermissions();
      if (receive !== 'granted') {
        // User revoked notifications in OS settings — stay silent. The
        // settings card surfaces the denied state when they visit it.
        return;
      }
      await startPushRegistration(client, locale);
    })().catch(() => {
      // Best-effort bootstrap: plugin or permission-check failures are
      // swallowed by design — nothing is stored, so the next launch retries.
    });
    // Re-running when the user preference locale settles/changes is safe
    // (startPushRegistration replaces only its own listeners and the
    // registration POST is an idempotent upsert) and re-registers the device
    // under the new locale.
  }, [client, locale]);

  return null;
};
