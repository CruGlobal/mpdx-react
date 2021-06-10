import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import PageHeading from '../../../../src/components/PageHeading';
import { DesignationAccountsReportTable } from '../../../../src/components/Reports/DesignationAccountsReport/DesignationAccountsReportTable';
import Loading from '../../../../src/components/Loading';

const DesignationAccountsReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const { query, isReady } = useRouter();

  const { accountListId } = query;

  if (Array.isArray(accountListId)) {
    throw new Error('accountListId should not be an array');
  }

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('Designation Accounts')}
        </title>
      </Head>
      {isReady && accountListId ? (
        <Box>
          <PageHeading heading={t('Designation Accounts')} />
          <DesignationAccountsReportTable accountListId={accountListId} />
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default DesignationAccountsReportPage;
