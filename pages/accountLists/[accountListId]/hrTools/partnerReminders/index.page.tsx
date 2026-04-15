import Head from 'next/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { PartnerRemindersReport } from 'src/components/Reports/MinistryPartnerReminders/PartnerRemindersReport';
import { useStaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import { LimitedAccess } from 'src/components/Shared/LimitedAccess/LimitedAccess';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const PartnerRemindersReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const PartnerRemindersReportPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();
  const { data: staffAccountData, loading } = useStaffAccountQuery();

  const [isNavListOpen, setIsNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports')} - ${t('Ministry Partner Reminders')}`}</title>
      </Head>
      {staffAccountData?.staffAccount?.id ? (
        <PartnerRemindersReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="partnerReminders"
                onClose={handleNavListToggle}
                navType={NavTypeEnum.HrTools}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <PartnerRemindersReport
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Ministry Partner Reminders')}
              />
            }
          />
        </PartnerRemindersReportPageWrapper>
      ) : loading ? (
        <Loading loading />
      ) : (
        <LimitedAccess noStaffAccount />
      )}
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default PartnerRemindersReportPage;
