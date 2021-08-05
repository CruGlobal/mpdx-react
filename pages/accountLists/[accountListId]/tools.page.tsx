import React, { ReactElement, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { makeStyles } from '@material-ui/core';
import { useApp } from '../../../src/components/App';
import ToolHome from 'src/components/Tool/Home/Home';

const ToolsPage = (): ReactElement => {
  const { dispatch } = useApp();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    dispatch({ type: 'updateBreadcrumb', breadcrumb: t('Tools') });
    dispatch({
      type: 'updateAccountListId',
      accountListId: router.query.accountListId?.toString() ?? '',
    });
  }, []);

  return (
    <>
      <Head>
        <title>MPDX | {t('Tools')}</title>
      </Head>
      <ToolHome />
    </>
  );
};

export default ToolsPage;
