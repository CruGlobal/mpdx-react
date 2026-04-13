import Head from 'next/head';
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
import { UserTypeAccess } from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const StaffExpenseReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

export const StaffExpenseReportPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);
  const [isNavListOpen, setIsNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <UserTypeAccess requireStaffAccount>
      <>
        <Head>
          <title>{`${appName} | ${t('Reports')} | ${t(
            'Staff Expense Report',
          )}`}</title>
        </Head>
        <StaffExpenseReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="staffExpense"
                onClose={handleNavListToggle}
                designationAccounts={designationAccounts}
                setDesignationAccounts={setDesignationAccounts}
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
              />
            }
          />
        </StaffExpenseReportPageWrapper>
      </>
    </UserTypeAccess>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default StaffExpenseReportPage;
