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

const PartnerCurrencyReportPageWrapper = styled(Box)(({ theme }) => ({
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
    <PartnerCurrencyReportPageWrapper>
      <SidePanelsLayout
        isScrollBox={false}
        leftPanel={
          <MultiPageMenu
            isOpen={isNavListOpen}
            selectedId="partnerCurrency"
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
            currencyType={TwelveMonthReportCurrencyType.Donor}
            isNavListOpen={isNavListOpen}
            onNavListToggle={handleNavListToggle}
            title={t('Contributions by Partner Currency')}
          />
        }
        rightPanel={isOpen ? <DynamicContactsRightPanel /> : undefined}
        rightOpen={isOpen}
        rightWidth="60%"
      />
    </PartnerCurrencyReportPageWrapper>
  ) : (
    <Loading loading />
  );
};

const PartnerCurrencyReportPage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports - Partner')}`}</title>
      </Head>
      <ContactPanelProvider>
        <PageContent />
      </ContactPanelProvider>
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default PartnerCurrencyReportPage;
