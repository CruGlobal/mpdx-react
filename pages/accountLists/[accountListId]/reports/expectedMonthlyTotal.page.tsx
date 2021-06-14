import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReportHeader } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReportHeader';
import { ExpectedMonthlyTotalReportTable } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReportTable';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const ExpectedMonthlyTotalReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('Expect Monthly Total')}
        </title>
      </Head>
      {accountListId ? (
        <Box>
          <ExpectedMonthlyTotalReportHeader accountListId={accountListId} />
          <ExpectedMonthlyTotalReportTable accountListId={accountListId} />
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default ExpectedMonthlyTotalReportPage;
