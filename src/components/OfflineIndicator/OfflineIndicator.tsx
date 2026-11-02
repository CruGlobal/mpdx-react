import React, { useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useIsOnline } from 'src/hooks/useIsOnline';

export const OfflineIndicator: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const isOnline = useIsOnline();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      // Each offline stretch gets its own snackbar key. Reusing one key would let
      // a notice that is still closing swallow the next one, and so would the
      // app's duplicate check, which matches on the message.
      const key = enqueueSnackbar(t("You're offline. Showing saved data."), {
        variant: 'warning',
        persist: true,
        preventDuplicate: false,
      });
      // Runs when the connection comes back and on unmount
      return () => closeSnackbar(key);
    }

    // Only announce a reconnect, not the normal online state on page load
    if (wasOffline.current) {
      wasOffline.current = false;
      enqueueSnackbar(t('Back online'), { variant: 'success' });
    }
  }, [isOnline]);

  return null;
};
