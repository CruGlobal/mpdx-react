import Head from 'next/head';
import React, { ReactElement } from 'react';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import BaseLayout from 'src/components/Layouts/Basic';
import { getAppName } from 'src/lib/getAppName';
import { StatusPageWrapper } from './styledComponents/StatusPageWrapper';

const Offline = (): ReactElement => {
  const appName = getAppName();
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{`${t('Offline')} | ${appName}`}</title>
      </Head>

      <StatusPageWrapper boxShadow={3}>
        <Box mb={2}>
          <WifiOffIcon fontSize="large" color="disabled" />
        </Box>
        <Typography variant="h5">{t('You are offline.')}</Typography>
        <Typography>
          {t(
            'This page is not available offline. Check your internet connection and try again.',
          )}
        </Typography>
        <Box sx={{ padding: 1, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            {t('Try Again')}
          </Button>
        </Box>
      </StatusPageWrapper>
    </>
  );
};

Offline.layout = BaseLayout;

export default Offline;
