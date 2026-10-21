import Head from 'next/head';
import React, { ReactElement } from 'react';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import BaseLayout from 'src/components/Layouts/Basic';
import { getAppName } from 'src/lib/getAppName';
import { StatusPageWrapper } from './styledComponents/StatusPageWrapper';

// The service worker shows this page when a page load fails offline. It has no
// data fetching, so Next builds it to static HTML that is safe to cache.
const OfflinePage = (): ReactElement => {
  const appName = getAppName();
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{`${t('Offline')} | ${appName}`}</title>
      </Head>

      <StatusPageWrapper boxShadow={3}>
        <Box mb={2}>
          <CloudOffIcon fontSize="large" color="disabled" />
        </Box>
        <Typography variant="h5">{t("You're offline")}</Typography>
        <Typography>
          {t('Check your internet connection, then try again.')}
        </Typography>
        <Box sx={{ padding: 1, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            {t('Retry')}
          </Button>
        </Box>
      </StatusPageWrapper>
    </>
  );
};

OfflinePage.layout = BaseLayout;

export default OfflinePage;
