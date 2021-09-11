import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixPhoneNumbers from '../../../../src/components/Tool/FixPhoneNumbers/FixPhoneNumbers';

const FixPhoneNumbersPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('Fix Phone Numbers')}</title>
      </Head>
      <FixPhoneNumbers />
    </>
  );
};

export default FixPhoneNumbersPage;
