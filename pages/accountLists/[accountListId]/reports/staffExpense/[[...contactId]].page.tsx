import Head from 'next/dist/shared/lib/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { StaffExpenseReport } from 'src/components/Reports/StaffExpenseReport/StaffExpenseReport';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useContactLinks } from 'src/hooks/useContactLinks';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { getQueryParam } from 'src/utils/queryParam';
import { ContactsWrapper } from '../../contacts/ContactsWrapper';

const StaffExpenseReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const StaffExpenseReportPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const router = useRouter();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);
  const [isNavListOpen, setIsNavListOpen] = useState<boolean>(false);
  const selectedContactId = getQueryParam(router.query, 'contactId');

  const { handleCloseContact } = useContactLinks({
    url: `/accountLists/${accountListId}/reports/staffExpense/`,
  });

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports')} | ${t('Staff Expenses')}`}</title>
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
                accountListId={accountListId}
                designationAccounts={designationAccounts}
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Staff Expenses')}
              />
            }
            rightPanel={
              selectedContactId ? (
                <ContactsWrapper>
                  <DynamicContactsRightPanel onClose={handleCloseContact} />
                </ContactsWrapper>
              ) : undefined
            }
            rightOpen={typeof selectedContactId !== 'undefined'}
            rightWidth="60%"
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
