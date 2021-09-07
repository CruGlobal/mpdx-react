import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixMailingAddresses from '../../../../src/components/Tool/FixMailingAddresses/FixMailingAddresses';

const fixMailingAddresses = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('MPDX | Fix Mailing Addresses')}</title>
      </Head>
      <FixMailingAddresses />
    </>
  );
};

export default fixMailingAddresses;
