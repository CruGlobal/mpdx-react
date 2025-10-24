import Head from 'next/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { MonthlyDonationSummaryReport } from 'src/components/Reports/MonthlyDonationSummary/MonthlyDonationSummaryReport';
import { NoStaffAccount } from 'src/components/Reports/Shared/NoStaffAccount/NoStaffAccount';
import { useStaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { useContactPanel } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const MonthlyDonationReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const MonthlyDonationReportPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const { isOpen } = useContactPanel();

  const { data: staffAccountData, loading } = useStaffAccountQuery();

  const [isNavListOpen, setIsNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports')} - ${t(
          '12-Month Donation Report',
        )}`}</title>
      </Head>
      {staffAccountData?.staffAccount?.id ? (
        <MonthlyDonationReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="monthlyDonation"
                onClose={handleNavListToggle}
                navType={NavTypeEnum.Reports}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <MonthlyDonationSummaryReport
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('12-Month Donation Summary')}
              />
            }
            rightPanel={isOpen ? <DynamicContactsRightPanel /> : undefined}
            rightOpen={isOpen}
            rightWidth="60%"
          />
        </MonthlyDonationReportPageWrapper>
      ) : loading ? (
        <Loading loading />
      ) : (
        <NoStaffAccount />
      )}
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;
export default MonthlyDonationReportPage;
