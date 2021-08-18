import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReportHeader } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/Header/ExpectedMonthlyTotalReportHeader';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { ExpectedMonthlyTotalReport } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReport';

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
          <ExpectedMonthlyTotalReportHeader
            empty={true}
            totalDonations={0}
            totalLikely={0}
            totalUnlikely={0}
            total={0}
            currency={''}
          />
          <Loading loading />
        </Box>
      )}
    </>
  );
};

export default ExpectedMonthlyTotalReportPage;
