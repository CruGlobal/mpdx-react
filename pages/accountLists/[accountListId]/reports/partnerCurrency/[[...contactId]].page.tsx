import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { FourteenMonthReportCurrencyType } from '../../../../../graphql/types.generated';
import { FourteenMonthReport } from 'src/components/Reports/FourteenMonthReports/FourteenMonthReport';
import { suggestArticles } from 'src/lib/helpScout';
import { getQueryParam } from 'src/utils/queryParam';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { ContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/ContactsRightPanel';
import { ContactsPage } from '../../contacts/ContactsPage';

const PartnerCurrencyReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const PartnerCurrencyReportPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();
  const router = useRouter();
  const selectedContactId = getQueryParam(router.query, 'contactId');
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);

  useEffect(() => {
    suggestArticles('HS_REPORTS_SUGGESTIONS');
  }, []);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  const handleSelectContact = (contactId: string) => {
    router.push(
      `/accountLists/${accountListId}/reports/partnerCurrency/${contactId}`,
    );
  };

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Reports - Partner')}
        </title>
      </Head>
      {accountListId ? (
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
              <FourteenMonthReport
                accountListId={accountListId}
                designationAccounts={designationAccounts}
                currencyType={FourteenMonthReportCurrencyType.Donor}
                onSelectContact={handleSelectContact}
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Contributions by Partner Currency')}
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
        </PartnerCurrencyReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default PartnerCurrencyReportPage;
