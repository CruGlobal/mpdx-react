import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixMailingAddresses from '../../../../src/components/Tool/FixMailingAddresses/FixMailingAddresses';

const FixMailingAddressesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('Fix Mailing Addresses')}</title>
      </Head>
      <FixMailingAddresses />
    </>
  );
};

export default FixMailingAddressesPage;
