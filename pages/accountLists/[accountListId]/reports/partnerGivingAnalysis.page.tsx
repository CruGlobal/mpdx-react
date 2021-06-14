import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import { PartnerGivingAnalysisReportFilters } from '../../../../src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysisReportFilters';
import { PartnerGivingAnalysisReportTable } from '../../../../src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysisReportTable';
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
        <Box height="100vh" display="flex" overflow-y="scroll">
          <Box width="290px">
            <PartnerGivingAnalysisReportFilters accountListId={accountListId} />
          </Box>

          <Box flex={1}>
            <PartnerGivingAnalysisReportTable accountListId={accountListId} />
          </Box>
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default PartnerGivingAnalysisReportPage;
