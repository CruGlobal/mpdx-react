import React, { useEffect, useRef } from 'react';
import { Button } from '@mui/material';
import { Serwist } from '@serwist/window';
import { SnackbarKey, useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export const ServiceWorkerUpdatePrompt: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  // Avoid double registration from React strict mode re-running effects
  const registeredRef = useRef(false);

  useEffect(() => {
    const swEnabled =
      process.env.NODE_ENV === 'production' ||
      process.env.ENABLE_SW === 'true';
    if (
      !swEnabled ||
      registeredRef.current ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }
    registeredRef.current = true;

    const serwist = new Serwist('/sw.js', { scope: '/', type: 'classic' });

    serwist.addEventListener('waiting', () => {
      serwist.addEventListener('controlling', () => {
        window.location.reload();
      });

      enqueueSnackbar(t('A new version of the app is available.'), {
        persist: true,
        action: (key: SnackbarKey) => (
          <Button
            color="inherit"
            onClick={() => {
              closeSnackbar(key);
              serwist.messageSkipWaiting();
            }}
          >
            {t('Update')}
          </Button>
        ),
      });
    });

    void serwist.register();
  }, [enqueueSnackbar, closeSnackbar, t]);

  return null;
};
