import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import Loading from '../../../../src/components/Loading';
import FixPhoneNumbers from '../../../../src/components/Tool/FixPhoneNumbers/FixPhoneNumbers';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const FixPhoneNumbersPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Fix Phone Numbers')}
        </title>
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
