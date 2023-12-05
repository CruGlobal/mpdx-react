import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import Loading from '../../../../src/components/Loading';
import FixMailingAddresses from '../../../../src/components/Tool/FixMailingAddresses/FixMailingAddresses';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const FixMailingAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Fix Mailing Addresses')}
        </title>
      </Head>
      {accountListId ? (
        <FixMailingAddresses accountListId={accountListId} />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default FixMailingAddressesPage;
