import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockImpersonation } from 'pages/api/utils/pagePropsHelpers';
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
import { ImpersonationArea } from 'src/lib/impersonationAccess';
import { getQueryParam } from 'src/lib/queryParam';

const MPGAReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const MPGAReportPage: React.FC = () => {
  const appName = getAppName();
  const { t } = useTranslation();
  const { query } = useRouter();
  // A blank param is a request for somebody else, which the API denies.
  // Only a missing one falls back to your own account and HCM record.
  const staffAccountId = getQueryParam(query, 'staffAccountId') || undefined;
  const personNumber = getQueryParam(query, 'personNumber') || undefined;

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
              <MPGAIncomeExpensesReportProvider
                staffAccountId={staffAccountId}
                personNumber={personNumber}
              >
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

export const getServerSideProps = blockImpersonation(
  ImpersonationArea.MpgaIncomeExpenses,
);
export default MPGAReportPage;
