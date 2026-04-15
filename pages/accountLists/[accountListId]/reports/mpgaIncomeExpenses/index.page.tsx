import Head from 'next/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { MPGAIncomeExpensesReport } from 'src/components/Reports/MPGAIncomeExpensesReport/MPGAIncomeExpensesReport';
import { useStaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import { LimitedAccess } from 'src/components/Shared/LimitedAccess/LimitedAccess';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const MPGAReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const MPGAReportPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();

  const { data: staffAccountData, loading } = useStaffAccountQuery();

  const [isNavListOpen, setIsNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports')} - ${t(
          'MPGA Monthly Report',
        )}`}</title>
      </Head>
      {staffAccountData?.staffAccount?.id ? (
        <MPGAReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="mpgaIncomeExpenses"
                onClose={handleNavListToggle}
                navType={NavTypeEnum.Reports}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <MPGAIncomeExpensesReport
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Ministry Partner Giving Analysis')}
              />
            }
          />
        </MPGAReportPageWrapper>
      ) : loading ? (
        <Loading loading />
      ) : (
        <LimitedAccess noStaffAccount />
      )}
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default MPGAReportPage;
