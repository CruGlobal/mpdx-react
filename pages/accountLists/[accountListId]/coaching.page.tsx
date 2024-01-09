import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CoachingList } from 'src/components/Coaching/CoachingList';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const CoachingPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Coaching Accounts')}
        </title>
      </Head>
      {accountListId ? (
        <CoachingList accountListId={accountListId} />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default CoachingPage;
