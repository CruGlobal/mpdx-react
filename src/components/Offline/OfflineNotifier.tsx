import React, { useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useIsOnline } from 'src/hooks/useIsOnline';

const offlineSnackbarKey = 'offline-notifier';

export const OfflineNotifier: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const isOnline = useIsOnline();
  // Skip the "back online" toast on initial mount
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      enqueueSnackbar(
        t('You are offline. Changes cannot be saved until you reconnect.'),
        {
          key: offlineSnackbarKey,
          variant: 'warning',
          persist: true,
          preventDuplicate: true,
        },
      );
    } else {
      closeSnackbar(offlineSnackbarKey);
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        enqueueSnackbar(t('You are back online.'), { variant: 'success' });
      }
    }
  }, [isOnline, enqueueSnackbar, closeSnackbar, t]);

  return null;
};
