import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { MPGAIncomeExpensesReportProvider } from 'src/components/Reports/MPGAIncomeExpensesReport/MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import { MPGAIncomeExpensesReport } from 'src/components/Reports/MPGAIncomeExpensesReport/MPGAIncomeExpensesReport';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import {
  RequiredUserGroupEnum,
  UserTypeAccess,
} from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import { getAppName } from 'src/lib/getAppName';
import { getQueryParam } from 'src/lib/queryParam';

const MPGAReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const MPGAReportPage: React.FC = () => {
  const appName = getAppName();
  const { t } = useTranslation();
  const { query } = useRouter();
  const staffAccountId = getQueryParam(query, 'staffAccountId');

  const [isNavListOpen, setIsNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports')} | ${t(
          'Income/Expense Analysis',
        )}`}</title>
      </Head>
      <UserTypeAccess
        requireStaffAccount={!staffAccountId}
        requireUserGroups={
          staffAccountId ? RequiredUserGroupEnum.MpdSupervisor : undefined
        }
      >
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
              <MPGAIncomeExpensesReportProvider staffAccountId={staffAccountId}>
                <MPGAIncomeExpensesReport
                  isNavListOpen={isNavListOpen}
                  onNavListToggle={handleNavListToggle}
                  title={t('Ministry Partner Giving Analysis')}
                />
              </MPGAIncomeExpensesReportProvider>
            }
          />
        </MPGAReportPageWrapper>
      </UserTypeAccess>
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default MPGAReportPage;
