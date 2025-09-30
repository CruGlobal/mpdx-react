import Head from 'next/dist/shared/lib/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { StaffExpenseReport } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const StaffExpenseReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const StaffExpenseReportPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);
  const [isNavListOpen, setIsNavListOpen] = useState<boolean>(false);

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
      {accountListId ? (
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
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;
export default StaffExpenseReportPage;
