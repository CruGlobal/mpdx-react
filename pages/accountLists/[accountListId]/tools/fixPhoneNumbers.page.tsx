import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixPhoneNumbers from '../../../../src/components/Tool/FixPhoneNumbers/FixPhoneNumbers';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import Loading from '../../../../src/components/Loading';

const FixPhoneNumbersPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <>
      <Head>
        <title>MPDX | {t('Fix Phone Numbers')}</title>
      </Head>
      {accountListId ? (
        <FixPhoneNumbers accountListId={accountListId} />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default FixPhoneNumbersPage;
