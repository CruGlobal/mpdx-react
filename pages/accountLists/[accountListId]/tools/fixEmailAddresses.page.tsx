import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import { FixEmailAddresses } from '../../../../src/components/Tool/FixEmailAddresses/FixEmailAddresses';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const FixEmailAddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  return (
    <>
      <Head>
        <title>MPDX | {t('Fix Email Addresses')}</title>
      </Head>
      {accountListId ? (
        <FixEmailAddresses accountListId={accountListId} />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default FixEmailAddressesPage;
