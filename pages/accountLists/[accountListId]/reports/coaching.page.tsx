import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import {
  AccountListTypeEnum,
  CoachingDetail,
} from 'src/components/Coaching/CoachingDetail/CoachingDetail';
import { suggestArticles } from 'src/lib/helpScout';

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

export default CoachingReportPage;
