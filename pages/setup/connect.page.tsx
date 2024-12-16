import Head from 'next/head';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Connect } from 'src/components/Setup/Connect';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { ensureSessionAndAccountList } from '../api/utils/pagePropsHelpers';

// This is the second page of the setup tour. It lets users connect to
// organizations. It will be shown if the user doesn't have any organization
// accounts attached to their user or account lists.
const ConnectPage = (): ReactElement => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Setup - Get Connected')}`}</title>
      </Head>
      <Connect />
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default ConnectPage;
