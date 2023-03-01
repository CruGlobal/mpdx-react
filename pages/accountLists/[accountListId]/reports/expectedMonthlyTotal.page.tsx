import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { ExpectedMonthlyTotalReportHeader } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/Header/ExpectedMonthlyTotalReportHeader';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { ExpectedMonthlyTotalReport } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReport';
import { suggestArticles } from 'src/lib/helpScout';

const ExpectedMonthlyTotalReportPage = (): ReactElement => {
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
          {appName} | {t('Reports')} | {t('Expect Monthly Total')}
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
