import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { MinisterHousingAllowanceReport } from 'src/components/Reports/MinisterHousingAllowance/MinisterHousingAllowance';
import { MinisterHousingAllowanceProvider } from 'src/components/Reports/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import {
  HeaderTypeEnum,
  MultiPageHeader,
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { UserTypeAccess } from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import { ReportPageWrapper } from 'src/components/Shared/styledComponents/ReportPageWrapper';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const MinisterHousingAllowancePage: React.FC = () => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const [isNavListOpen, setIsNavListOpen] = useState(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <UserTypeAccess requireStaffAccount>
      <>
        <Head>
          <title>{`${appName} | ${t("Reports - Minister's Housing Allowance")}`}</title>
        </Head>
        <ReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="mhaCalculator"
                onClose={handleNavListToggle}
                navType={NavTypeEnum.HrTools}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            headerHeight={multiPageHeaderHeight}
            mainContent={
              <>
                <MultiPageHeader
                  isNavListOpen={isNavListOpen}
                  onNavListToggle={handleNavListToggle}
                  title={t("Minister's Housing Allowance Request")}
                  headerType={HeaderTypeEnum.HrTools}
                />
                <MinisterHousingAllowanceProvider>
                  <MinisterHousingAllowanceReport />
                </MinisterHousingAllowanceProvider>
              </>
            }
          />
        </ReportPageWrapper>
      </>
    </UserTypeAccess>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default MinisterHousingAllowancePage;
