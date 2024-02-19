import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import Loading from '../../../../src/components/Loading';
import { FixEmailAddresses } from '../../../../src/components/Tool/FixEmailAddresses/FixEmailAddresses';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const FixEmailAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Fix Email Addresses')}
        </title>
      </Head>
      {accountListId ? (
        <FixEmailAddresses accountListId={accountListId} />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = loadSession;

export default FixEmailAddressesPage;
