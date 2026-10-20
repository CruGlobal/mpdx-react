import React, { useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useIsOnline } from 'src/hooks/useIsOnline';

export const OFFLINE_SNACKBAR_KEY = 'offline-indicator';

export const OfflineIndicator: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const isOnline = useIsOnline();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      enqueueSnackbar(t("You're offline. Showing saved data."), {
        key: OFFLINE_SNACKBAR_KEY,
        variant: 'warning',
        persist: true,
        preventDuplicate: true,
      });
      return;
    }

    closeSnackbar(OFFLINE_SNACKBAR_KEY);
    // Only announce a reconnect, not the normal online state on page load
    if (wasOffline.current) {
      wasOffline.current = false;
      enqueueSnackbar(t('Back online'), { variant: 'success' });
    }
  }, [isOnline]);

  return null;
};
