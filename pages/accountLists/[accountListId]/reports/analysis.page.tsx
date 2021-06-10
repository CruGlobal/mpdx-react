import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import { MonthlyActivity } from '../../../../src/components/Reports/DonationsReport/MonthlyActivityReport';
import { DonationsList } from '../../../../src/components/Reports/DonationsReport/DonationsReportTable';
import Loading from '../../../../src/components/Loading';

const PartnerGivingAnalysisReportPage = (): ReactElement => {
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
          MPDX | {t('Reports')} | {t('Partner Giving Analysis')}
        </title>
      </Head>
      {isReady && accountListId ? (
        <Box>
          <MonthlyActivity accountListId={accountListId} />
          <DonationsList accountListId={accountListId} />
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default PartnerGivingAnalysisReportPage;
