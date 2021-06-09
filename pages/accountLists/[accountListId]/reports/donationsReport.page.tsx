import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { useApp } from '../../../../src/components/App';

const DonationsReportPage = (): ReactElement => {
  const { dispatch } = useApp();
  const { t } = useTranslation();
  const router = useRouter();

  /*useEffect(() => {
    dispatch({ type: 'updateBreadcrumb', breadcrumb: t('Tasks') });
    dispatch({
      type: 'updateAccountListId',
      accountListId: router.query.accountListId?.toString() ?? '',
    });
  }, []);*/

  return (
    <>
      <Head>
        <title>MPDX | {t('Reports')}</title>
      </Head>
    </>
  );
};

export default DonationsReportPage;
