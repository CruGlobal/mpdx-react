import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { CoachingList } from 'src/components/Coaching/CoachingList';
import { useAccountListId } from 'src/hooks/useAccountListId';
import Loading from 'src/components/Loading';

const CoachingPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { query, push, replace, isReady, pathname } = useRouter();

  return (
    <>
      <Head>
        <title>MPDX | {t('Coaching Accounts')}</title>
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
