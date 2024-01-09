import Head from 'next/head';
import React, { ReactElement } from 'react';
import DisabledByDefaultOutlinedIcon from '@mui/icons-material/DisabledByDefaultOutlined';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import useGetAppSettings from '../src/hooks/useGetAppSettings';

const BoxWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  height: 300,
  minWidth: 700,
  margin: 'auto',
  padding: 4,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const Custom404 = (): ReactElement => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>404 - Page Not Found | {appName}</title>
      </Head>

      <BoxWrapper boxShadow={3} data-testid="EmptyReport">
        <Box mb={2}>
          <DisabledByDefaultOutlinedIcon fontSize="large" color="disabled" />
        </Box>
        <Typography variant="h5">
          {t('We cannot find what you are looking for.')}
        </Typography>
        <Typography>
          {t('The page you are looking for does not exist or has been moved.')}
        </Typography>
        <Box sx={{ padding: 1, display: 'flex', gap: 2 }}>
          <Button variant="contained" href="/">
            {t('Back to Home')}
          </Button>
        </Box>
      </BoxWrapper>
    </>
  );
};

export default Custom404;
