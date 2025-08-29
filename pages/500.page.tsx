import Head from 'next/head';
import React, { ReactElement } from 'react';
import DisabledByDefaultOutlinedIcon from '@mui/icons-material/DisabledByDefaultOutlined';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import BaseLayout from 'src/components/Layouts/Basic';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { StatusPageWrapper } from './styledComponents/StatusPageWrapper';

const Custom500 = (): ReactElement => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{`500 - Server-side Error Occurred | ${appName}`}</title>
      </Head>

      <StatusPageWrapper boxShadow={3} data-testid="EmptyReport">
        <Box mb={2}>
          <DisabledByDefaultOutlinedIcon fontSize="large" color="disabled" />
        </Box>
        <Typography variant="h5">
          {t('A server-side error has occurred.')}
        </Typography>
        <Box sx={{ padding: 1, display: 'flex', gap: 2 }}>
          <Button variant="contained" href="/">
            {t('Back to Home')}
          </Button>
        </Box>
      </StatusPageWrapper>
    </>
  );
};

Custom500.layout = BaseLayout;

export default Custom500;
