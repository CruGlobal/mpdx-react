import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { DonationsReport } from 'src/components/Reports/DonationsReport/DonationsReport';
import Loading from 'src/components/Loading';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { NavReportsList } from 'src/components/Reports/NavReportsList/NavReportsList';
import { getQueryParam } from 'src/utils/queryParam';
import { ContactsPageProvider } from '../../contacts/ContactsPageContext';
import { ContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/ContactsRightPanel';

const DonationsReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const DonationsReportPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId();
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);

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
          MPDX | {t('Reports')} | {t('Donations')}
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
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <DonationsReport
                accountListId={accountListId}
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                onSelectContact={handleSelectContact}
                title={t('Donations')}
              />
            }
            rightPanel={
              selectedContactId ? (
                <ContactsPageProvider>
                  <ContactsRightPanel onClose={() => handleSelectContact('')} />
                </ContactsPageProvider>
              ) : undefined
            }
            rightOpen={typeof selectedContactId !== 'undefined'}
          />
        </DonationsReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default DonationsReportPage;
