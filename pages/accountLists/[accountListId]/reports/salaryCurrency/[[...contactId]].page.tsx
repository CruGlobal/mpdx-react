import Head from 'next/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { TwelveMonthReport } from 'src/components/Reports/TwelveMonthReports/TwelveMonthReport';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import {
  ContactPanelProvider,
  useContactPanel,
} from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { TwelveMonthReportCurrencyType } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const SalaryCurrencyReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

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
    <SalaryCurrencyReportPageWrapper>
      <SidePanelsLayout
        isScrollBox={false}
        leftPanel={
          <MultiPageMenu
            isOpen={isNavListOpen}
            selectedId="salaryCurrency"
            onClose={handleNavListToggle}
            designationAccounts={designationAccounts}
            setDesignationAccounts={setDesignationAccounts}
            navType={NavTypeEnum.Reports}
          />
        }
        leftOpen={isNavListOpen}
        leftWidth="290px"
        mainContent={
          <TwelveMonthReport
            accountListId={accountListId}
            designationAccounts={designationAccounts}
            isNavListOpen={isNavListOpen}
            onNavListToggle={handleNavListToggle}
            title={t('Contributions by Salary Currency')}
            currencyType={TwelveMonthReportCurrencyType.Salary}
          />
        }
        rightPanel={isOpen ? <DynamicContactsRightPanel /> : undefined}
        rightOpen={isOpen}
        rightWidth="60%"
      />
    </SalaryCurrencyReportPageWrapper>
  ) : (
    <Loading loading />
  );
};

const SalaryCurrencyReportPage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports - Salary')}`}</title>
      </Head>
      <ContactPanelProvider>
        <PageContent />
      </ContactPanelProvider>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default SalaryCurrencyReportPage;
