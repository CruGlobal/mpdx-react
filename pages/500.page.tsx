import React, { ReactElement } from 'react';
import DisabledByDefaultOutlinedIcon from '@mui/icons-material/DisabledByDefaultOutlined';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Head from 'next/head';
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

const Custom500 = (): ReactElement => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>500 - Server-side Error Occurred | {appName}</title>
      </Head>

      <BoxWrapper boxShadow={3} data-testid="EmptyReport">
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
      </BoxWrapper>
    </>
  );
};

export default Custom500;
