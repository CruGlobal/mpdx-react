import Head from 'next/head';
import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { ExpectedMonthlyTotalReport } from 'src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReport';
import { ExpectedMonthlyTotalReportHeader } from 'src/components/Reports/ExpectedMonthlyTotalReport/Header/ExpectedMonthlyTotalReportHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { ReportPageWrapper } from 'src/components/Shared/styledComponents/styledComponents';
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
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return accountListId ? (
    <ReportPageWrapper>
      <SidePanelsLayout
        isScrollBox={false}
        leftPanel={
          <MultiPageMenu
            isOpen={isNavListOpen}
            selectedId="expectedMonthlyTotal"
            onClose={handleNavListToggle}
            designationAccounts={designationAccounts}
            setDesignationAccounts={setDesignationAccounts}
            navType={NavTypeEnum.Reports}
          />
        }
        leftOpen={isNavListOpen}
        leftWidth="290px"
        mainContent={
          <ExpectedMonthlyTotalReport
            accountListId={accountListId}
            designationAccounts={designationAccounts}
            isNavListOpen={isNavListOpen}
            onNavListToggle={handleNavListToggle}
            title={t('Expected Monthly Total')}
          />
        }
        rightPanel={isOpen ? <DynamicContactsRightPanel /> : undefined}
        rightOpen={isOpen}
        rightWidth="60%"
      />
    </ReportPageWrapper>
  ) : (
    <>
      <ExpectedMonthlyTotalReportHeader
        empty={true}
        totalDonations={0}
        totalLikely={0}
        totalUnlikely={0}
        total={0}
        currency={''}
      />
      <Loading loading />
    </>
  );
};

const ExpectedMonthlyTotalReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {`${appName} | ${t('Reports')} | ${t('Expect Monthly Total')}`}
        </title>
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

export default ExpectedMonthlyTotalReportPage;
