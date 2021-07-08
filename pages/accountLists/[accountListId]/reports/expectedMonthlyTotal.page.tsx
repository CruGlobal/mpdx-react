import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReport } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReport';
import { ExpectedMonthlyTotalReportHeader } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/Header/ExpectedMonthlyTotalReportHeader';
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
        <ExpectedMonthlyTotalReport
          accountListId={accountListId}
        ></ExpectedMonthlyTotalReport>
      ) : (
        <Box>
          <ExpectedMonthlyTotalReportHeader empty={true} />
          <Loading loading />
        </Box>
      )}
    </>
  );
};

export default ExpectedMonthlyTotalReportPage;
