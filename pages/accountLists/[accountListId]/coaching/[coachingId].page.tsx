import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  AccountListTypeEnum,
  CoachingDetail,
} from 'src/components/Coaching/CoachingDetail/CoachingDetail';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

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
          accountListType={AccountListTypeEnum.Coaching}
        />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default CoachingPage;
