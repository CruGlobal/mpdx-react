import Head from 'next/head';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import {
  AccountListTypeEnum,
  CoachingDetail,
} from 'src/components/Coaching/CoachingDetail/CoachingDetail';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const CoachingReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports')} | ${t('Coaching')}`}</title>
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

export const getServerSideProps = ensureSessionAndAccountList;

export default CoachingReportPage;
