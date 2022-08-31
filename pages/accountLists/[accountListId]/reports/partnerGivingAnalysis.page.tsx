import React, { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box, styled } from '@mui/material';
import { PartnerGivingAnalysisReport } from 'src/components/Reports/PartnerGivingAnalysisReport/PartnerGivingAnalysisReport';

import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';

import { NavReportsList } from 'src/components/Reports/NavReportsList/NavReportsList';

const PartnerGivingAnalysisReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const PartnerGivingAnalysisReportPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('Partner Giving Analysis')}
        </title>
      </Head>
      {accountListId ? (
        <PartnerGivingAnalysisReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <NavReportsList
                isOpen={isNavListOpen}
                selectedId="designationAccounts"
                onClose={handleNavListToggle}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <PartnerGivingAnalysisReport
                accountListId={accountListId}
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Partner Giving Analysis Report')}
              />
            }
          />
        </PartnerGivingAnalysisReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default PartnerGivingAnalysisReportPage;
