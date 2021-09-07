import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixPhoneNumbers from '../../../../src/components/Tool/FixPhoneNumbers/FixPhoneNumbers';

const fixPhoneNumbers = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('MPDX | Fix Phone Numbers')}</title>
      </Head>
      <FixPhoneNumbers />
    </>
  );
};

export default fixPhoneNumbers;
