import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import Loading from 'src/components/Loading';
import FixPhoneNumbers from 'src/components/Tool/FixPhoneNumbers/FixPhoneNumbers';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

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

export const getServerSideProps = loadSession;

export default FixPhoneNumbersPage;
