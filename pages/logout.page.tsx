import Head from 'next/head';
import React, { ReactElement, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import { Box, Typography } from '@mui/material';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { clearDataDogUser } from 'src/lib/dataDog';
import { ensureSessionAndAccountList } from './api/utils/pagePropsHelpers';
import { StatusPageWrapper } from './styledComponents/StatusPageWrapper';

const LogoutPage = ({}): ReactElement => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const client = useApolloClient();

  useEffect(() => {
    signOut({ callbackUrl: 'signOut' }).then(() => {
      clearDataDogUser();
      client.clearStore();
    });
  }, []);

  return (
    <>
      <Head>
        <title>{`${t('Logout')} | ${appName}`}</title>
      </Head>
      <StatusPageWrapper boxShadow={3} data-testid="EmptyReport">
        <Box mb={2}>
          <ExitToAppRoundedIcon fontSize="large" color="disabled" />
        </Box>
        <Typography variant="h5">
          {t("You're currently being logged out.")}
        </Typography>
      </StatusPageWrapper>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default LogoutPage;
