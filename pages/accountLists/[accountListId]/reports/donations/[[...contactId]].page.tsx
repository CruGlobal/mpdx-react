import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { DonationsReport } from 'src/components/Reports/DonationsReport/DonationsReport';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { ReportPageWrapper } from 'src/components/Shared/styledComponents/ReportPageWrapper';
import {
  ContactPanelProvider,
  useContactPanel,
} from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const PageContent: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { isOpen } = useContactPanel();
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return accountListId ? (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={
        <MultiPageMenu
          isOpen={isNavListOpen}
          selectedId="donations"
          onClose={handleNavListToggle}
          designationAccounts={designationAccounts}
          setDesignationAccounts={setDesignationAccounts}
          navType={NavTypeEnum.Reports}
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
          title={t('Donations')}
        />
      }
      rightPanel={isOpen ? <DynamicContactsRightPanel /> : undefined}
      rightOpen={isOpen}
      rightWidth="60%"
    />
  ) : (
    <Loading loading />
  );
};

const DonationsReportPage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports')} | ${t('Donations')}`}</title>
      </Head>
      <ReportPageWrapper>
        <ContactPanelProvider>
          <PageContent />
        </ContactPanelProvider>
      </ReportPageWrapper>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default DonationsReportPage;
