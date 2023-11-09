import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import {
  AccountListType,
  CoachingDetail,
} from 'src/components/Coaching/CoachingDetail/CoachingDetail';
import { useAccountListId } from 'src/hooks/useAccountListId';
import Loading from 'src/components/Loading';

const CoachingPage: React.FC = () => {
  const { t } = useTranslation();
  const { query, isReady } = useRouter();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();
  const { coachingId } = query;

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Coaching Accounts')}
        </title>
      </Head>
      {accountListId && coachingId && isReady ? (
        <CoachingDetail
          accountListId={coachingId as string}
          accountListType={AccountListType.Coaching}
        />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default CoachingPage;
