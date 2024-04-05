import Head from 'next/head';
import React, { ReactElement, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import {
  AccountListTypeEnum,
  CoachingDetail,
} from 'src/components/Coaching/CoachingDetail/CoachingDetail';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { suggestArticles } from 'src/lib/helpScout';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const CoachingReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  useEffect(() => {
    suggestArticles('HS_REPORTS_SUGGESTIONS');
  }, []);

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Reports')} | {t('Coaching')}
        </title>
      </Head>
      {accountListId ? (
        <CoachingDetail
          accountListId={accountListId}
          accountListType={AccountListTypeEnum.Own}
        />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = loadSession;

export default CoachingReportPage;
