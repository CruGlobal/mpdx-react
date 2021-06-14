import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { PartnerGivingAnalysisReportFilters } from '../../../../src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysisReportFilters';
import { PartnerGivingAnalysisReportTable } from '../../../../src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysisReportTable';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const PartnerGivingAnalysisReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('Partner Giving Analysis')}
        </title>
      </Head>
      {accountListId ? (
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
