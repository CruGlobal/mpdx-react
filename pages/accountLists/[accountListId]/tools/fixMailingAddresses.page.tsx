import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixMailingAddresses from '../../../../src/components/Tool/FixMailingAddresses/FixMailingAddresses';
import { useAccountListId } from 'src/hooks/useAccountListId';
import Loading from 'src/components/Loading';

const FixMailingAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  return (
    <>
      <Head>
        <title>MPDX | {t('Fix Mailing Addresses')}</title>
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
