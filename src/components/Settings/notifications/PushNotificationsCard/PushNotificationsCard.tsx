import React, { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { getAppName } from 'src/lib/getAppName';
import {
  getDevicePlatform,
  isNativeShell,
} from 'src/lib/nativeShell/nativeShell';
import { disablePush, enablePush } from 'src/lib/nativeShell/pushRegistration';
import { isPushEnabled } from 'src/lib/nativeShell/pushStorage';
import type { PermissionState } from '@capacitor/core';

/**
 * Per-device push notification opt-in for the Capacitor native shell
 * (push-registration design §5.1).
 *
 * This card's enable button (via `enablePush`) is the ONLY
 * `requestPermissions()` call site in the app — the OS permission prompt may
 * never be triggered from anywhere else (launch-time re-registration uses the
 * non-prompting `checkPermissions()` instead).
 *
 * Renders nothing in a browser: the first check is `isNativeShell()`, and the
 * push plugin is only loaded via dynamic `import()` after that check.
 */

type PushCardState = 'off' | 'enabled' | 'denied' | 'error';

const loadPushPlugin = async () =>
  (
    await import(
      /* webpackChunkName: "CapacitorPushNotifications" */ '@capacitor/push-notifications'
    )
  ).PushNotifications;

/**
 * Reads the OS notification permission with the non-prompting
 * `checkPermissions()`. `null` until known (or forever on the web). Re-checks
 * whenever the document becomes visible again: in the Capacitor shell,
 * returning from OS Settings resumes the webview without a remount, and the
 * denied state must be able to clear within the session.
 */
const usePushPermission = (): PermissionState | null => {
  const [permission, setPermission] = useState<PermissionState | null>(null);

  useEffect(() => {
    if (!isNativeShell()) {
      return;
    }
    let active = true;
    const checkPermission = () => {
      loadPushPlugin()
        .then((PushNotifications) => PushNotifications.checkPermissions())
        .then(({ receive }) => {
          if (active) {
            setPermission(receive);
          }
        })
        .catch(() => {
          // Plugin unavailable — assume promptable so the card stays usable
          if (active) {
            setPermission('prompt');
          }
        });
    };
    checkPermission();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkPermission();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return permission;
};

export const PushNotificationsCard: React.FC = () => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const appName = getAppName();
  const permission = usePushPermission();
  const [cardState, setCardState] = useState<PushCardState>(() =>
    isNativeShell() && isPushEnabled() ? 'enabled' : 'off',
  );
  const [inFlight, setInFlight] = useState(false);

  useEffect(() => {
    if (permission === null) {
      return;
    }
    if (permission === 'denied') {
      setCardState('denied');
    } else {
      // The user granted (or reset) notifications in OS Settings and came
      // back — the denied dead-end must clear without a remount
      setCardState((current) =>
        current === 'denied' ? (isPushEnabled() ? 'enabled' : 'off') : current,
      );
    }
  }, [permission]);

  if (!isNativeShell()) {
    return null;
  }

  const handleRegistrationError = () => {
    setCardState('error');
  };

  const handleEnable = async () => {
    setInFlight(true);
    try {
      const result = await enablePush(client, locale, handleRegistrationError);
      if (result === 'granted') {
        setCardState('enabled');
        enqueueSnackbar(t('Push notifications enabled on this device'), {
          variant: 'success',
        });
      } else if (result === 'denied') {
        setCardState('denied');
      }
    } catch {
      setCardState('error');
    } finally {
      setInFlight(false);
    }
  };

  const handleDisable = async () => {
    setInFlight(true);
    // disablePush never throws — every teardown step is best-effort
    await disablePush(client);
    setCardState('off');
    enqueueSnackbar(t('Push notifications disabled on this device'), {
      variant: 'success',
    });
    setInFlight(false);
  };

  return (
    <Card component="section" sx={{ marginTop: 3 }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {t('Push Notifications')}
        </Typography>
        {permission === null && (
          // The OS permission read is still in flight — rendering the off
          // state here would flash an active enable button at
          // previously-denied users
          <Skeleton
            data-testid="PushNotificationsCardSkeleton"
            variant="rounded"
            height={36}
            width={240}
          />
        )}
        {permission !== null && cardState === 'off' && (
          <>
            <Typography paragraph>
              {t(
                'Get notified on this device when important partner events happen, based on the notification types you choose below.',
              )}
            </Typography>
            <Button
              variant="contained"
              onClick={handleEnable}
              disabled={inFlight}
              startIcon={
                inFlight ? (
                  <CircularProgress color="inherit" size={16} />
                ) : undefined
              }
            >
              {t('Enable Push Notifications')}
            </Button>
          </>
        )}
        {permission !== null && cardState === 'enabled' && (
          <>
            <Alert severity="success" sx={{ marginBottom: 2 }}>
              {t('Push notifications are enabled on this device.')}
            </Alert>
            <Button
              variant="outlined"
              onClick={handleDisable}
              disabled={inFlight}
            >
              {t('Disable on this device')}
            </Button>
          </>
        )}
        {permission !== null && cardState === 'denied' && (
          <Alert severity="warning">
            {getDevicePlatform() === 'APNS'
              ? t(
                  'Notifications are turned off for {{appName}} in your device settings. Open the Settings app, tap Notifications, select {{appName}}, allow notifications, and then return here.',
                  { appName },
                )
              : t(
                  'Notifications are turned off for {{appName}} in your device settings. Open Settings, tap Apps, select {{appName}}, turn on notifications, and then return here.',
                  { appName },
                )}
          </Alert>
        )}
        {permission !== null && cardState === 'error' && (
          <>
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {t(
                'Something went wrong enabling push notifications on this device.',
              )}
            </Alert>
            <Button
              variant="contained"
              onClick={handleEnable}
              disabled={inFlight}
              startIcon={
                inFlight ? (
                  <CircularProgress color="inherit" size={16} />
                ) : undefined
              }
            >
              {t('Retry')}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
