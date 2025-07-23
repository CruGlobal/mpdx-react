import Head from 'next/dist/shared/lib/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
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

  const { query } = useRouter();
  const [time, setTime] = useState(() => {
    if (typeof query.month === 'string') {
      const date = DateTime.fromISO(query.month);
      if (date.isValid) {
        return date.startOf('month');
      }
    }
    return DateTime.now().startOf('month');
  });

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
                accountId={accountListId}
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Staff Expense Report')}
                time={time}
                setTime={setTime}
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
