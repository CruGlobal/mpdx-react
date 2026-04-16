import Head from 'next/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { PartnerRemindersReport } from 'src/components/Reports/MinistryPartnerReminders/PartnerRemindersReport';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { UserTypeAccess } from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const PartnerRemindersReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const PartnerRemindersReportPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();

  const [isNavListOpen, setIsNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports')} - ${t('Ministry Partner Reminders')}`}</title>
      </Head>
      <UserTypeAccess requireStaffAccount>
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
      </UserTypeAccess>
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;
export default PartnerRemindersReportPage;
