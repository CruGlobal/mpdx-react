import React, { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import { Box, Button, Typography } from '@mui/material';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { clearApolloData } from 'src/lib/apollo/clearApolloData';
import { clearDataDogUser } from 'src/lib/dataDog';
import { getDevicePlatform } from 'src/lib/nativeShell/nativeShell';

// PLACEHOLDER store URLs (capacitor-shell.md §8/§13): the final listing ids
// land with store submission (master plan T32). The Play id mirrors the
// legacy org.mpdx applicationId set in android/app/build.gradle.
const APP_STORE_URL = 'https://apps.apple.com/app/id0000000000';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=org.mpdx';

/**
 * Blocking screen shown when the Capacitor shell binary is older than
 * `MIN_SUPPORTED_SHELL_VERSION` (capacitor-shell.md §8). Rendered by the
 * integrator in place of the page tree when `useShellVersionGate()` reports
 * `upgradeRequired`.
 *
 * Must be mounted inside the ApolloProvider: the sign out affordance (which
 * this screen must never block) clears local Apollo data before signing out,
 * matching every other sign out path in the app.
 */
export const UpgradeRequiredScreen: React.FC = () => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [signingOut, setSigningOut] = useState(false);

  const storeUrl =
    getDevicePlatform() === 'APNS' ? APP_STORE_URL : PLAY_STORE_URL;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      clearDataDogUser();
      await clearApolloData(client);
      await signOut({ callbackUrl: 'signOut' });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        padding: 3,
        backgroundColor: theme.palette.common.white,
      })}
    >
      <PhoneIphoneIcon color="primary" sx={{ fontSize: 64 }} />
      <Typography variant="h5" component="h1">
        {t('Update Required')}
      </Typography>
      <Typography color="textSecondary">
        {t(
          'This version of the MPDX app is no longer supported. Update to the latest version to keep using MPDX.',
        )}
      </Typography>
      <Button variant="contained" href={storeUrl}>
        {t('Update MPDX')}
      </Button>
      <Button color="inherit" disabled={signingOut} onClick={handleSignOut}>
        {t('Sign Out')}
      </Button>
    </Box>
  );
};
