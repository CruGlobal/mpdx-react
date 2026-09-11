import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { StaffExpenseReport } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
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

const StaffExpenseReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

export const StaffExpenseReportPage: React.FC = () => {
  const appName = getAppName();
  const { t } = useTranslation();
  const [isNavListOpen, setIsNavListOpen] = useState<boolean>(false);
  const { query } = useRouter();
  const staffAccountId = getQueryParam(query, 'staffAccountId');
  // A blank person number is a request for somebody else, which the API denies.
  // Only a missing one falls back to your own HCM record.
  const personNumber = getQueryParam(query, 'personNumber') || undefined;

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports')} | ${t(
          'Staff Expense Report',
        )}`}</title>
      </Head>
      <UserTypeAccess
        requireStaffAccount={!staffAccountId}
        requireUserGroups={
          staffAccountId ? RequiredUserGroupEnum.MpdSupervisor : undefined
        }
      >
        <StaffExpenseReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="staffExpense"
                onClose={handleNavListToggle}
                navType={NavTypeEnum.Reports}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <StaffExpenseReport
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Staff Expense Report')}
                staffAccountId={staffAccountId ?? null}
                personNumber={personNumber}
              />
            }
          />
        </StaffExpenseReportPageWrapper>
      </UserTypeAccess>
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default StaffExpenseReportPage;
