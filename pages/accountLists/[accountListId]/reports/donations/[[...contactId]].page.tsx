import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { DonationsReport } from 'src/components/Reports/DonationsReport/DonationsReport';
import Loading from 'src/components/Loading';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { NavReportsList } from 'src/components/Reports/NavReportsList/NavReportsList';
import { getQueryParam } from 'src/utils/queryParam';
import { ContactsPage } from '../../contacts/ContactsPage';
import { ContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/ContactsRightPanel';
import { suggestArticles } from 'src/lib/helpScout';

const DonationsReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const DonationsReportPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);

  useEffect(() => {
    suggestArticles('HS_REPORTS_SUGGESTIONS');
  }, []);

  const selectedContactId = getQueryParam(router.query, 'contactId');

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  const handleSelectContact = (contactId: string) => {
    router.push(
      `/accountLists/${accountListId}/reports/donations/${contactId}`,
    );
  };

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Reports')} | {t('Donations')}
        </title>
      </Head>
      {accountListId ? (
        <DonationsReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <NavReportsList
                isOpen={isNavListOpen}
                selectedId="donations"
                onClose={handleNavListToggle}
                designationAccounts={designationAccounts}
                setDesignationAccounts={setDesignationAccounts}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <DonationsReport
                accountListId={accountListId}
                designationAccounts={designationAccounts}
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                onSelectContact={handleSelectContact}
                title={t('Donations')}
              />
            }
            rightPanel={
              selectedContactId ? (
                <ContactsPage>
                  <ContactsRightPanel onClose={() => handleSelectContact('')} />
                </ContactsPage>
              ) : undefined
            }
            rightOpen={typeof selectedContactId !== 'undefined'}
            rightWidth="60%"
          />
        </DonationsReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default DonationsReportPage;
