import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixEmailAddresses from '../../../../src/components/Tool/FixEmailAddresses/FixEmailAddreses';

const FixEmailAddressesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('Fix Email Addresses')}</title>
      </Head>
      <FixEmailAddresses />
    </>
  );
};

export default FixEmailAddressesPage;
