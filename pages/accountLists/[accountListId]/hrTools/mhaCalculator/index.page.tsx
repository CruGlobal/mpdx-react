import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { MinisterHousingAllowanceReport } from 'src/components/HrTools/MinisterHousingAllowance/MinisterHousingAllowance';
import { MinisterHousingAllowanceProvider } from 'src/components/HrTools/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import {
  HeaderTypeEnum,
  MultiPageHeader,
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import {
  RequiredUserGroupEnum,
  UserTypeAccess,
} from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import { ReportPageWrapper } from 'src/components/Shared/styledComponents/ReportPageWrapper';
import { getAppName } from 'src/lib/getAppName';

const MinisterHousingAllowancePage: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const [isNavListOpen, setIsNavListOpen] = useState(false);

  const handleNavListToggle = () => {
    setIsNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('HR Tools | MHA Calculation Tool')}`}</title>
      </Head>
      <UserTypeAccess
        requireStaffAccount
        requireUserGroups={RequiredUserGroupEnum.Mha}
      >
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
                  title={t("Minister's Housing Allowance Calculation Tool")}
                  headerType={HeaderTypeEnum.HrTools}
                />
                <MinisterHousingAllowanceProvider>
                  <MinisterHousingAllowanceReport />
                </MinisterHousingAllowanceProvider>
              </>
            }
          />
        </ReportPageWrapper>
      </UserTypeAccess>
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default MinisterHousingAllowancePage;
