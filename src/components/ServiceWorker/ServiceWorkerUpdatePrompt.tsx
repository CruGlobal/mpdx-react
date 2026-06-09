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

    // Register the controlling listener once, up-front, so it is never
    // accumulated inside repeated `waiting` callbacks.
    serwist.addEventListener('controlling', () => {
      window.location.reload();
    });

    serwist.addEventListener('waiting', () => {
      enqueueSnackbar(
        t('A new version of the app is available. Updating will reload the page.'),
        {
          persist: true,
          preventDuplicate: true,
          key: 'sw-update',
          action: (key: SnackbarKey) => (
            <>
              <Button
                color="inherit"
                onClick={() => {
                  closeSnackbar(key);
                  serwist.messageSkipWaiting();
                }}
              >
                {t('Update')}
              </Button>
              <Button color="inherit" onClick={() => closeSnackbar(key)}>
                {t('Later')}
              </Button>
            </>
          ),
        },
      );
    });

    serwist.register().catch(() => {
      // Allow a retry on the next mount if registration failed transiently
      registeredRef.current = false;
    });
  }, [enqueueSnackbar, closeSnackbar, t]);

  return null;
};
